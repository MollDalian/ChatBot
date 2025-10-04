# ChatBot - AI Chatbot Application

## Overview
This is a full-stack AI chatbot application with a React frontend and FastAPI backend. The chatbot uses the GPT-2 model from Hugging Face to generate responses and stores chat history in a SQLite database.

## Project Structure
```
.
├── backend/                    # FastAPI backend
│   ├── endpoints/             # API endpoints
│   │   └── chat.py           # Chat endpoints (create, load, delete chats)
│   ├── models/               # Data models
│   │   ├── chat.py          # Pydantic models
│   │   └── db.py            # SQLAlchemy database schema
│   ├── main.py              # FastAPI application entry point
│   ├── db.py                # Database connection
│   ├── create_tables.py     # Database initialization script
│   ├── requirements.txt     # Python dependencies
│   └── chatbot.db          # SQLite database (auto-generated)
├── chatbot-frontend/          # React frontend
│   ├── public/               # Static files
│   ├── src/                  # React components
│   │   ├── App.js           # Main application component
│   │   ├── ChatList.js      # Chat history sidebar
│   │   ├── ChatWindow.js    # Message display
│   │   └── MessageInput.js  # Message input component
│   ├── package.json         # Node.js dependencies
│   └── .env                 # Environment variables
└── start.sh                  # Startup script for both services

```

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **PyTorch**: Deep learning framework
- **Transformers**: Hugging Face transformers library (GPT-2 model)
- **SQLAlchemy**: SQL toolkit and ORM
- **Databases**: Async database support
- **SQLite**: Lightweight database

### Frontend
- **React**: UI library
- **React Bootstrap**: UI components
- **Create React App**: Build tooling

## Architecture

### Backend API (Port 8000)
The backend runs on `0.0.0.0:8000` and provides the following endpoints:
- `GET /chat?prompt={text}&chat_id={id}` - Send a message and get streaming response
- `GET /chats` - List all chat sessions
- `GET /load_chat/{chat_id}` - Load a specific chat with its message history
- `DELETE /chat/{chat_id}` - Delete a chat session

### Frontend (Port 5000)
The React frontend runs on `0.0.0.0:5000` and provides:
- Chat interface with message history
- Sidebar with chat list
- New chat creation
- Chat deletion
- Real-time streaming responses using Server-Sent Events (SSE)

## Recent Changes (2025-10-04)
- Configured the application for Replit environment
- Updated CORS settings to allow all origins for Replit's proxy
- Modified frontend to use relative URLs for API calls through React proxy
- Configured React to bind to 0.0.0.0:5000 with host check disabled
- Changed backend to listen on 0.0.0.0:8000 for better proxy compatibility
- Set up combined workflow to run both backend and frontend
- Configured deployment settings for VM deployment
- Added comprehensive .gitignore file
- Created setupProxy.js to handle Server-Sent Events streaming without buffering
- Added pytest test suite with 10 comprehensive unit tests (all passing)

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

The frontend uses React's built-in proxy (configured in package.json) to forward API requests to the backend, with a custom setupProxy.js middleware to handle Server-Sent Events streaming without buffering.

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
The project is configured for VM deployment on Replit, which maintains server state and runs both services continuously. The deployment runs the same `start.sh` script used in development.

## AI Model
The chatbot uses GPT-2, a 124M parameter language model from Hugging Face. The model:
- Downloads automatically on first run (~548MB)
- Generates responses using sampling with temperature=0.7
- Streams responses token-by-token for real-time display
- Supports CUDA acceleration if available

## User Preferences
- Follow existing code conventions and structure
- Keep dependencies updated for security
- Maintain clean separation between frontend and backend
- Use environment variables for configuration
