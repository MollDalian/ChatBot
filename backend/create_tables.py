from sqlalchemy import create_engine
from models.db import metadata

DATABASE_URL = "sqlite:///./chatbot.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create all tables
metadata.create_all(engine)

print("Tables created successfully!")
