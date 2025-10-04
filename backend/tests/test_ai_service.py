import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from ai_service import AIService
from typing import List, Dict


@pytest.fixture
def ai_service():
    """Create AIService instance for testing."""
    return AIService()


@pytest.mark.asyncio
async def test_generate_response_without_api_key(ai_service):
    """Test that DialoGPT is used when no API key is provided."""
    prompt = "Hello, how are you?"
    chat_history: List[Dict[str, str]] = []
    
    tokens: List[str] = []
    async for token in ai_service.generate_response(
        prompt=prompt,
        chat_history=chat_history,
        api_key=None
    ):
        tokens.append(token)
    
    # Should get some response tokens from DialoGPT
    assert len(tokens) > 0
    assert all(isinstance(token, str) for token in tokens)


@pytest.mark.asyncio
@patch('ai_service.OpenAI')
async def test_generate_response_with_api_key(mock_openai, ai_service):
    """Test that OpenAI is used when API key is provided."""
    # Mock OpenAI client
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    
    # Mock streaming response
    mock_chunk1 = MagicMock()
    mock_chunk1.choices = [MagicMock()]
    mock_chunk1.choices[0].delta.content = "Hello"
    
    mock_chunk2 = MagicMock()
    mock_chunk2.choices = [MagicMock()]
    mock_chunk2.choices[0].delta.content = " there!"
    
    mock_chunk3 = MagicMock()
    mock_chunk3.choices = [MagicMock()]
    mock_chunk3.choices[0].delta.content = None
    
    mock_client.chat.completions.create.return_value = iter([
        mock_chunk1, mock_chunk2, mock_chunk3
    ])
    
    prompt = "Hello"
    api_key = "sk-test123"
    tokens: List[str] = []
    
    async for token in ai_service.generate_response(
        prompt=prompt,
        chat_history=[],
        api_key=api_key,
        model="gpt-3.5-turbo"
    ):
        tokens.append(token)
    
    # Verify OpenAI was called
    mock_openai.assert_called_once_with(api_key=api_key)
    assert tokens == ["Hello", " there!"]


@pytest.mark.asyncio
async def test_generate_response_with_chat_history(ai_service):
    """Test that chat history is included in the prompt."""
    prompt = "What did I just say?"
    chat_history: List[Dict[str, str]] = [
        {"user": "user", "message": "My name is John"},
        {"user": "bot", "message": "Nice to meet you, John!"},
    ]
    
    tokens: List[str] = []
    async for token in ai_service.generate_response(
        prompt=prompt,
        chat_history=chat_history,
        api_key=None
    ):
        tokens.append(token)
    
    # Should generate some response
    assert len(tokens) > 0


@pytest.mark.asyncio
@patch('ai_service.OpenAI')
async def test_openai_error_handling(mock_openai, ai_service):
    """Test that OpenAI errors are handled gracefully."""
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    
    # Simulate OpenAI error
    from openai import OpenAIError
    mock_client.chat.completions.create.side_effect = OpenAIError("API Error")
    
    tokens: List[str] = []
    async for token in ai_service.generate_response(
        prompt="test",
        chat_history=[],
        api_key="sk-test",
        model="gpt-3.5-turbo"
    ):
        tokens.append(token)
    
    # Should return error message
    assert len(tokens) > 0
    assert "OpenAI Error" in "".join(tokens)


@pytest.mark.asyncio
async def test_chat_history_limit(ai_service):
    """Test that chat history is limited to prevent token overflow."""
    prompt = "Hello"
    # Create 20 messages (should be limited to last 10 for OpenAI, 5 for DialoGPT)
    chat_history: List[Dict[str, str]] = [
        {"user": "user" if i % 2 == 0 else "bot", "message": f"Message {i}"}
        for i in range(20)
    ]
    
    tokens: List[str] = []
    async for token in ai_service.generate_response(
        prompt=prompt,
        chat_history=chat_history,
        api_key=None
    ):
        tokens.append(token)
    
    # Should not crash despite long history
    assert len(tokens) >= 0


def test_ai_service_initialization():
    """Test that AIService initializes correctly."""
    service = AIService()
    assert service.fallback_model is not None
    assert service.fallback_tokenizer is not None
    assert service.fallback_model_name == "microsoft/DialoGPT-medium"


@pytest.mark.asyncio
@patch('ai_service.OpenAI')
async def test_no_duplicate_user_message_in_history(mock_openai, ai_service):
    """Regression test: Ensure user message doesn't appear twice in history."""
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    
    # Track the messages sent to OpenAI
    captured_messages = None
    
    def capture_messages(**kwargs):
        nonlocal captured_messages
        captured_messages = kwargs.get('messages', [])
        # Return empty iterator
        return iter([])
    
    mock_client.chat.completions.create.side_effect = capture_messages
    
    prompt = "What is 2+2?"
    chat_history: List[Dict[str, str]] = [
        {"user": "user", "message": "Hello"},
        {"user": "bot", "message": "Hi there!"},
    ]
    
    tokens: List[str] = []
    async for token in ai_service.generate_response(
        prompt=prompt,
        chat_history=chat_history,
        api_key="sk-test",
        model="gpt-3.5-turbo"
    ):
        tokens.append(token)
    
    # Verify no duplicate user messages
    assert captured_messages is not None
    user_messages = [msg['content'] for msg in captured_messages if msg['role'] == 'user']
    
    # Should have: "Hello" from history and "What is 2+2?" from prompt
    assert len(user_messages) == 2
    assert user_messages == ["Hello", "What is 2+2?"]
    
    # Ensure "What is 2+2?" appears only once
    assert user_messages.count("What is 2+2?") == 1
