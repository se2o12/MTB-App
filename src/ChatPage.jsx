
import { useState } from "react";

function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    const text = message.trim();

    if (!text) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        text: text,
        sender: "me",
        time: new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="page chat-page">

      <div className="chat-header">
        <div className="chat-user-avatar">
          👤
        </div>

        <div>
          <h1>Chat</h1>

          <span className="chat-online">
            <span></span>
            Online
          </span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div>💬</div>
            <strong>Noch keine Nachrichten</strong>
            <span>Schreibe deine erste Nachricht.</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${
                msg.sender === "me"
                  ? "my-message"
                  : "friend-message"
              }`}
            >
              <div className="chat-bubble">
                <span>{msg.text}</span>
                <small>{msg.time}</small>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Nachricht schreiben..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={sendMessage}
          disabled={!message.trim()}
        >
          ➤
        </button>
      </div>

    </div>
  );
}

export default ChatPage;
