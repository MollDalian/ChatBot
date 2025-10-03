import React, { useEffect, useRef } from "react";

function ChatWindow({ messages }) {
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
        minHeight: "300px",
        maxHeight: "500px",
        overflowY: "auto",
        marginBottom: "1rem",
        whiteSpace: "pre-wrap",
      }}
    >
      {messages.map((msg, idx) => (
        <div key={idx}>
          <strong>{msg.user}:</strong> {msg.message}
        </div>
      ))}
    </div>
  );
}

export default ChatWindow;
