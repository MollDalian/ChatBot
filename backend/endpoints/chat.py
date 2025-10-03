from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.chat import ChatMessage, Chat
from datetime import datetime
from data import chats
import asyncio

router = APIRouter()

async def fake_chatbot_response(prompt: str):
    words = ["Hello,", "this", "is", "a", "streaming", "response", "from", "the", "chatbot!"]
    message_text = ""  # accumulate words here

    for word in words:
        message_text += word + " "
        # Send the current accumulated text as a single ChatMessage
        msg = ChatMessage(user="bot", message=message_text.strip(), timestamp=datetime.utcnow())
        yield f"data: {msg.json()}\n\n"
        await asyncio.sleep(0.5)

@router.get("/chat")
async def chat(prompt: str):
    return StreamingResponse(fake_chatbot_response(prompt), media_type="text/event-stream")

@router.get("/load_chat/{chat_id}", response_model=Chat)
async def load_chat(chat_id: str):
    if chat_id in chats:
        return chats[chat_id]
    else:
        raise HTTPException(status_code=404, detail="Chat not found")

@router.get("/chats")
async def list_chats():
    return [{"chat_id": c.chat_id, "title": c.title} for c in chats.values()]

