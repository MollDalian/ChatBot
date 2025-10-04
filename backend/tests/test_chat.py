import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from db import database
from models.db import chats, messages
from datetime import datetime


@pytest_asyncio.fixture(scope="function")
async def async_client():
    await database.connect()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    await database.disconnect()


@pytest_asyncio.fixture(autouse=True)
async def clean_database():
    await database.connect()
    await database.execute(messages.delete())
    await database.execute(chats.delete())
    yield
    await database.execute(messages.delete())
    await database.execute(chats.delete())


class TestChatEndpoints:
    @pytest.mark.asyncio
    async def test_list_chats_empty(self, async_client):
        response = await async_client.get("/chats")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_list_chats_with_data(self, async_client):
        await database.execute(
            chats.insert().values(id="test-chat-1", title="Test Chat 1")
        )
        await database.execute(
            chats.insert().values(id="test-chat-2", title="Test Chat 2")
        )
        
        response = await async_client.get("/chats")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["id"] == "test-chat-1"
        assert data[0]["title"] == "Test Chat 1"
        assert data[1]["id"] == "test-chat-2"
        assert data[1]["title"] == "Test Chat 2"

    @pytest.mark.asyncio
    async def test_load_chat_not_found(self, async_client):
        response = await async_client.get("/load_chat/non-existent-id")
        assert response.status_code == 404
        assert response.json()["detail"] == "Chat not found"

    @pytest.mark.asyncio
    async def test_load_chat_with_messages(self, async_client):
        chat_id = "test-chat-load"
        await database.execute(
            chats.insert().values(id=chat_id, title="Test Chat")
        )
        await database.execute(
            messages.insert().values(
                chat_id=chat_id,
                user="user",
                message="Hello",
                timestamp=datetime(2024, 1, 1, 0, 0, 0)
            )
        )
        await database.execute(
            messages.insert().values(
                chat_id=chat_id,
                user="bot",
                message="Hi there!",
                timestamp=datetime(2024, 1, 1, 0, 0, 1)
            )
        )
        
        response = await async_client.get(f"/load_chat/{chat_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["chat_id"] == chat_id
        assert data["title"] == "Test Chat"
        assert len(data["messages"]) == 2
        assert data["messages"][0]["user"] == "user"
        assert data["messages"][0]["message"] == "Hello"
        assert data["messages"][1]["user"] == "bot"
        assert data["messages"][1]["message"] == "Hi there!"

    @pytest.mark.asyncio
    async def test_load_chat_empty_messages(self, async_client):
        chat_id = "test-chat-empty"
        await database.execute(
            chats.insert().values(id=chat_id, title="Empty Chat")
        )
        
        response = await async_client.get(f"/load_chat/{chat_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["chat_id"] == chat_id
        assert data["title"] == "Empty Chat"
        assert data["messages"] == []

    @pytest.mark.asyncio
    async def test_delete_chat_success(self, async_client):
        chat_id = "test-chat-delete"
        await database.execute(
            chats.insert().values(id=chat_id, title="Chat to Delete")
        )
        await database.execute(
            messages.insert().values(
                chat_id=chat_id,
                user="user",
                message="Test message",
                timestamp=datetime(2024, 1, 1, 0, 0, 0)
            )
        )
        
        response = await async_client.delete(f"/chat/{chat_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "Chat deleted successfully"
        
        query = chats.select().where(chats.c.id == chat_id)
        result = await database.fetch_one(query)
        assert result is None
        
        msg_query = messages.select().where(messages.c.chat_id == chat_id)
        msg_result = await database.fetch_all(msg_query)
        assert len(msg_result) == 0

    @pytest.mark.asyncio
    async def test_delete_chat_not_found(self, async_client):
        response = await async_client.delete("/chat/non-existent-chat")
        assert response.status_code == 200
        assert response.json()["message"] == "Chat not found"

    @pytest.mark.asyncio
    async def test_chat_creates_new_chat_without_id(self, async_client):
        prompt = "Hello bot"
        
        async with async_client.stream("GET", f"/chat?prompt={prompt}") as response:
            assert response.status_code == 200
            assert response.headers["content-type"] == "text/event-stream"
            
            await response.aclose()
        
        all_chats = await database.fetch_all(chats.select())
        assert len(all_chats) == 1
        assert all_chats[0]["title"] == prompt

    @pytest.mark.asyncio
    async def test_chat_uses_existing_chat_id(self, async_client):
        chat_id = "existing-chat"
        await database.execute(
            chats.insert().values(id=chat_id, title="Existing Chat")
        )
        
        prompt = "Another message"
        
        async with async_client.stream("GET", f"/chat?prompt={prompt}&chat_id={chat_id}") as response:
            assert response.status_code == 200
            await response.aclose()
        
        all_chats = await database.fetch_all(chats.select())
        assert len(all_chats) == 1

    @pytest.mark.asyncio
    async def test_chat_saves_user_message(self, async_client):
        chat_id = "message-test-chat"
        await database.execute(
            chats.insert().values(id=chat_id, title="Message Test")
        )
        
        prompt = "Test message"
        
        async with async_client.stream("GET", f"/chat?prompt={prompt}&chat_id={chat_id}") as response:
            assert response.status_code == 200
            await response.aclose()
        
        user_messages = await database.fetch_all(
            messages.select().where(
                (messages.c.chat_id == chat_id) & (messages.c.user == "user")
            )
        )
        assert len(user_messages) >= 1
        assert user_messages[0]["message"] == prompt
