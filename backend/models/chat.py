from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChatMessage(BaseModel):
    user: str                 # "user" or "bot"
    message: str
    timestamp: datetime

class Chat(BaseModel):
    chat_id: str
    title: str
    messages: List[ChatMessage] = []
