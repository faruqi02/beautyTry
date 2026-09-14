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
    product_info: Optional[str] = None
    intensity_colour: Optional[int] = None
    image_urls: Optional[str] = None

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    skintone: Optional[str] = None
    code_colour: Optional[str] = None
    hex_colour: Optional[str] = None
    stock_qty: Optional[int] = None
    product_info: Optional[str] = None
    intensity_colour: Optional[int] = None
    image_urls: Optional[str] = None

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
    print("PUT /products", id, "PAYLOAD RECEIVED:", product.model_dump())
    dumped = product.model_dump(exclude_unset=True)
    print("DUMPED FOR GAS:", dumped)
    return await post_sheet_action("product_data", action="update", item_id=id, data=dumped)

@router.delete("/{id}")
async def delete_product(id: str):
    return await post_sheet_action("product_data", action="delete", item_id=id)

