"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: fullText }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-[360px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-brand-gray-700 bg-[#111111]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-red">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white opacity-80 animate-pulse" />
              <span className="text-white font-semibold text-sm tracking-wide">Tax3 Agent</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors text-lg leading-none"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[280px] max-h-[360px]">
            {messages.length === 0 && (
              <div className="text-center text-brand-gray-400 text-sm pt-8 space-y-2">
                <p className="text-2xl">👋</p>
                <p className="font-medium text-white">What's up, JB?</p>
                <p>Ask me anything — strategy, content ideas, captions, performance.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-brand-red text-white rounded-br-sm"
                      : "bg-[#1e1e1e] text-gray-100 rounded-bl-sm border border-white/5"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && loading && i === messages.length - 1 && msg.content === "" && (
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/5 bg-[#0e0e0e] flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Tax3 Agent..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-[#1a1a1a] text-white text-sm placeholder-gray-500 rounded-xl px-3 py-2 outline-none border border-white/5 focus:border-brand-red/50 transition-colors max-h-[100px] overflow-y-auto disabled:opacity-50"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl bg-brand-red hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-brand-red hover:bg-red-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
        aria-label="Toggle chat"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
