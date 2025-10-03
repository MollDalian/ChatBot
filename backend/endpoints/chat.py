from fastapi import FastAPI, APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from datetime import datetime
import asyncio
import uuid

app = FastAPI()
router = APIRouter()

# -----------------------------
# In-memory "database"
# -----------------------------
chats = {}  # chat_id -> {"id": chat_id, "title": str, "messages": [ChatMessage]}
messages_store = {}  # chat_id -> list of messages


# -----------------------------
# Pydantic models
# -----------------------------
class ChatMessage(BaseModel):
    user: str
    message: str
    timestamp: datetime = None
    chat_id: str = None


class Chat(BaseModel):
    id: str
    title: str
    messages: list[ChatMessage] = []


# -----------------------------
# Helper to create a new chat
# -----------------------------
async def create_chat(title: str = "New Chat") -> str:
    chat_id = str(uuid.uuid4())
    chats[chat_id] = {"id": chat_id, "title": title, "messages": []}
    messages_store[chat_id] = []
    return chat_id


# -----------------------------
# Streaming bot response endpoint
# -----------------------------
@router.get("/chat")
async def chat(prompt: str, chat_id: str = Query(default=None)):
    # Create a new chat if chat_id is None
    if not chat_id:
        chat_id = await create_chat(title=prompt[:20])

    async def stream():
        words = ["Hello,", "this", "is", "a", "streaming", "response", "from", "the", "chatbot!"]
        message_text = ""
        for word in words:
            message_text += word + " "
            msg = ChatMessage(
                user="bot",
                message=message_text.strip(),
                timestamp=datetime.utcnow(),
                chat_id=chat_id,
            )
            # Save message in memory
            messages_store[chat_id].append(msg.dict())
            yield f"data: {msg.json()}\n\n"
            await asyncio.sleep(0.5)

    return StreamingResponse(stream(), media_type="text/event-stream")


# -----------------------------
# Load chat messages
# -----------------------------
@router.get("/load_chat/{chat_id}", response_model=Chat)
async def load_chat(chat_id: str):
    if chat_id in chats:
        chat_data = chats[chat_id]
        chat_data["messages"] = messages_store.get(chat_id, [])
        return chat_data
    else:
        raise HTTPException(status_code=404, detail="Chat not found")


# -----------------------------
# List all chats
# -----------------------------
@router.get("/chats")
async def list_chats():
    result = [{"chat_id": c["id"], "title": c["title"]} for c in chats.values()]
    return result


# -----------------------------
# Include router
# -----------------------------
app.include_router(router)
