import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_SCRIPT_URL = os.getenv("GOOGLE_SCRIPT_URL", "")

if not GOOGLE_SCRIPT_URL:
    raise RuntimeError("GOOGLE_SCRIPT_URL is not set in the environment variables. Please check your .env file.")

PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

