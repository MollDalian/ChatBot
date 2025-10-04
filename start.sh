#!/bin/bash

# Function to cleanup on exit
cleanup() {
    echo "Cleaning up..."
    pkill -P $$ || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start backend
cd /home/runner/workspace/backend && uvicorn main:app --host localhost --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
cd /home/runner/workspace/chatbot-frontend && npm start &
FRONTEND_PID=$!

# Wait for frontend (the main UI)
wait $FRONTEND_PID
