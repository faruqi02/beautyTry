/**
 * Generic CRUD Web API for beautytry_database
 * Sheets supported: product_data, user_data, system_log
 */

function jsonResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify({ status: status, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Automatic system logger helper
function writeSystemLog(performedBy, action, targetTable, targetId, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName("system_log");
    if (!logSheet) return;

    const logId = Utilities.getUuid();
    const now = new Date().toISOString();
    logSheet.appendRow([logId, now, performedBy || "system", action, targetTable, targetId, JSON.stringify(details), ""]);
  } catch (err) {
    console.error("Failed to write system log: " + err);
  }
}

// 1. GET (Read all rows or fetch a single row by ID)
function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheetName = e.parameter.sheet;
    if (!sheetName) {
      return jsonResponse({ error: "Missing query parameter 'sheet'" }, 400);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ error: "Sheet '" + sheetName + "' not found" }, 404);
    }

    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return jsonResponse([]);
    }

    const headers = rows[0];
    const targetId = e.parameter.id ? String(e.parameter.id) : null;
    const result = [];

    for (let i = 1; i < rows.length; i++) {
      let rowData = {};
      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = rows[i][j];
      }

      if (targetId) {
        // Compare against the first column (id or log_id)
        if (String(rowData[headers[0]]) === targetId) {
          return jsonResponse(rowData);
        }
      } else {
        result.push(rowData);
      }
    }

    if (targetId) {
      return jsonResponse({ error: "Record not found" }, 404);
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

// 2. POST (Create, Update, Delete)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = (payload.action || "").toLowerCase();
    const sheetName = payload.sheet;
    const actor = payload.performed_by || "system";

    if (!sheetName) {
      return jsonResponse({ error: "Missing required 'sheet' attribute" }, 400);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ error: "Sheet '" + sheetName + "' not found" }, 404);
    }

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const nowIso = new Date().toISOString();

    // --- ACTION: CREATE ---
    if (action === "create") {
      // Find max integer ID in column A
      let maxId = 0;
      for (let i = 1; i < rows.length; i++) {
        let currentId = parseInt(rows[i][0], 10);
        if (!isNaN(currentId) && currentId > maxId) {
          maxId = currentId;
        }
      }
      const newId = maxId + 1;

      const newRow = headers.map(header => {
        if (header === "id" || header === "log_id") return newId;
        if (header === "created_at") return nowIso;
        if (header === "updated_at") return nowIso;
        return payload.data[header] !== undefined ? payload.data[header] : "";
      });

      sheet.appendRow(newRow);

      // Auto-log to system_log
      if (sheetName !== "system_log") {
        writeSystemLog(actor, "CREATE", sheetName, newId, payload.data);
      }

      return jsonResponse({ message: "Created successfully", id: newId });
    }

    // --- ACTION: UPDATE ---
    if (action === "update") {
      if (!payload.id) {
        return jsonResponse({ error: "Missing required 'id' for update" }, 400);
      }

      const targetId = String(payload.id);
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          const rowNum = i + 1;

          headers.forEach((header, colIdx) => {
            if (header === "updated_at") {
              sheet.getRange(rowNum, colIdx + 1).setValue(nowIso);
            } else if (header !== headers[0] && header !== "created_at" && payload.data[header] !== undefined) {
              sheet.getRange(rowNum, colIdx + 1).setValue(payload.data[header]);
            }
          });

          if (sheetName !== "system_log") {
            writeSystemLog(actor, "UPDATE", sheetName, targetId, payload.data);
          }

          return jsonResponse({ message: "Updated successfully", id: payload.id });
        }
      }
      return jsonResponse({ error: "Record not found" }, 404);
    }

    // --- ACTION: DELETE ---
    if (action === "delete") {
      if (!payload.id) {
        return jsonResponse({ error: "Missing required 'id' for delete" }, 400);
      }

      const targetId = String(payload.id);
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          sheet.deleteRow(i + 1);

          if (sheetName !== "system_log") {
            writeSystemLog(actor, "DELETE", sheetName, targetId, {});
          }

          return jsonResponse({ message: "Deleted successfully", id: payload.id });
        }
      }
      return jsonResponse({ error: "Record not found" }, 404);
    }

    return jsonResponse({ error: "Invalid action. Supported: create, update, delete" }, 400);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}