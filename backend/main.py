# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def fake_chatbot_response(prompt: str):
    words = ["Hello,", "this", "is", "a", "streaming", "response", "from", "the", "chatbot!"]
    for word in words:
        yield f"data: {word}\n\n"
        await asyncio.sleep(0.5)

@app.get("/chat")
async def chat(prompt: str):
    return StreamingResponse(fake_chatbot_response(prompt), media_type="text/event-stream")
