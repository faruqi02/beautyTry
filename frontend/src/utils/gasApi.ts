export const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwN76rUC8siFTm5vJ7OOgQgtgL9NVJSDzDAmaUZbnUbmAiOfVKtW8wRE26wMVevVCR3UQ/exec";

/**
 * Unified fetch wrapper handling GAS redirects and CORS quirks.
 * Uses a plain text POST to bypass CORS preflight issues with Google Apps Script.
 */
export async function callGasApi(method = "GET", params: Record<string, string> = {}, payload: any = null) {
  let url = GAS_API_URL;
  const options: RequestInit = { method: method };

  if (method === "GET") {
    const query = new URLSearchParams(params).toString();
    if (query) url += `?${query}`;
  } else if (method === "POST") {
    // Avoid OPTIONS preflight check by not setting application/json header
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(url, options);
  console.log("GAS Response Status:", response.status);
  if (!response.ok) {
    const text = await response.text();
    console.error("GAS Error Text:", text);
    throw new Error(`HTTP error! status: ${response.status} - ${text}`);
  }
  const data = await response.json();
  console.log("GAS Response Data:", data);
  return data;
}

/**
 * Convert HTML5 File Object (from <input type="file">) to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Helper specifically for uploading images to the GAS backend.
 * 
 * @param type "products", "users", or "snapshots"
 * @param entityId The ID of the user or product
 * @param file The HTML5 File object to upload
 */
export async function uploadImageToGas(type: "products" | "users" | "snapshots", entityId: string | number, file: File) {
  const base64Data = await fileToBase64(file);
  
  const payload = {
    action: "upload_image",
    type: type,
    entity_id: entityId,
    file_name: file.name,
    image_base64: base64Data
  };

  return await callGasApi("POST", {}, payload);
}

