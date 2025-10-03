import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const eventSourceRef = useRef(null);

  const startChat = () => {
    setMessages([]); // clear previous messages

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Connect to FastAPI SSE endpoint
    eventSourceRef.current = new EventSource(
      `http://127.0.0.1:8000/chat?prompt=${encodeURIComponent(prompt)}`
    );

    eventSourceRef.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    eventSourceRef.current.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSourceRef.current.close();
    };
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
              <div style={{ minHeight: "150px" }}>
                {messages.map((msg, idx) => (
                  <div key={idx}>{msg}</div>
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
