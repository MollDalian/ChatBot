from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime
import asyncio
import uuid
import torch
import threading
from typing import Optional
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from models.chat import ChatMessage, Chat
from models.db import chats, messages
from db import database

app = FastAPI()
router = APIRouter()

# -----------------------------
# In-memory "database"
# -----------------------------
messages_store = {}  # chat_id -> list of messages

# -----------------------------
# Helper to create a new chat
# -----------------------------
async def create_chat(title: str = "New Chat") -> str:
    chat_id = str(uuid.uuid4())
    query = chats.insert().values(id=chat_id, title=title)
    await database.execute(query)

    return chat_id

# -----------------------------
# Load Hugging Face model
# -----------------------------
model_name = "gpt2"  # You can replace with any Hugging Face causal LM
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
model.eval()
if torch.cuda.is_available():
    model.to("cuda")

# -----------------------------
# Streaming bot response endpoint
# -----------------------------
@router.get("/chat")
@router.get("/chat")
async def chat(prompt: str, chat_id: Optional[str] = None):
    if not chat_id:
        chat_id = await create_chat(title=prompt[:20])

    # Save user message to database
    user_msg = ChatMessage(
        user="user",
        message=prompt,
        timestamp=datetime.utcnow(),
        chat_id=chat_id,
    )
    user_query = messages.insert().values(
        user=user_msg.user,
        message=user_msg.message,
        timestamp=user_msg.timestamp,
        chat_id=user_msg.chat_id
    )
    await database.execute(user_query)

    async def stream():
        input_ids = tokenizer(prompt, return_tensors="pt").input_ids
        if torch.cuda.is_available():
            input_ids = input_ids.to("cuda")

        message_text = ""
        streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

        thread = threading.Thread(
            target=model.generate,
            kwargs={
                "input_ids": input_ids,
                "max_new_tokens": 500,
                "do_sample": True,
                "temperature": 0.7,
                "pad_token_id": tokenizer.eos_token_id,
                "streamer": streamer
            }
        )
        thread.start()

        for token_text in streamer:
            message_text += token_text
            msg = ChatMessage(
                user="bot",
                message=message_text.strip(),
                timestamp=datetime.utcnow(),
                chat_id=chat_id,
            )
            # Save bot message to database
            bot_query = messages.insert().values(
                user=msg.user,
                message=msg.message,
                timestamp=msg.timestamp,
                chat_id=msg.chat_id
            )
            await database.execute(bot_query)
            yield f"data: {msg.json()}\n\n"
            await asyncio.sleep(0.01)

        thread.join()

    return StreamingResponse(stream(), media_type="text/event-stream")

# -----------------------------
# Load chat messages
# -----------------------------
@router.get("/load_chat/{chat_id}", response_model=Chat)
async def load_chat(chat_id: str):
    chat_query = chats.select().where(chats.c.id == chat_id)
    chat_data = await database.fetch_one(chat_query)
    if not chat_data:
        raise HTTPException(status_code=404, detail="Chat not found")

    msg_query = messages.select().where(messages.c.chat_id == chat_id).order_by(messages.c.timestamp)
    messages_data = await database.fetch_all(msg_query)

    messages_list = [
        ChatMessage(
            user=m["user"],
            message=m["message"],
            timestamp=m["timestamp"],
            chat_id=m["chat_id"]
        )
        for m in messages_data
    ]
    return Chat(chat_id=chat_data["id"], title=chat_data["title"], messages=messages_list)

# -----------------------------
# List all chats
# -----------------------------
@router.get("/chats")
async def list_chats():
    query = chats.select()
    all_chats = await database.fetch_all(query)

    return all_chats

# -----------------------------
# Include router
# -----------------------------
app.include_router(router)
