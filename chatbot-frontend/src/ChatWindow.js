import React, { useEffect, useRef } from 'react';
import Message from './components/Message';
import { useTheme } from './ThemeContext';

function ChatWindow({ messages }) {
  const { theme } = useTheme();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background.primary,
      }}
    >
      {messages.length === 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.text.tertiary,
          fontSize: theme.fontSize.lg,
        }}>
          Start a conversation...
        </div>
      ) : (
        messages.map((msg, idx) => (
          <Message 
            key={idx}
            user={msg.user}
            message={msg.message}
            timestamp={msg.timestamp}
          />
        ))
      )}
    </div>
  );
}

export default ChatWindow;
