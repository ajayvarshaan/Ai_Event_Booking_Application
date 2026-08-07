import React, { useEffect, useRef, useState } from 'react';
import { aiAPI } from '../services/api';
import gsap from 'gsap';
import { FaCommentDots, FaTimes } from 'react-icons/fa';
import './Chatbot.css';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

interface ApiHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  'What events are available?',
  'Recommend events under $50',
  'What is coming up this weekend?',
  'How do I book an event?',
  'Tell me about EventHub features'
];

const WELCOME_MESSAGE =
  "Hi! I'm EventAI 🤖✨ Your smart assistant for EventHub.\n\nI can help you:\n• Discover events by vibe, budget, or date\n• Get details about specific events\n• Get booking guidance\n• Explore platform features\n\nWhat would you like to know?";

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: WELCOME_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Smooth GSAP toggle animation for the chat panel
  useEffect(() => {
    if (isOpen) {
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 40, scale: 0.8, transformOrigin: 'bottom right' },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }
        );
      }
      if (toggleRef.current) {
        gsap.fromTo(
          toggleRef.current,
          { rotation: 0, scale: 1 },
          { rotation: 180, scale: 1.1, duration: 0.4, ease: 'back.out(1.6)' }
        );
      }
    } else {
      if (toggleRef.current) {
        gsap.to(toggleRef.current, {
          rotation: 0, scale: 1, duration: 0.3, ease: 'power2.out'
        });
      }
    }
  }, [isOpen]);

  // Continuous subtle float on the toggle button when closed
  useEffect(() => {
    if (!isOpen && toggleRef.current) {
      gsap.to(toggleRef.current, {
        y: -6,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    } else if (toggleRef.current) {
      gsap.killTweensOf(toggleRef.current);
      gsap.to(toggleRef.current, { y: 0, duration: 0.3 });
    }
  }, [isOpen]);

  const buildApiHistory = (): ApiHistoryMessage[] => {
    const history: ApiHistoryMessage[] = messages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .slice(-10)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

    // Remove leading model messages so the first entry is always a user message
    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    return history;
  };

  const handleSend = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || isTyping) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setIsTyping(true);

    try {
      const history = buildApiHistory();
      const response = await aiAPI.chat(message, history);
      const reply = response.data.reply;
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      const errorMsg =
        err?.response?.data?.message ||
        'Sorry, I had trouble connecting. Please try again in a moment.';
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: `⚠️ ${errorMsg}` }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <div ref={panelRef} className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-header-info">
              <h3>EventAI Assistant</h3>
              <p>
                <span className="status-dot"></span> Online · Powered by Gemini
              </p>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          <div ref={bodyRef} className="chatbot-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="chatbot-suggestion-chip"
                onClick={() => handleSend(suggestion)}
                disabled={isTyping}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="chatbot-input-bar">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about events, bookings, or recommendations..."
              disabled={isTyping}
            />
            <button
              type="button"
              className="chatbot-send"
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
)}

      <button
        ref={toggleRef}
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? <FaTimes style={{ fontSize: '24px' }} /> : <FaCommentDots style={{ fontSize: '28px' }} />}
        {!isOpen && <span className="chatbot-toggle-badge"></span>}
      </button>
    </div>
  );
};

export default Chatbot;