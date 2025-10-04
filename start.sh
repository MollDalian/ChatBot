#!/bin/bash

cd /home/runner/workspace/backend && uvicorn main:app --host localhost --port 8000 --reload &
BACKEND_PID=$!

cd /home/runner/workspace/chatbot-frontend && npm start &
FRONTEND_PID=$!

wait $FRONTEND_PID
