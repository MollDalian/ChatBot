# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.chat import router as chat_router

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include chat endpoint
app.include_router(chat_router)
