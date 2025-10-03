import React, { useState, useEffect } from "react";

function ChatList({ onSelectChat }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/chats");
        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, []);

  return (
    <div>
      <h5>Available Chats</h5>
      <ul className="list-group">
        {chats.map((chat) => (
          <li
            key={chat.chat_id}
            className="list-group-item list-group-item-action"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectChat(chat.chat_id)}
          >
            {chat.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;
