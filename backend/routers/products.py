from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.sheets_service import fetch_sheet_data, post_sheet_action

router = APIRouter()

class ProductCreate(BaseModel):
    product_name: str
    skintone: str
    code_colour: str
    hex_colour: str
    stock_qty: int

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    skintone: Optional[str] = None
    code_colour: Optional[str] = None
    hex_colour: Optional[str] = None
    stock_qty: Optional[int] = None

@router.get("")
async def get_products():
    return await fetch_sheet_data("product_data")

@router.get("/{id}")
async def get_product(id: str):
    return await fetch_sheet_data("product_data", item_id=id)

@router.post("")
async def create_product(product: ProductCreate):
    return await post_sheet_action("product_data", action="create", data=product.model_dump())

@router.put("/{id}")
async def update_product(id: str, product: ProductUpdate):
    return await post_sheet_action("product_data", action="update", item_id=id, data=product.model_dump(exclude_unset=True))

@router.delete("/{id}")
async def delete_product(id: str):
    return await post_sheet_action("product_data", action="delete", item_id=id)

