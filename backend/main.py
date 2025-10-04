from fastapi import FastAPI
from contextlib import asynccontextmanager
from db import database
from fastapi.middleware.cors import CORSMiddleware
from endpoints.chat import router as chat_router

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

# Include routes
app.include_router(chat_router)
