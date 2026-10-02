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
        { text: "Hi! Ask me about my portfolio, projects, or contact info 🙂", isUser: false }
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

    setMessages(prev => [...prev, { text: trimmed, isUser: true }]);
    setInput('');

    setTimeout(() => {
      const reply = generateReply(trimmed);
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
    }, 400);
  };

  const handleQuickReply = (query: string) => {
    setMessages(prev => [...prev, { text: query, isUser: true }]);
    
    setTimeout(() => {
      const reply = generateReply(query);
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
    }, 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[90vw] max-w-[380px] bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
          <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center border border-zinc-700">
                RP
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="text-[13px] font-semibold leading-none">Ridzkyan Buti Pratama</h5>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">Online · Full-Stack Developer</p>
              </div>
            </div>
            <button
              aria-label="Close Chat"
              className="text-zinc-400 hover:text-white transition-colors p-1"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-[18px]">✕</span>
            </button>
          </div>

          <div className="p-4 h-64 overflow-y-auto space-y-3 text-[12px] bg-zinc-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.isUser ? 'flex justify-end' : 'flex items-start gap-2'}>
                {!msg.isUser && (
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                    RP
                  </div>
                )}
                <div className={`rounded-xl p-3 max-w-[85%] ${
                  msg.isUser
                    ? 'bg-zinc-900 text-white rounded-tr-none'
                    : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 bg-white border-t border-zinc-100 flex flex-wrap gap-1.5">
            <button
              className="px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[11px] transition-colors"
              onClick={() => handleQuickReply('Projects')}
            >
              Projects
            </button>
            <button
              className="px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[11px] transition-colors"
              onClick={() => handleQuickReply('Download CV')}
            >
              Download CV
            </button>
            <button
              className="px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[11px] transition-colors"
              onClick={() => handleQuickReply('Contact')}
            >
              Contact
            </button>
          </div>

          <form className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="flex-1 px-3 py-1.5 text-[12px] bg-zinc-100 rounded-lg border-0 focus:ring-1 focus:ring-zinc-400 focus:bg-white text-zinc-900 placeholder:text-zinc-400 outline-none"
              placeholder="Type a message..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat message"
            />
            <button
              aria-label="Send"
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition-colors flex-shrink-0"
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
          className="w-8 h-8 rounded-full border border-zinc-200 bg-white shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
          onClick={scrollToTop}
        >
          <span className="text-xs">⌃</span>
        </button>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-medium shadow-md hover:bg-zinc-800 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-[13px]">💬</span>
          <span>Chat with Ridzkyan</span>
        </button>
      </div>
    </div>
  );
}
