from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    chat_id: Optional[str] = None
    user: str                 # "user" or "bot"
    message: str
    timestamp: datetime

class Chat(BaseModel):
    chat_id: str
    title: str
    messages: List[ChatMessage] = []

class HistoryMessage(BaseModel):
    """Single message for chat history context"""
    user: str
    message: str

class ChatSummary(BaseModel):
    """Chat list item"""
    id: str
    title: str

class ApiResponse(BaseModel):
    """Generic API response"""
    message: str
