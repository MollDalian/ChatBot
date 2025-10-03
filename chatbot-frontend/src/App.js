import React, { useState, useRef } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

function App() {
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const eventSourceRef = useRef(null);

  const handleSelectChat = async (chatId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/load_chat/${chatId}`);
      if (!res.ok) throw new Error("Chat not found");
      const chat = await res.json();
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  const sendMessage = (prompt) => {
    if (!prompt.trim() || !currentChatId) return;

    // Add user message
    setMessages((prev) => [...prev, { user: "user", message: prompt }]);

    // Close existing SSE
    if (eventSourceRef.current) eventSourceRef.current.close();

    // Connect SSE for bot response
    eventSourceRef.current = new EventSource(
      `http://127.0.0.1:8000/chat?prompt=${encodeURIComponent(prompt)}&chat_id=${currentChatId}`
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

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <ChatList onSelectChat={handleSelectChat} />
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h3>Chatbot</h3>
              <ChatWindow messages={messages} />
              <MessageInput onSend={sendMessage} disabled={!currentChatId} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
