import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

function MessageInput({ onSend, disabled }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(prompt);
    setPrompt("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Type your message..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled}
        />
      </Form.Group>
      <Button type="submit" className="w-100" disabled={disabled}>
        Send
      </Button>
    </Form>
  );
}

export default MessageInput;
