import asyncio
import httpx
from config import GOOGLE_SCRIPT_URL

async def test():
    payload = {
        "sheet": "system_log",
        "action": "create",
        "performed_by": "system",
        "data": {"test": "data"}
    }
    
    print("Testing with follow_redirects=False...")
    async with httpx.AsyncClient(follow_redirects=False, timeout=10.0) as client:
        response = await client.post(GOOGLE_SCRIPT_URL, json=payload)
        print("Status Code:", response.status_code)
        print("Headers:", response.headers)
        print("Body:", response.text)

asyncio.run(test())

