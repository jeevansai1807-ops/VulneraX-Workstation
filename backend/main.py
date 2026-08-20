from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from database import init_db
from api.scan import router as scan_router
from api.auth import router as auth_router
from api.ws_scan import router as ws_scan_router

# Detect desktop mode
IS_DESKTOP = os.getenv("VULNERAX_DESKTOP", "0") == "1"

# Resolve project root (parent of backend/)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(PROJECT_ROOT, "frontend", "dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize DB on startup."""
    await init_db()

    yield


app = FastAPI(
    title="VulneraX API",
    description="VulneraX Core Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend dev server and desktop mode
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://127.0.0.1:8000", "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(scan_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(ws_scan_router)


# --- Desktop mode: serve pre-built React SPA ---
if IS_DESKTOP and os.path.isdir(FRONTEND_DIST):
    # Mount static assets (JS, CSS, images) under /assets
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static-assets")

    @app.get("/favicon.svg")
    async def favicon():
        return FileResponse(os.path.join(FRONTEND_DIST, "favicon.svg"))

    @app.get("/icons.svg")
    async def icons():
        return FileResponse(os.path.join(FRONTEND_DIST, "icons.svg"))

    # SPA catch-all: serve index.html for any non-API, non-static route
    # This MUST be defined after all API routes
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the React SPA for client-side routing."""
        # Don't intercept API or WebSocket paths
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return None
        
        # Try to serve the exact file first (e.g., manifest.json)
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Fall back to index.html for SPA routing
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        return FileResponse(index_path)
else:
    # Development / standalone API mode
    @app.get("/")
    async def root():
        return {"message": "VulneraX API v1.0.0", "status": "running"}

