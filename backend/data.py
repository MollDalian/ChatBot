# backend/data.py
from models.chat import Chat, ChatMessage
from datetime import datetime

# Example chat store
chats = {
    "chat1": Chat(
        chat_id="chat1",
        title="Chat One",
        messages=[
            ChatMessage(user="user", message="Hello!", timestamp=datetime.utcnow()),
            ChatMessage(user="bot", message="Hi there!", timestamp=datetime.utcnow()),
        ]
    ),
    "chat2": Chat(
        chat_id="chat2",
        title="Chat Two",
        messages=[
            ChatMessage(user="user", message="Hey!", timestamp=datetime.utcnow()),
            ChatMessage(user="bot", message="Hello!", timestamp=datetime.utcnow()),
        ]
    ),
}
