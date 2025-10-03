import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

function App() {
  const [messages, setMessages] = useState([{ user: "bot", message: "Hello! How can I help you today?" }]);
  const [currentChatId, setCurrentChatId] = useState(null); // No chat session yet
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when the app loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (prompt) => {
    if (!prompt.trim()) return;

    // Add user's message
    setMessages((prev) => [...prev, { user: "user", message: prompt }]);

    // If no chat exists yet, create it on first message
    let chatId = currentChatId;
    if (!currentChatId) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/new_chat`, {
          method: "POST",
        });
        const chat = await res.json();
        chatId = chat.id;
        setCurrentChatId(chatId);
      } catch (err) {
        console.error("Failed to create chat session:", err);
        return;
      }
    }

    // Close any existing SSE
    if (eventSourceRef.current) eventSourceRef.current.close();

    // Connect SSE for bot response
    eventSourceRef.current = new EventSource(
      `http://127.0.0.1:8000/chat?prompt=${encodeURIComponent(prompt)}&chat_id=${chatId}`
    );

    eventSourceRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => {
          if (prev.length && prev[prev.length - 1].user === "bot") {
            return [...prev.slice(0, -1), msg];
          } else {
            return [...prev, msg];
          }
        });
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    eventSourceRef.current.onerror = () => {
      eventSourceRef.current.close();
    };
  };

  const startNewChat = () => {
    setMessages([{ user: "bot", message: "Hello! How can I help you today?" }]);
    setCurrentChatId(null);
    inputRef.current?.focus();
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Button variant="primary" className="mb-3" onClick={startNewChat}>
            New Chat
          </Button>
          <ChatList onSelectChat={(chatId) => {}} /> {/* Disabled selection until we save chats */}
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h3>Chatbot</h3>
              <ChatWindow messages={messages} />
              <MessageInput onSend={sendMessage} ref={inputRef} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
