import asyncio
import httpx
import traceback
import sys

async def test_post():
    async with httpx.AsyncClient() as client:
        payload = {
            "full_name": "admin",
            "email": "admin@beautytry.com",
            "password": "admin123",
            "phone_number": "N/A",
            "role": "ADMIN",
            "status": "Active"
        }
        try:
            res = await client.post("http://127.0.0.1:8000/api/users", json=payload)
            print(res.status_code)
            print(res.text)
        except Exception as e:
            traceback.print_exc()

asyncio.run(test_post())

