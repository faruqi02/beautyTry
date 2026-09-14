/**
 * Unified CRUD & Media Storage API for beautytry_database
 * Handles sheets: product_data, user_data, user_snapshots, system_log
 * Media storage: Google Drive app_storage folder
 */

const ROOT_STORAGE_ID = "1Sd51IwU44bESiGhUz_aWldWg9Zi4oKD5";

function jsonResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify({ status: status, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// HELPER: System Activity Logger
// -------------------------------------------------------------
function writeSystemLog(performedBy, action, targetTable, targetId, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName("system_log");
    if (!logSheet) return;

    const logId = Utilities.getUuid();
    const now = new Date().toISOString();
    logSheet.appendRow([
      logId, 
      now, 
      performedBy || "system", 
      action, 
      targetTable, 
      String(targetId), 
      JSON.stringify(details || {}), 
      ""
    ]);
  } catch (err) {
    console.error("Failed to write system log: " + err);
  }
}

// -------------------------------------------------------------
// HELPER: Recursive Folder Resolution & Image Saving
// -------------------------------------------------------------
function saveBase64Image(folderPathArray, base64Data, fileName) {
  let currentFolder;
  let step = "getFolderById";
  try {
    currentFolder = DriveApp.getFolderById(ROOT_STORAGE_ID);
    
    for (let i = 0; i < folderPathArray.length; i++) {
      const segment = folderPathArray[i];
      step = "getFoldersByName: " + segment;
      const subFolders = currentFolder.getFoldersByName(segment);
      if (subFolders.hasNext()) {
        step = "select existing folder: " + segment;
        currentFolder = subFolders.next();
      } else {
        step = "createFolder: " + segment;
        currentFolder = currentFolder.createFolder(segment);
      }
    }

    step = "decodeBase64";
    const cleanedBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, "");
    const decodedBytes = Utilities.base64Decode(cleanedBase64);
    const blob = Utilities.newBlob(decodedBytes, "image/jpeg", fileName);

    step = "createFile";
    const file = currentFolder.createFile(blob);
    
    try {
      step = "setSharing";
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingErr) {
      console.error("Could not set sharing permissions: " + sharingErr);
    }

    return {
      fileId: file.getId(),
      directUrl: "https://lh3.googleusercontent.com/d/" + file.getId()
    };
  } catch (err) {
    throw new Error("Access Denied at step [" + step + "]. Original error: " + err.toString());
  }
}  


// -------------------------------------------------------------
// GET API (Fetch table rows or single row by ID)
// -------------------------------------------------------------
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
    const filterUserId = e.parameter.user_id ? String(e.parameter.user_id) : null;
    const result = [];

    for (let i = 1; i < rows.length; i++) {
      let rowData = {};
      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = rows[i][j];
      }

      // Exact row by primary ID (column A)
      if (targetId) {
        if (String(rowData[headers[0]]) === targetId) {
          return jsonResponse(rowData);
        }
      } 
      // Filter snapshots/logs by user_id if requested
      else if (filterUserId) {
        if (String(rowData["user_id"]) === filterUserId) {
          result.push(rowData);
        }
      } 
      else {
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

// -------------------------------------------------------------
// POST API (upload_image, create, update, delete)
// -------------------------------------------------------------
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = (payload.action || "").toLowerCase();
    const actor = payload.performed_by || "system";
    const nowIso = new Date().toISOString();

    // --- 1. ACTION: UPLOAD_IMAGE ---
    if (action === "upload_image") {
      const type = payload.type; // "products", "users", or "snapshots"
      const entityId = String(payload.entity_id);
      const base64Data = payload.image_base64;
      const fileName = payload.file_name || (type + "_" + entityId + "_" + new Date().getTime() + ".jpg");

      if (!type || !entityId || !base64Data) {
        return jsonResponse({ error: "Missing type, entity_id, or image_base64" }, 400);
      }

      let folderPath = [];
      if (type === "products") {
        folderPath = ["products", "p_" + entityId];
      } else if (type === "users") {
        folderPath = ["users", "u_" + entityId];
      } else if (type === "snapshots") {
        folderPath = ["snapshots", "u_" + entityId];
      } else {
        return jsonResponse({ error: "Invalid upload type. Expected 'products', 'users', or 'snapshots'" }, 400);
      }

      const uploadResult = saveBase64Image(folderPath, base64Data, fileName);

      writeSystemLog(actor, "UPLOAD_IMAGE", type, entityId, { file_id: uploadResult.fileId });

      return jsonResponse({
        message: "Image uploaded successfully",
        file_id: uploadResult.fileId,
        url: uploadResult.directUrl
      });
    }

    // --- VALIDATION FOR SHEET OPERATIONS ---
    const sheetName = payload.sheet;
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

    // --- 2. ACTION: CREATE ---
    if (action === "create") {
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
        return payload.data && payload.data[header] !== undefined ? payload.data[header] : "";
      });

      sheet.appendRow(newRow);

      if (sheetName !== "system_log") {
        writeSystemLog(actor, "CREATE", sheetName, newId, payload.data);
      }

      return jsonResponse({ message: "Created successfully", id: newId });
    }

    // --- 3. ACTION: UPDATE ---
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
            } else if (header !== headers[0] && header !== "created_at" && payload.data && payload.data[header] !== undefined) {
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

    // --- 4. ACTION: DELETE ---
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

    return jsonResponse({ error: "Invalid action. Supported: upload_image, create, update, delete" }, 400);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}