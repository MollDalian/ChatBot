import React from "react";

function ChatList({ chats, onSelectChat }) {
debugger;

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
          }}
          onClick={() => onSelectChat(chat.id)}
        >
          {chat.title}
        </div>
      ))}
    </div>
  );
}

export default ChatList;
