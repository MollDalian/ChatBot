import React from "react";

function ChatList({ chats, onSelectChat }) {
  return (
    <div>
      {chats.length === 0 && <div>No chats yet</div>}
      {chats.map((chat) => (
        <div
          key={chat.chat_id}
          className="chat-item"
          style={{
            padding: "8px",
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
          }}
          onClick={() => onSelectChat(chat.chat_id)}
        >
          {chat.title}
        </div>
      ))}
    </div>
  );
}

export default ChatList;
