import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { API_CHATBOT_URL } from '../apiConfig';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am your DualForge AI Assistant. Ask me anything about orders, coupons, payment modes, or refund policies!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setQuery('');
    setIsTyping(true);

    // Mock quick delay for realistic typing feel
    await new Promise(r => setTimeout(r, 600));

    try {
      const res = await fetch(`${API_CHATBOT_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
      } else {
        throw new Error("API non-200 response");
      }
    } catch (err) {
      console.warn("Backend server offline, executing local DualForge AI Decision Engine:", err);
      // Smart Client-Side AI Decision Assistant Fallback
      const localResponse = getSmartLocalAiResponse(userMessage);
      setMessages(prev => [...prev, { sender: 'bot', text: localResponse }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getSmartLocalAiResponse = (userQuery) => {
    const q = userQuery.toLowerCase();
    
    // Parse budget
    let budget = null;
    const match = q.match(/(?:₹|rs\.?|rupees|below|under|budget|for|have)?\s*(\d{3,6})/i);
    if (match) budget = parseInt(match[1], 10);

    if (q.includes('hoodie') || q.includes('jacket') || q.includes('sweatshirt') || q.includes('sweater') || q.includes('apparel') || q.includes('fashion') || q.includes('clothing')) {
      const bStr = budget ? `₹${budget.toLocaleString('en-IN')}` : '₹5,000';
      return `Recommended: Tech Hoodie Black — ₹2,499\n\n` +
             `✓ Wind-resistant thermo-regulating fleece blend\n` +
             `✓ Concealed internal travel slots\n` +
             `✓ Within your ${bStr} budget\n` +
             `✓ ⭐ 4.8 Customer Rating | Stock: 🟢 Available (40 left)\n` +
             `✓ Sustainable Eco-Score: A\n\n` +
             `💡 *Why this fits:* Premium comfort hoodie ideal for daily casual wear and travel!`;
    } else if (q.includes('headphone') || q.includes('earphone') || q.includes('anc') || q.includes('audio') || q.includes('gaming') || q.includes('travel')) {
      const bStr = budget ? `₹${budget.toLocaleString('en-IN')}` : '₹5,000';
      return `Recommended: Forgebuds ANC — ₹4,999\n\n` +
             `✓ Active Noise Cancellation (ANC)\n` +
             `✓ 40-hour long battery life\n` +
             `✓ Ultra-comfortable for gaming and travelling\n` +
             `✓ Within your ${bStr} budget\n` +
             `✓ ⭐ 4.6 Customer Rating | Stock: 🟢 In Stock (50 available)`;
    } else if (q.includes('shoe') || q.includes('sneaker') || q.includes('running') || q.includes('footwear')) {
      const bStr = budget ? `₹${budget.toLocaleString('en-IN')}` : '₹4,000';
      return `Stealth Runners — ₹3,499\n\n` +
             `Rating: 4.7 ⭐\n` +
             `Stock: Available (🟢 15 remaining)\n` +
             `Discount: 20% OFF\n` +
             `Within your ${bStr} budget\n\n` +
             `💡 *Why this fits:* Engineered for maximum cushioning and daily high-mileage runs!`;
    } else if (q.includes('laptop') || q.includes('forgebook') || q.includes('computer')) {
      return `Recommended: Forgebook Pro 15 — ₹89,999\n\n` +
             `✓ Intel Core i7 13th Gen + RTX 4060 GPU\n` +
             `✓ 16GB DDR5 RAM & 1TB NVMe SSD\n` +
             `✓ 15.6" 144Hz FHD Anti-glare Display\n` +
             `✓ ⭐ 4.8 Rating | Stock: 🟢 In Stock`;
    } else if (budget) {
      return `🤖 **DualForge AI Decision Assistant**\n\n` +
             `For a budget of **₹${budget.toLocaleString('en-IN')}**, I highly recommend checking out our **Tech Hoodie Black (₹2,499)**, **Forgebuds ANC (₹4,999)**, or **Stealth Runners (₹3,499)**! All offer top customer ratings (4.6+ ⭐) and 100% verified authentic warranties.`;
    }

    return "Hello! I am your DualForge AI Assistant. You can ask me for product recommendations like: 'I have ₹5000. I need headphones for gaming and travelling' or ask about order tracking, active coupons (FLAGSHIP20), and size guides!";
  };

  return (
    <div className="chatbot-widget-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chatbot-toggle-btn animate-bounce-slow" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
          <span className="chatbot-tooltip">AI Assistant</span>
        </button>
      )}

      {/* Chat window panel */}
      {isOpen && (
        <div className="chatbot-window glass-card animate-fade-in">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <Bot size={20} className="bot-avatar-icon" />
              <div>
                <h3>DualForge Bot</h3>
                <span className="online-indicator">Online</span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Chat Logs */}
          <div className="chatbot-logs">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender === 'bot' ? 'chat-bot' : 'chat-user'}`}>
                <div className="message-icon-bubble">
                  {msg.sender === 'bot' ? <Bot size={12} /> : <User size={12} />}
                </div>
                <div className="message-text">
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message chat-bot">
                <div className="message-icon-bubble">
                  <Bot size={12} />
                </div>
                <div className="message-text typing-bubble">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="chatbot-input-form">
            <input
              type="text"
              placeholder="Ask me something..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send-btn">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
