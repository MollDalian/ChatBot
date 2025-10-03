import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

function App() {
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [allChats, setAllChats] = useState([]);
  const [isNewChat, setIsNewChat] = useState(false); // for focusing input
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input after new chat starts
  useEffect(() => {
    if (isNewChat) {
      inputRef.current?.focus();
      setIsNewChat(false);
    }
  }, [isNewChat]);

  // Load existing chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/chats");
      const data = await res.json();
      setAllChats(data);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  const sendMessage = async (prompt) => {
    if (!prompt.trim()) return;

    // Append user message to preserve welcome or previous messages
    setMessages((prev) => [...prev, { user: "user", message: prompt }]);

    if (eventSourceRef.current) eventSourceRef.current.close();

    eventSourceRef.current = new EventSource(
      `http://127.0.0.1:8000/chat?prompt=${encodeURIComponent(prompt)}`
    );

    eventSourceRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Only add the chat once to sidebar
        if (!currentChatId && msg.chat_id) {
          setCurrentChatId(msg.chat_id);

          setAllChats((prev) => {
            if (!prev.some((c) => c.chat_id === msg.chat_id)) {
              return [...prev, { chat_id: msg.chat_id, title: prompt.slice(0, 20) }];
            }
            return prev;
          });
        }

        // Append bot message word by word
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

  const loadChat = async (chatId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/load_chat/${chatId}`);
      const data = await res.json();
      setCurrentChatId(chatId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  const startNewChat = () => {
    setMessages([{ user: "bot", message: "Hello! How can I help you today?" }]);
    setCurrentChatId(null);
    setIsNewChat(true); // trigger input focus
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Button variant="primary" className="mb-3" onClick={startNewChat}>
            New Chat
          </Button>
          <ChatList chats={allChats} onSelectChat={loadChat} />
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
