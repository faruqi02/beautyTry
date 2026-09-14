from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import bcrypt
from services.sheets_service import fetch_sheet_data, post_sheet_action

router = APIRouter()

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: str
    role: str = 'CUSTOMER'
    status: str = 'Active'
    saved_product: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    last_login: Optional[str] = None
    saved_product: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.get("")
async def get_users():
    users = await fetch_sheet_data("user_data")
    if not isinstance(users, list):
        users = []
        
    # Exclude hash_password from all returned users
    for user in users:
        user.pop("hash_password", None)
        user.pop("password", None)
    return users

@router.get("/{id}")
async def get_user(id: str):
    user = await fetch_sheet_data("user_data", item_id=id)
    if user and isinstance(user, dict):
        user.pop("hash_password", None)
        user.pop("password", None)
    return user

@router.post("")
async def create_user(user: UserCreate):
    # 1. Validate (e.g. check if email exists) - simplified for now
    payload = user.model_dump()
    
    # 2. Hash password before saving
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(user.password.encode('utf-8'), salt)
    payload["hash_password"] = hashed.decode('utf-8')
    del payload["password"]
    
    # 3. Send to Google Sheets
    return await post_sheet_action("user_data", action="create", data=payload)

@router.post("/login")
async def login_user(credentials: UserLogin):
    # Fetch all users (in a real app you'd query by email directly if the DB supported it)
    users = await fetch_sheet_data("user_data")
    if not isinstance(users, list):
        users = []
        
    for user in users:
        if isinstance(user, dict) and user.get("email") == credentials.email:
            hashed_pw = user.get("hash_password")
            # Verify password
            if hashed_pw:
                try:
                    if bcrypt.checkpw(credentials.password.encode('utf-8'), hashed_pw.encode('utf-8')):
                        # Update last_login in the database
                        now_iso = datetime.utcnow().isoformat() + "Z"
                        user["last_login"] = now_iso
                        
                        user_id = user.get("id")
                        if user_id:
                            # Send full merged payload so we don't accidentally wipe fields
                            await post_sheet_action("user_data", action="update", item_id=user_id, data=user)
                        
                        # Password matched! Remove hash before returning to frontend
                        user.pop("hash_password", None)
                        return user
                except ValueError:
                    pass # Invalid hash format in DB, ignore
            
    # If no match or wrong password
    raise HTTPException(status_code=401, detail="Invalid email or password")

@router.put("/{id}")
async def update_user(id: str, user: UserUpdate):
    # Fetch existing user to preserve fields (like hash_password) that shouldn't be blanked out
    existing_user = await fetch_sheet_data("user_data", item_id=id)
    if not existing_user or not isinstance(existing_user, dict):
        raise HTTPException(status_code=404, detail="User not found")
        
    payload = user.model_dump(exclude_unset=True, exclude={"password"})
    
    if user.password:
        salt = bcrypt.gensalt()
        payload["hash_password"] = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    else:
        # Crucial: if password wasn't provided, ensure we keep the old hash
        if "hash_password" in existing_user:
            payload["hash_password"] = existing_user["hash_password"]
            
    # Merge new fields over existing user to ensure no columns are accidentally wiped out by Apps Script
    merged_data = {**existing_user, **payload}
        
    return await post_sheet_action("user_data", action="update", item_id=id, data=merged_data)

@router.delete("/{id}")
async def delete_user(id: str):
    return await post_sheet_action("user_data", action="delete", item_id=id)
