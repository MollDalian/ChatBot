# AI Chatbot - Portfolio Project

A production-ready AI chatbot application featuring dual AI models (OpenAI + DialoGPT), multiple themes, and Docker deployment. Built with FastAPI, React, and modern web technologies.

## 🌟 Features

### AI Capabilities
- **Dual AI Models**: Switch between OpenAI (GPT-3.5, GPT-4) and free DialoGPT
- **User-Supplied API Keys**: Cost-effective hosting where users bring their own OpenAI keys
- **Smart Context**: Maintains conversation history (10 messages for OpenAI, 5 for DialoGPT)
- **Real-time Streaming**: Token-by-token response streaming using Server-Sent Events

### User Interface
- **Multiple Themes**: Dark, Light, and Ocean (branded) themes with one-click switching
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Modern Aesthetics**: Merlin AI-inspired design with smooth transitions
- **Font Awesome Icons**: Professional iconography throughout the app
- **Message Bubbles**: Color-coded chat interface with avatars and timestamps

### Architecture
- **FastAPI Backend**: Type-safe Python backend with comprehensive type hints
- **React Frontend**: Modern React with hooks and context API
- **SQLite Database**: Persistent chat history storage
- **Docker Ready**: Full containerization with docker-compose orchestration

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **OpenAI API** - GPT-3.5/4 integration
- **Transformers** - DialoGPT fallback model
- **PyTorch** - Deep learning framework
- **SQLAlchemy** - Database ORM
- **Pytest** - Testing framework (17 tests, 100% pass rate)

### Frontend
- **React** - UI library
- **Font Awesome** - Icon library
- **Context API** - Theme and state management
- **Server-Sent Events** - Real-time streaming
- **Nginx** - Production web server

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## 📦 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd chatbot

# Start with Docker Compose
docker-compose up -d

# Access the app
# Frontend: http://localhost:5000
# Backend API: http://localhost:8000
```

### Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
python create_tables.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd chatbot-frontend
npm install
npm start
```

## 🎨 Themes

The application supports three beautiful themes:

1. **Dark** (Default) - Professional dark theme with blue accents
2. **Light** - Clean light theme for daytime use
3. **Ocean** - Branded theme with oceanic blue/teal color scheme

Switch themes using the dropdown in the top-right corner.

## 🔑 API Key Setup

1. Click the model dropdown (e.g., "DialoGPT ▼") in the header
2. Check "Use OpenAI (requires API key)"
3. Enter your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
4. Select your preferred model (GPT-3.5, GPT-4, or GPT-4 Turbo)
5. Click "Save"

Keys are stored securely in browser localStorage and never sent to the server database.

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  React Frontend │◄───────►│  FastAPI Backend │
│  (Port 5000)    │   SSE   │  (Port 8000)     │
│                 │  Stream │                  │
└─────────────────┘         └──────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│   localStorage  │         │  SQLite Database │
│   (API Keys,    │         │  (Chat History)  │
│    Themes)      │         │                  │
└─────────────────┘         └──────────────────┘
```

## 📚 API Endpoints

### Chat
- `GET /chat?prompt={text}&chat_id={id}&api_key={key}&model={model}`
  - Send message and receive streaming response
  - Falls back to DialoGPT when no API key provided

### Chat Management
- `GET /chats` - List all chat sessions
- `GET /load_chat/{chat_id}` - Load specific chat with history
- `DELETE /chat/{chat_id}` - Delete a chat session

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
```

**Test Coverage:**
- 10 endpoint tests
- 7 AI service tests
- 100% pass rate
- Regression tests for chat history duplication

## 🐳 Docker Configuration

### Services
- **backend**: FastAPI application on port 8000
- **frontend**: Nginx serving React build on port 5000

### Volumes
- `backend-data`: Persistent SQLite database storage

### Networks
- `chatbot-network`: Internal bridge network for service communication

## 🎯 Deployment

### Development (Replit)
```bash
bash start.sh
```

### Production (Docker)
```bash
docker-compose up -d
```

### Scaling
The application supports Replit's Autoscale deployment for cost-effective hosting (~$1/month).

## 💡 Design Decisions

### Security
- API keys stored client-side only (localStorage)
- No server-side API costs
- Free DialoGPT fallback for testing

### Performance
- Server-Sent Events for efficient streaming
- React context for optimized re-renders
- Multi-stage Docker builds for smaller images

### User Experience
- Auto-focus on new chat creation
- Hover effects on interactive elements
- Mobile-responsive with touch-optimized controls
- Theme persistence across sessions

## 📝 Future Enhancements

- Export conversations to PDF/Markdown
- Search across all chats
- Markdown rendering in messages
- Copy message button
- Regenerate response option
- Pagination for long chats
- User authentication with Replit Auth

## 📄 License

This project is available for portfolio demonstration purposes.

## 👤 Author

Built as a portfolio project demonstrating:
- Full-stack development (FastAPI + React)
- AI integration (OpenAI + Transformers)
- Modern DevOps practices (Docker, CI/CD)
- Responsive UI/UX design
- Production-ready code quality

---

**Portfolio-Ready Features:**
✅ Professional UI with multiple themes  
✅ Comprehensive test suite  
✅ Docker containerization  
✅ Type-safe backend  
✅ Modern React patterns  
✅ Security best practices  
✅ Cost-effective architecture
