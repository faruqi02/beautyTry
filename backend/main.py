from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import CORS_ORIGINS, PORT, HOST

from routers import products, users, logs

app = FastAPI(title="beautyTry API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "beautyTry backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=int(PORT), reload=True)

