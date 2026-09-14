import httpx
from typing import Optional, Union, Any
from config import GOOGLE_SCRIPT_URL

async def fetch_sheet_data(sheet_name: str, item_id: Optional[str] = None) -> Any:
    """
    Sends a GET request to the Google Script to retrieve data from a specific sheet.
    """
    params = {"sheet": sheet_name}
    if item_id:
        params["id"] = item_id

    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        response = await client.get(GOOGLE_SCRIPT_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("data") if isinstance(data, dict) and "data" in data else data

async def post_sheet_action(sheet_name: str, action: str, data: Optional[dict] = None, item_id: Optional[Union[str, int]] = None, actor: str = "system") -> Any:
    """
    Sends a POST request to create, update, or delete records in the Google Sheet.
    """
    payload = {
        "sheet": sheet_name,
        "action": action,
        "performed_by": actor,
    }
    
    if item_id is not None:
        payload["id"] = item_id
    if data is not None:
        payload["data"] = data

    # For POST, Google Apps Script returns a 302 redirect. We don't need to follow it
    # because the action has already been performed. Following it causes httpx to hang.
    async with httpx.AsyncClient(follow_redirects=False, timeout=10.0) as client:
        response = await client.post(GOOGLE_SCRIPT_URL, json=payload)
        
        # Google Apps Script uses 302 for successful POSTs.
        if response.status_code in (200, 201, 302, 303):
            return {"status": "success"}
            
        # If it's a real error (400, 500)
        response.raise_for_status()
        return {"status": "success"}

