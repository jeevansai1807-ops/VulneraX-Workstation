from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database import init_db
from api.scan import router as scan_router
from api.auth import router as auth_router
from api.ws_scan import router as ws_scan_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize DB on startup."""
    await init_db()
    # Ensure reports directory exists
    os.makedirs(os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports"), exist_ok=True)
    yield


app = FastAPI(
    title="VulneraX API",
    description="Security Assessment Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(scan_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(ws_scan_router)


@app.get("/")
async def root():
    return {"message": "VulneraX API v1.0.0", "status": "running"}
