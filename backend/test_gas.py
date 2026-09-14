import asyncio
import httpx
import traceback
from config import GOOGLE_SCRIPT_URL

async def post_sheet_action(sheet_name: str, action: str, data: dict = None, item_id: str = None, actor: str = "system"):
    payload = {
        "sheet": sheet_name,
        "action": action,
        "performed_by": actor,
    }
    if item_id is not None:
        payload["id"] = item_id
    if data is not None:
        payload["data"] = data

    print("POSTing to", GOOGLE_SCRIPT_URL)
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        response = await client.post(GOOGLE_SCRIPT_URL, json=payload)
        print("Status Code:", response.status_code)
        print("Response Text:", response.text)
        response.raise_for_status()
        data = response.json()
        return data.get("data") if isinstance(data, dict) and "data" in data else data

async def run():
    try:
        res = await post_sheet_action("user_data", "create", {
            "full_name": "admin",
            "email": "admin@beautytry.com",
            "hash_password": "test",
            "phone_number": "N/A",
            "role": "ADMIN",
            "status": "Active"
        })
        print(res)
    except Exception as e:
        traceback.print_exc()

asyncio.run(run())

