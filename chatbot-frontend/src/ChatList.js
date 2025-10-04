import React from "react";

function ChatList({ chats, onSelectChat, onDeleteChat, currentChatId }) {
  const handleDelete = (e, chatId) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  return (
    <div>
      {chats.length === 0 && <div>No chats yet</div>}
      {chats.map((chat) => (
        <div
          key={chat.id}
          className="chat-item"
          style={{
            padding: "8px",
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: chat.id === currentChatId ? "#e9ecef" : "white",
            border: chat.id === currentChatId ? "1px solid #dee2e6" : "none",
            borderRadius: "4px",
            margin: "4px 0"
          }}
          onClick={() => onSelectChat(chat.id)}
        >
          <span>{chat.title}</span>
          <button
            onClick={(e) => handleDelete(e, chat.id)}
            style={{
              padding: "4px 8px",
              backgroundColor: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
