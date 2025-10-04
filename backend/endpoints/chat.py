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
async def chat(prompt: str, chat_id: Optional[str] = None):
    if not chat_id:
        chat_id = await create_chat(title=prompt[:20])

    # Save user message
    user_msg = ChatMessage(
        user="user",
        message=prompt,
        timestamp=datetime.utcnow(),
        chat_id=chat_id,
    )
    await database.execute(messages.insert().values(
        user=user_msg.user,
        message=user_msg.message,
        timestamp=user_msg.timestamp,
        chat_id=user_msg.chat_id
    ))

    async def stream():
        try:
            formatted_prompt = f"Q: {prompt}\nA:"
            input_ids = tokenizer(formatted_prompt, return_tensors="pt").input_ids
            if torch.cuda.is_available():
                input_ids = input_ids.to("cuda")

            message_text = ""
            streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

            thread = threading.Thread(
                target=model.generate,
                kwargs={
                    "input_ids": input_ids,
                    "max_new_tokens": 100,
                    "do_sample": True,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "pad_token_id": tokenizer.eos_token_id,
                    "streamer": streamer,
                    "num_return_sequences": 1,
                }
            )
            thread.start()

            for token_text in streamer:
                if token_text.strip():
                    message_text += token_text
                    msg = ChatMessage(
                        user="bot",
                        message=message_text.strip(),
                        timestamp=datetime.utcnow(),
                        chat_id=chat_id,
                    )
                    yield f"data: {msg.json()}\n\n".encode('utf-8')

            thread.join()

            # Save complete bot message to database
            final_msg = ChatMessage(
                user="bot",
                message=message_text.strip(),
                timestamp=datetime.utcnow(),
                chat_id=chat_id,
            )
            await database.execute(messages.insert().values(
                user=final_msg.user,
                message=final_msg.message,
                timestamp=final_msg.timestamp,
                chat_id=final_msg.chat_id
            ))

        except Exception as e:
            print(f"Streaming error: {str(e)}")
            yield f"data: {{\"error\": \"{str(e)}\"}}\n\n".encode('utf-8')

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Type': 'text/event-stream',
        }
    )


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

@router.delete("/chat/{chat_id}")
async def delete_chat(chat_id: str):
    try:
        # Delete all messages for this chat
        delete_messages = messages.delete().where(messages.c.chat_id == chat_id)
        await database.execute(delete_messages)

        # Delete the chat
        delete_chat = chats.delete().where(chats.c.id == chat_id)
        result = await database.execute(delete_chat)

        if result:
            return {"message": "Chat deleted successfully"}
        return {"message": "Chat not found"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting chat: {str(e)}"
        )


# -----------------------------
# Include router
# -----------------------------
app.include_router(router)
