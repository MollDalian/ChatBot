import React, { useState, useRef, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import { theme } from './theme';

function App() {
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem('lastActiveChatId') || null;
  });
  const [allChats, setAllChats] = useState([]);
  const [isNewChat, setIsNewChat] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        setMessages([{ user: 'bot', message: 'Hello! How can I help you today?' }]);
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
      console.error('Failed to fetch chats:', err);
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
          setMessages([{ user: 'bot', message: 'Hello! How can I help you today?' }]);
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

    setMessages((prev) => [...prev, { user: 'user', message: prompt }]);

    if (eventSourceRef.current) eventSourceRef.current.close();

    eventSourceRef.current = new EventSource(
      `/chat?prompt=${encodeURIComponent(prompt)}${
        currentChatId ? `&chat_id=${currentChatId}` : ''
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
          if (prev.length && prev[prev.length - 1].user === 'bot') {
            return [...prev.slice(0, -1), msg];
          } else {
            return [...prev, msg];
          }
        });
      } catch (err) {
        console.error('Failed to parse message:', err);
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
      console.error('Failed to load chat:', err);
    }
  };

  const startNewChat = () => {
    setMessages([{ user: 'bot', message: 'Hello! How can I help you today?' }]);
    setCurrentChatId(null);
    setIsNewChat(true);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden',
    }}>
      <div style={{
        width: isSidebarOpen ? '280px' : '0',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.colors.border.primary}`,
        transition: `width ${theme.transitions.normal}`,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: theme.spacing.lg,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.sidebar,
        }}>
          <button
            onClick={startNewChat}
            style={{
              width: '100%',
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.text.primary,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              cursor: 'pointer',
              fontSize: theme.fontSize.md,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.sm,
              transition: `all ${theme.transitions.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.accent.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.accent.primary;
            }}
          >
            <span style={{ fontSize: theme.fontSize.lg }}>+</span>
            New Chat
          </button>
        </div>
        
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatList
            chats={allChats}
            onSelectChat={loadChat}
            onDeleteChat={handleDeleteChat}
            currentChatId={currentChatId}
          />
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: theme.spacing.lg,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.secondary,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              padding: theme.spacing.sm,
              backgroundColor: 'transparent',
              color: theme.colors.text.secondary,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              cursor: 'pointer',
              fontSize: theme.fontSize.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `all ${theme.transitions.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.background.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ☰
          </button>
          
          <h2 style={{
            margin: 0,
            fontSize: theme.fontSize.lg,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}>
            AI Chat Assistant
          </h2>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatWindow messages={messages} />
        </div>

        <MessageInput onSend={sendMessage} ref={inputRef} />
      </div>
    </div>
  );
}

export default App;
