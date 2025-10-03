from sqlalchemy import Table, Column, String, Integer, ForeignKey, DateTime, MetaData
from sqlalchemy.sql import func

metadata = MetaData()

# Chat table
chats = Table(
    "chats",
    metadata,
    Column("id", String, primary_key=True),
    Column("title", String, nullable=False),
)

# ChatMessage table
messages = Table(
    "messages",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("chat_id", String, ForeignKey("chats.id")),
    Column("user", String, nullable=False),
    Column("message", String, nullable=False),
    Column("timestamp", DateTime(timezone=True), server_default=func.now()),
)
