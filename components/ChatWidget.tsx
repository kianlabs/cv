'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

const GREETING =
  "Hi! I'm Kai, Kyan's assistant. Ask me about his projects, skills, or how to get in touch 🙂";

const QUICK_REPLIES = ['Projects', 'Resume', 'Contact'];

// Cap the history we send so the request stays small.
const MAX_HISTORY = 10;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ text: GREETING, isUser: false }]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { text: trimmed, isUser: true };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-MAX_HISTORY).map((m) => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      const data = await res.json().catch(() => null);
      const reply =
        res.ok && data && typeof data.reply === 'string'
          ? data.reply
          : "Sorry, I couldn't reach the assistant just now. Please try again, or email me at ridzkyan0504@gmail.com.";

      setMessages((prev) => [...prev, { text: reply, isUser: false }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I couldn't reach the assistant just now. Please try again, or email me at ridzkyan0504@gmail.com.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleQuickReply = (query: string) => {
    void sendMessage(query);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[90vw] max-w-[380px] bg-white dark:bg-ink-card border border-gray-100 dark:border-white/[0.08] rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
          <div className="p-4 bg-gray-900 dark:bg-ink text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center border border-white/15">
                K
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="text-[13px] font-semibold leading-none">Kai</h5>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Kyan&apos;s AI Assistant · Online</p>
              </div>
            </div>
            <button
              aria-label="Close Chat"
              className="text-gray-400 hover:text-white transition-colors p-1"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-[18px]">✕</span>
            </button>
          </div>

          <div className="p-4 h-64 overflow-y-auto space-y-3 text-[12px] bg-gray-50 dark:bg-white/[0.02]">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.isUser ? 'flex justify-end' : 'flex items-start gap-2'}>
                {!msg.isUser && (
                  <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                    K
                  </div>
                )}
                <div
                  className={`rounded-xl p-3 max-w-[85%] whitespace-pre-wrap ${
                    msg.isUser
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-none'
                      : 'bg-white dark:bg-ink-card border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                  K
                </div>
                <div className="rounded-xl rounded-tl-none p-3 bg-white dark:bg-ink-card border border-gray-200 dark:border-white/[0.08] text-gray-400 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 bg-white dark:bg-ink-card border-t border-gray-100 dark:border-white/[0.06] flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleQuickReply(q)}
              >
                {q}
              </button>
            ))}
          </div>

          <form className="p-3 bg-white dark:bg-ink-card border-t border-gray-200 dark:border-white/[0.08] flex items-center gap-2" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="flex-1 px-3 py-1.5 text-[12px] bg-gray-100 dark:bg-white/[0.05] rounded-lg border-0 focus:ring-1 focus:ring-gray-400 dark:focus:ring-white/30 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              placeholder={isLoading ? 'Thinking…' : 'Type a message...'}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              aria-label="Chat message"
            />
            <button
              aria-label="Send"
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white hover:opacity-90 text-white dark:text-black flex items-center justify-center transition-opacity flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              <span className="text-[16px]">→</span>
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          aria-label="Back to top"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/[0.12] bg-white dark:bg-ink-card shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick={scrollToTop}
        >
          <span className="text-xs">⌃</span>
        </button>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-medium shadow-md hover:opacity-90 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-[13px]">💬</span>
          <span>Chat with Kyan</span>
        </button>
      </div>
    </div>
  );
}
