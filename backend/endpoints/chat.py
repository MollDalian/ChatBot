from fastapi import FastAPI, APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from datetime import datetime, UTC
import uuid
from typing import Optional, List, Dict, Any
from models.chat import ChatMessage, Chat
from models.db import chats, messages
from db import database
from ai_service import ai_service

app = FastAPI()
router = APIRouter()

# -----------------------------
# Helper to create a new chat
# -----------------------------
async def create_chat(title: str = "New Chat") -> str:
    """Create a new chat session in the database."""
    chat_id: str = str(uuid.uuid4())
    query = chats.insert().values(id=chat_id, title=title)
    await database.execute(query)
    return chat_id


# -----------------------------
# Get chat history
# -----------------------------
async def get_chat_history(chat_id: str) -> List[Dict[str, str]]:
    """Retrieve chat history for context."""
    msg_query = messages.select().where(
        messages.c.chat_id == chat_id
    ).order_by(messages.c.timestamp)
    msgs = await database.fetch_all(msg_query)
    
    return [
        {
            "user": msg["user"],
            "message": msg["message"]
        }
        for msg in msgs
    ]


# -----------------------------
# Streaming bot response endpoint
# -----------------------------
@router.get("/chat")
async def chat(
    prompt: str,
    chat_id: Optional[str] = None,
    api_key: Optional[str] = None,
    model: str = "gpt-3.5-turbo"
) -> StreamingResponse:
    """
    Chat endpoint with streaming responses.
    
    Args:
        prompt: User's message
        chat_id: Optional chat session ID (creates new if None)
        api_key: Optional OpenAI API key from query parameter
        model: AI model to use (default: gpt-3.5-turbo)
    
    Returns:
        StreamingResponse with Server-Sent Events
    """
    if not chat_id:
        chat_id = await create_chat(title=prompt[:50])  # Truncate title

    # Get chat history BEFORE saving user message (to avoid duplication)
    history: List[Dict[str, str]] = await get_chat_history(chat_id) if chat_id else []

    # Save user message
    user_msg = ChatMessage(
        user="user",
        message=prompt,
        timestamp=datetime.now(UTC),
        chat_id=chat_id,
    )
    await database.execute(messages.insert().values(
        user=user_msg.user,
        message=user_msg.message,
        timestamp=user_msg.timestamp,
        chat_id=user_msg.chat_id
    ))

    async def stream() -> Any:
        """Stream AI response tokens."""
        try:
            
            message_text: str = ""
            
            # Stream response from AI service
            async for token in ai_service.generate_response(
                prompt=prompt,
                chat_history=history,
                api_key=api_key,
                model=model
            ):
                message_text += token
                msg = ChatMessage(
                    user="bot",
                    message=message_text.strip(),
                    timestamp=datetime.now(UTC),
                    chat_id=chat_id,
                )
                yield f"data: {msg.model_dump_json()}\n\n".encode('utf-8')

            # Save complete bot message to database
            final_msg = ChatMessage(
                user="bot",
                message=message_text.strip(),
                timestamp=datetime.now(UTC),
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
async def load_chat(chat_id: str) -> Chat:
    """Load a specific chat with its message history."""
    chat_query = chats.select().where(chats.c.id == chat_id)
    chat_data = await database.fetch_one(chat_query)
    if not chat_data:
        raise HTTPException(status_code=404, detail="Chat not found")

    msg_query = messages.select().where(
        messages.c.chat_id == chat_id
    ).order_by(messages.c.timestamp)
    messages_data = await database.fetch_all(msg_query)

    messages_list: List[ChatMessage] = [
        ChatMessage(
            user=m["user"],
            message=m["message"],
            timestamp=m["timestamp"],
            chat_id=m["chat_id"]
        )
        for m in messages_data
    ]
    return Chat(
        chat_id=chat_data["id"],
        title=chat_data["title"],
        messages=messages_list
    )


# -----------------------------
# List all chats
# -----------------------------
@router.get("/chats")
async def list_chats() -> List[Dict[str, Any]]:
    """List all chat sessions."""
    query = chats.select()
    all_chats = await database.fetch_all(query)
    return [dict(chat) for chat in all_chats]


# -----------------------------
# Delete chat
# -----------------------------
@router.delete("/chat/{chat_id}")
async def delete_chat(chat_id: str) -> Dict[str, str]:
    """Delete a chat session and all its messages."""
    try:
        # Delete all messages for this chat
        delete_messages = messages.delete().where(messages.c.chat_id == chat_id)
        await database.execute(delete_messages)

        # Delete the chat
        del_chat = chats.delete().where(chats.c.id == chat_id)
        result = await database.execute(del_chat)

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
