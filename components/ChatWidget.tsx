'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { text: 'Hi! Ask me about my portfolio, projects, or contact info 🙂', isUser: false },
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateReply = (query: string): string => {
    const lower = query.toLowerCase().trim();

    if (lower.includes('project')) {
      return 'Here are my key projects: UangKu (expense tracker PWA), GaweTracker (Laravel job app tracker), KRING! (SME POS), NobarHub (movie catalog), and JamKosong (booking system).';
    } else if (lower.includes('cv') || lower.includes('resume')) {
      return 'You can view and download my CV at /cv-ridzkyan.pdf';
    } else if (lower.includes('contact') || lower.includes('email')) {
      return 'You can reach me at ridzkyan0504@gmail.com or connect on LinkedIn at linkedin.com/in/ridzkyan-pratama-7911b441b';
    } else if (lower.includes('experience')) {
      return 'I am a Freelance Web Developer at KyanDev building client websites end-to-end with Next.js, React, TypeScript, and Tailwind CSS.';
    }

    return 'Ask me about my portfolio, projects, or contact info 🙂';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { text: trimmed, isUser: true }]);
    setInput('');

    setTimeout(() => {
      const reply = generateReply(trimmed);
      setMessages((prev) => [...prev, { text: reply, isUser: false }]);
    }, 400);
  };

  const handleQuickReply = (query: string) => {
    setMessages((prev) => [...prev, { text: query, isUser: true }]);

    setTimeout(() => {
      const reply = generateReply(query);
      setMessages((prev) => [...prev, { text: reply, isUser: false }]);
    }, 300);
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
                RP
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="text-[13px] font-semibold leading-none">Ridzkyan Buti Pratama</h5>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Online · Full-Stack Developer</p>
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
                    RP
                  </div>
                )}
                <div
                  className={`rounded-xl p-3 max-w-[85%] ${
                    msg.isUser
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-none'
                      : 'bg-white dark:bg-ink-card border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 bg-white dark:bg-ink-card border-t border-gray-100 dark:border-white/[0.06] flex flex-wrap gap-1.5">
            {['Projects', 'Download CV', 'Contact'].map((q) => (
              <button
                key={q}
                className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 text-[11px] transition-colors"
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
              placeholder="Type a message..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat message"
            />
            <button
              aria-label="Send"
              className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white hover:opacity-90 text-white dark:text-black flex items-center justify-center transition-opacity flex-shrink-0"
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
