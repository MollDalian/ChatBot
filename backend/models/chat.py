from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatMessage(BaseModel):
    user: str                 # "user" or "bot"
    message: str
    timestamp: Optional[datetime] = None
