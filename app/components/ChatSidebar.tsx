"use client";

import React, { useRef, useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";

interface ChatSidebarProps {
  companyName: string;
}

export default function ChatSidebar({ companyName }: ChatSidebarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: `Hi! I'm the Genie Committee Assistant. What would you like to know about ${companyName}?` }
  ]);
  const [input, setInput] = useState("");

  const openChat = () => dialogRef.current?.showModal();
  const closeChat = () => dialogRef.current?.close();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "This is a mocked response. To enable real Q&A, we would need to add a new /api/chat route."
      }]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={openChat}
        className="btn-generate"
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px rgba(155, 107, 243, 0.2)",
          zIndex: 50,
        }}
      >
        <MessageSquare size={28} />
      </button>

      <dialog 
        ref={dialogRef}
        style={{
          margin: "0 0 0 auto",
          height: "100vh",
          maxHeight: "100vh",
          width: "400px",
          border: "none",
          borderLeft: "1px solid var(--border-bright)",
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          padding: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", borderBottom: "1px solid var(--border-dim)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "12px", color: "var(--text-primary)" }}>
              <MessageSquare size={20} color="var(--accent-purple)" />
              Committee Q&A
            </h3>
            <button onClick={closeChat} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((msg, i) => (
              <div 
                key={i} 
                style={{ 
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "rgba(155, 107, 243, 0.15)" : "var(--bg-card)",
                  color: msg.role === "user" ? "#c4a7ff" : "var(--text-primary)",
                  border: `1px solid ${msg.role === "user" ? "rgba(155, 107, 243, 0.3)" : "var(--border-dim)"}`,
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  maxWidth: "85%",
                  lineHeight: 1.5,
                  fontSize: "0.95rem"
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ padding: "24px", borderTop: "1px solid var(--border-dim)", display: "flex", gap: "12px", background: "var(--bg-card)" }}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow up question..."
              className="search-input"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-dim)",
                borderRadius: "9999px",
                padding: "12px 20px",
              }}
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="btn-generate"
              style={{
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
        
        <style>{`
          dialog::backdrop {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
          }
        `}</style>
      </dialog>
    </>
  );
}
