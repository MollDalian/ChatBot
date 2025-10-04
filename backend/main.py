from fastapi import FastAPI
from contextlib import asynccontextmanager
from db import database
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from endpoints.chat import router as chat_router
import os
from pathlib import Path

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    await database.connect()
    yield
    # Shutdown code
    await database.disconnect()

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes FIRST (before catch-all)
app.include_router(chat_router)

# Serve React build files in production
frontend_build = Path(__file__).parent.parent / "chatbot-frontend" / "build"
if frontend_build.exists():
    # Mount static files (CSS, JS, images)
    app.mount("/static", StaticFiles(directory=str(frontend_build / "static")), name="static")
    
    # Serve favicon and other root assets
    @app.get("/favicon.ico")
    async def favicon():
        favicon_path = frontend_build / "favicon.ico"
        if favicon_path.exists():
            return FileResponse(str(favicon_path))
        favicon_png = frontend_build / "favicon.png"
        if favicon_png.exists():
            return FileResponse(str(favicon_png))
        return {"error": "Favicon not found"}
    
    @app.get("/manifest.json")
    async def manifest():
        manifest_path = frontend_build / "manifest.json"
        if manifest_path.exists():
            return FileResponse(str(manifest_path))
        return {"error": "Manifest not found"}
    
    # Serve index.html for all other routes (SPA fallback)
    # Exclude API routes from SPA fallback
    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        # Don't serve React for API routes
        if full_path.startswith(("chat", "chats", "load_chat")):
            return {"error": "API endpoint not found"}
        
        index_file = frontend_build / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"error": "Frontend not built"}
