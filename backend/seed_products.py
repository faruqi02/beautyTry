import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.sheets_service import post_sheet_action

products = [
  {"skintone": "Fair", "product_name": "Soft Pink", "hex_colour": "#dd896e", "code_colour": "B01", "stock_qty": 1},
  {"skintone": "Fair", "product_name": "Nude Pink", "hex_colour": "#d89c93", "code_colour": "B02", "stock_qty": 1},
  {"skintone": "Fair", "product_name": "Peach", "hex_colour": "#f4a582", "code_colour": "B03", "stock_qty": 1},
  {"skintone": "Fair", "product_name": "Coral", "hex_colour": "#e76f51", "code_colour": "B04", "stock_qty": 1},
  {"skintone": "Neutral Medium", "product_name": "Warm Nude", "hex_colour": "#c58f76", "code_colour": "B05", "stock_qty": 1},
  {"skintone": "Neutral Medium", "product_name": "Terracotta", "hex_colour": "#c2593f", "code_colour": "B06", "stock_qty": 1},
  {"skintone": "Neutral Medium", "product_name": "Coral", "hex_colour": "#e76f51", "code_colour": "B07", "stock_qty": 1},
  {"skintone": "Neutral Medium", "product_name": "Rosy Pink", "hex_colour": "#c86d7c", "code_colour": "B08", "stock_qty": 1},
  {"skintone": "Neutral Medium", "product_name": "Brick Red", "hex_colour": "#8c2d19", "code_colour": "B09", "stock_qty": 1},
  {"skintone": "Medium Light", "product_name": "Caramel Nude", "hex_colour": "#b36b47", "code_colour": "B10", "stock_qty": 1},
  {"skintone": "Medium Light", "product_name": "Cinnamon", "hex_colour": "#9e472a", "code_colour": "B11", "stock_qty": 1},
  {"skintone": "Medium Light", "product_name": "Berry", "hex_colour": "#8a2846", "code_colour": "B12", "stock_qty": 1},
  {"skintone": "Medium Light", "product_name": "Brick Red", "hex_colour": "#8c2d19", "code_colour": "B13", "stock_qty": 1},
  {"skintone": "Medium Light", "product_name": "Burnt Orange", "hex_colour": "#bd4f19", "code_colour": "B14", "stock_qty": 1},
  {"skintone": "Tan", "product_name": "Chocholate - Baby Bear", "hex_colour": "#5c3426", "code_colour": "B15", "stock_qty": 1},
  {"skintone": "Tan", "product_name": "Warm Berry - Very Pretty 02", "hex_colour": "#7a2e3b", "code_colour": "B16", "stock_qty": 1},
  {"skintone": "Tan", "product_name": "Caramel Nude - Baby Mermaid", "hex_colour": "#a86544", "code_colour": "B17", "stock_qty": 1},
  {"skintone": "Tan", "product_name": "Terracotta - Very Pretty 03", "hex_colour": "#b34b32", "code_colour": "B18", "stock_qty": 1},
  {"skintone": "Deep", "product_name": "Espresso Brown", "hex_colour": "#3b2318", "code_colour": "B19", "stock_qty": 1},
  {"skintone": "Deep", "product_name": "Burgundy", "hex_colour": "#541221", "code_colour": "B20", "stock_qty": 1},
  {"skintone": "Deep", "product_name": "Deep Plum", "hex_colour": "#431429", "code_colour": "B21", "stock_qty": 1},
  {"skintone": "Deep", "product_name": "Berry", "hex_colour": "#8a2846", "code_colour": "B22", "stock_qty": 1},
  {"skintone": "Deep", "product_name": "Dark Red", "hex_colour": "#4a0e17", "code_colour": "B23", "stock_qty": 1}
]

async def seed():
    print(f"Total products to add: {len(products)}")
    for p in products:
        print(f"Adding {p['product_name']}...")
        await post_sheet_action("product_data", action="create", data=p)
        await asyncio.sleep(0.8) # Slight delay to not overwhelm Google Apps Script
    print("All products added successfully!")

if __name__ == "__main__":
    asyncio.run(seed())

