import React, { forwardRef, useState } from "react";

const MessageInput = forwardRef(({ onSend }, ref) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <input
      type="text"
      ref={ref} // this makes App.js inputRef.current.focus() work
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyPress={handleKeyPress}
      className="form-control mt-2"
      placeholder="Type your message..."
    />
  );
});

export default MessageInput;
