import React, { useState, useRef } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const eventSourceRef = useRef(null);

  const startChat = () => {
    if (!prompt.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { user: "user", message: prompt }]);

    // Close any existing SSE connection
    if (eventSourceRef.current) eventSourceRef.current.close();

    // Connect to backend SSE
    eventSourceRef.current = new EventSource(
      `http://127.0.0.1:8000/chat?prompt=${encodeURIComponent(prompt)}`
    );

    // Stream bot message
    eventSourceRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        setMessages((prev) => {
          // Check if last message is from bot
          if (prev.length && prev[prev.length - 1].user === "bot") {
            // Replace last bot message with updated text
            return [...prev.slice(0, -1), msg];
          } else {
            // Add new bot message
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

    // Clear input
    setPrompt("");
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h3>Chatbot</h3>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  startChat();
                }}
              >
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Type your message..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" className="w-100">
                  Send
                </Button>
              </Form>
              <hr />
              <div
                style={{
                  minHeight: "150px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    <strong>{msg.user}:</strong> {msg.message}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
