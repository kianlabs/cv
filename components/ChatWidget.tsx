'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  sources?: string[];
}

/** Human-readable labels for knowledge-base source ids. */
const SOURCE_LABELS: Record<string, string> = {
  '01-profile': 'Profile',
  '02-projects': 'Projects',
  '03-skills': 'Skills',
  '04-experience': 'Experience',
  '05-faq': 'FAQ',
};

const labelFor = (id: string) => SOURCE_LABELS[id] ?? id;

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
    if (!isOpen || !inputRef.current) return;
    // Auto-focus only on desktop. On mobile, focusing an input pops the soft
    // keyboard and (with sub-16px text) makes the browser zoom into the field;
    // let the user tap the input themselves instead.
    if (window.matchMedia('(min-width: 640px)').matches) {
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
      const sources =
        res.ok && data && Array.isArray(data.sources)
          ? (data.sources as string[])
          : undefined;

      setMessages((prev) => [...prev, { text: reply, isUser: false, sources }]);
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

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] max-w-[380px] max-h-[calc(100dvh-2.5rem)] bg-white dark:bg-ink-card border border-gray-100 dark:border-white/[0.08] rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
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

          <div className="p-4 h-64 flex-1 min-h-0 overflow-y-auto space-y-3 text-[12px] bg-gray-50 dark:bg-white/[0.02]">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.isUser ? 'flex justify-end' : 'flex items-start gap-2'}>
                {!msg.isUser && (
                  <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                    K
                  </div>
                )}
                <div className="flex flex-col gap-1.5 max-w-[85%] items-start">
                  <div
                    className={`rounded-xl p-3 whitespace-pre-wrap ${
                      msg.isUser
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-none'
                        : 'bg-white dark:bg-ink-card border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {!msg.isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pl-0.5">
                      <span className="text-[9px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        Sources
                      </span>
                      {msg.sources.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-[9px] text-gray-500 dark:text-gray-400"
                        >
                          {labelFor(s)}
                        </span>
                      ))}
                    </div>
                  )}
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
              className="flex-1 px-3 py-2 text-base sm:text-[12px] sm:py-1.5 bg-gray-100 dark:bg-white/[0.05] rounded-lg border-0 focus:ring-1 focus:ring-gray-400 dark:focus:ring-white/30 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
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
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-gray-900 dark:bg-white hover:opacity-90 text-white dark:text-black flex items-center justify-center transition-opacity flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              <span className="text-[16px]">→</span>
            </button>
          </form>
        </div>
      )}

      <button
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Chat with Kyan'}
        aria-expanded={isOpen}
      >
        <span className="text-[18px] leading-none">{isOpen ? '✕' : '💬'}</span>
        <span>Chat with Kyan</span>
      </button>
    </div>
  );
}
