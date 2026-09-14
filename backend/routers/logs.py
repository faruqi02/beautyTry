from fastapi import APIRouter
from services.sheets_service import fetch_sheet_data

router = APIRouter()

@router.get("")
async def get_logs():
    return await fetch_sheet_data("system_log")

