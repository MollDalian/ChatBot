import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

function App() {
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem('lastActiveChatId') || null;
  });
  const [allChats, setAllChats] = useState([]);
  const [isNewChat, setIsNewChat] = useState(false);
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('lastActiveChatId', currentChatId);
    } else {
      localStorage.removeItem('lastActiveChatId');
    }
  }, [currentChatId]);

  useEffect(() => {
    if (isNewChat) {
      inputRef.current?.focus();
      setIsNewChat(false);
    }
  }, [isNewChat]);

  useEffect(() => {
    const initializeApp = async () => {
      await fetchChats();
      const savedChatId = localStorage.getItem('lastActiveChatId');
      if (savedChatId) {
        loadChat(savedChatId);
      } else {
        setMessages([{ user: "bot", message: "Hello! How can I help you today?" }]);
      }
    };
    initializeApp();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch(`/chats`);
      const data = await res.json();
      setAllChats(data);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`/chat/${chatId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAllChats(prevChats => prevChats.filter(chat => chat.id !== chatId));

        if (currentChatId === chatId) {
          setMessages([]);
          setCurrentChatId(null);
          setMessages([{ user: "bot", message: "Hello! How can I help you today?" }]);
        }

        await fetchChats();
      } else {
        console.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const sendMessage = async (prompt) => {
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { user: "user", message: prompt }]);

    if (eventSourceRef.current) eventSourceRef.current.close();

    eventSourceRef.current = new EventSource(
      `/chat?prompt=${encodeURIComponent(prompt)}${
        currentChatId ? `&chat_id=${currentChatId}` : ""
      }`
    );

    eventSourceRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (!currentChatId && msg.chat_id) {
          setCurrentChatId(msg.chat_id);

          setAllChats((prev) => {
            if (!prev.some((c) => c.id === msg.chat_id)) {
              return [...prev, { id: msg.chat_id, title: prompt.slice(0, 20) }];
            }
            return prev;
          });
        }

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
      const res = await fetch(`/load_chat/${chatId}`);
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
    setIsNewChat(true);
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Button variant="primary" className="mb-3" onClick={startNewChat}>
            New Chat
          </Button>
          <ChatList
            chats={allChats}
            onSelectChat={loadChat}
            onDeleteChat={handleDeleteChat}
            currentChatId={currentChatId}
          />
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
