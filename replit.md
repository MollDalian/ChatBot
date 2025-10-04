# ChatBot - AI Chatbot Application

## Overview
Portfolio-ready AI chatbot with FastAPI backend and React frontend. Features dual AI models: users can supply their own OpenAI API keys for high-quality responses, or use the free DialoGPT fallback model. Designed for cost-effective hosting (~$1/month via Autoscale deployment) where users bring their own API keys.

## Project Structure
```
.
├── backend/                    # FastAPI backend
│   ├── endpoints/             # API endpoints
│   │   └── chat.py           # Chat endpoints (create, load, delete chats)
│   ├── models/               # Data models
│   │   ├── chat.py          # Pydantic models
│   │   └── db.py            # SQLAlchemy database schema
│   ├── tests/                # Test suite
│   │   ├── test_app.py      # Endpoint tests (10 tests)
│   │   └── test_ai_service.py # AI service tests (7 tests)
│   ├── main.py              # FastAPI application entry point
│   ├── ai_service.py        # Dual AI model service (OpenAI + DialoGPT)
│   ├── db.py                # Database connection
│   ├── create_tables.py     # Database initialization script
│   ├── requirements.txt     # Python dependencies
│   └── chatbot.db          # SQLite database (auto-generated)
├── chatbot-frontend/          # React frontend
│   ├── public/               # Static files
│   ├── src/                  # React components
│   │   ├── components/      # Reusable components
│   │   │   ├── Message.js  # Individual message bubble component
│   │   │   ├── ChatItem.js # Chat list item component
│   │   │   └── Settings.js # Settings modal (API key, model selection)
│   │   ├── App.js           # Main application component
│   │   ├── ChatList.js      # Chat history sidebar
│   │   ├── ChatWindow.js    # Message display
│   │   ├── MessageInput.js  # Message input component
│   │   ├── theme.js         # Theme constants (colors, spacing, etc.)
│   │   ├── App.css          # Responsive styles
│   │   └── index.css        # Global styles
│   ├── package.json         # Node.js dependencies
│   ├── setupProxy.js        # SSE streaming proxy config
│   └── .env                 # Environment variables
└── start.sh                  # Startup script for both services

```

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework with full type hints
- **Uvicorn**: ASGI server
- **OpenAI**: User-supplied API keys for GPT-3.5/4 responses
- **Transformers**: DialoGPT fallback model (free)
- **PyTorch**: Deep learning framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Databases**: Async database support
- **SQLite**: Lightweight database
- **Pytest**: Comprehensive test suite (17 tests, 100% pass rate)

### Frontend
- **React**: UI library
- **Create React App**: Build tooling
- **Custom Theme System**: Modular theme constants for easy customization

## Architecture

### Backend API (Port 8000)
The backend runs on `0.0.0.0:8000` and provides the following endpoints:
- `GET /chat?prompt={text}&chat_id={id}&api_key={key}&model={model}` - Send a message and get streaming response
  - Supports optional `api_key` and `model` headers
  - Falls back to DialoGPT when no API key provided
  - Includes last 10 messages for OpenAI, last 5 for DialoGPT
- `GET /chats` - List all chat sessions
- `GET /load_chat/{chat_id}` - Load a specific chat with its message history
- `DELETE /chat/{chat_id}` - Delete a chat session

### Frontend (Port 5000)
The React frontend runs on `0.0.0.0:5000` with a Merlin AI-inspired design featuring:
- **Dark theme** with modern, minimalist aesthetics
- **Settings modal** - API key management, model selection (GPT-3.5/4, DialoGPT)
- **localStorage security** - API keys stored client-side only, never in database
- **Message bubbles** with avatars, timestamps, and color-coded user/bot messages
- **Responsive sidebar** with chat history (collapsible on mobile)
- **Modular components** - Message, ChatItem, Settings for easy customization
- **Mobile-friendly** design with touch-accessible controls
- **Real-time streaming** responses using Server-Sent Events (SSE)
- **Theme system** for easy color and style customization

## Recent Changes (2025-10-04)

### Latest Portfolio Enhancements
- **Multi-Theme System**:
  - Implemented ThemeContext with three themes: Dark, Light, and Ocean
  - Theme dropdown selector in header showing all available themes
  - All components (App, ChatItem, Message, Settings) use ThemeContext for dynamic theming
  - Theme persistence in localStorage
  - Smooth transitions between themes
- **Font Awesome Integration**:
  - Integrated Font Awesome via CDN in public/index.html
  - Replaced emoji trash icons with professional Font Awesome icons in ChatItem component
  - Consistent icon styling across the application
- **Docker Configuration**:
  - Complete Docker setup with docker-compose.yml
  - Separate Dockerfiles for backend (Python) and frontend (Node.js with nginx)
  - Production-ready nginx configuration for static file serving
  - Volume management for persistent data
  - Network isolation with custom bridge network
- **Comprehensive README**:
  - Portfolio-ready documentation with live demo link
  - Feature highlights and technology stack
  - Setup instructions and deployment guide
  - Docker deployment section
  - Architecture overview and API documentation

### Previous Updates - OpenAI Integration & Bug Fixes
- **Dual AI Model System**: 
  - OpenAI (GPT-3.5/4) with user-supplied API keys
  - DialoGPT free fallback when no API key provided
- **Settings UI Component**: 
  - API key input with secure localStorage storage
  - Model selection dropdown (gpt-3.5-turbo, gpt-4, microsoft/DialoGPT-medium)
  - Clear settings option
  - Helpful hints and security notes
- **Type Hints**: Added comprehensive type annotations throughout backend
- **Chat History Context**: 
  - Includes last 10 messages for OpenAI
  - Includes last 5 messages for DialoGPT
  - Fixed critical duplication bug where user messages appeared twice
- **Test Suite Enhancement**: 
  - 7 new AI service tests (100% pass rate)
  - Regression test for chat history duplication
  - Total: 17 tests (10 endpoint + 7 AI service)
- **Code Quality**: 
  - Fixed deprecation warnings (datetime.utcnow → datetime.now(UTC))
  - Fixed Pydantic warnings (.json() → .model_dump_json())
  - Architect-reviewed and approved

### Initial Setup
- **Redesigned UI with Merlin AI-inspired style** (dark theme, modern aesthetics)
- Created modular component architecture (Message, ChatItem components)
- Implemented theme system for easy customization (colors, spacing, fonts)
- Added responsive design with mobile-friendly layout
- Enhanced message display with bubbles, avatars, and timestamps
- Improved sidebar with hover effects and touch-accessible controls
- Configured the application for Replit environment
- Updated CORS settings to allow all origins for Replit's proxy
- Modified frontend to use relative URLs for API calls through React proxy
- Configured React to bind to 0.0.0.0:5000 with host check disabled
- Changed backend to listen on 0.0.0.0:8000 for better proxy compatibility
- Set up combined workflow to run both backend and frontend
- Configured deployment settings for VM deployment
- Added comprehensive .gitignore file
- Created setupProxy.js to handle Server-Sent Events streaming without buffering

## Environment Variables

### Frontend (.env)
- `REACT_APP_BACKEND_URL`: Backend API URL (default: http://localhost:8000)
- `PORT`: Frontend port (5000)
- `HOST`: Bind host (0.0.0.0)
- `DANGEROUSLY_DISABLE_HOST_CHECK`: Enable for Replit proxy (true)
- `WDS_SOCKET_PORT`: WebSocket port for dev server (0)

## Running the Application

### Development
The application starts automatically via the workflow which runs:
```bash
bash start.sh
```

This script:
1. Starts the FastAPI backend on 0.0.0.0:8000
2. Starts the React frontend on 0.0.0.0:5000

The frontend uses a custom setupProxy.js with http-proxy-middleware to handle API requests without buffering Server-Sent Events. This middleware:
- Routes `/chat`, `/chats`, and `/load_chat` requests to the backend
- Sets `Cache-Control: no-cache` and `X-Accel-Buffering: no` headers
- Preserves the full path when proxying (critical for proper routing)

### Manual Start
To start services manually:

Backend:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend:
```bash
cd chatbot-frontend
npm start
```

## Database
The application uses SQLite with two tables:
- `chats`: Stores chat sessions (id, title)
- `messages`: Stores individual messages (id, chat_id, user, message, timestamp)

To initialize the database:
```bash
cd backend
python create_tables.py
```

## Deployment
The project is configured for Autoscale deployment on Replit for cost-effective hosting (~$1/month, covered by Core credits). Users supply their own OpenAI API keys, so hosting costs are minimal. The deployment runs the same `start.sh` script used in development.

### Security Model
- **API Keys**: Stored in browser localStorage only, never persisted to database
- **Cost Control**: No server-side API costs; users pay their own OpenAI fees
- **Free Fallback**: DialoGPT available when no API key provided

## AI Models

### Primary: OpenAI (User-Supplied API Keys)
- **Models**: GPT-3.5-turbo, GPT-4
- **API Keys**: User-supplied, stored in localStorage
- **Context**: Last 10 messages included
- **Cost**: Users pay their own API costs

### Fallback: DialoGPT (Free)
- **Model**: microsoft/DialoGPT-medium (124M parameters)
- **Activation**: Automatic when no API key provided
- **Context**: Last 5 messages included
- **Downloads**: Automatically on first run (~548MB)
- **Streaming**: Token-by-token for real-time display
- **Acceleration**: Supports CUDA if available

## User Preferences
- Follow existing code conventions and structure
- Keep dependencies updated for security
- Maintain clean separation between frontend and backend
- Use environment variables for configuration
