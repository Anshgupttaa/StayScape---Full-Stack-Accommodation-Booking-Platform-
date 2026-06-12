import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaCommentDots, FaTimes, FaRobot, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am the StayScape AI assistant. I can help you find the perfect stay. What are you looking for?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/ai/chat', { 
        message: input,
        // Send previous messages (excluding properties for token limit safety)
        conversationHistory: newMessages.map(m => ({ role: m.role, content: m.content })).slice(-5) 
      });

      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: data.reply, properties: data.properties }
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - High-End Anti-Gravity FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9, z: -20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 bg-gradient-to-br from-primary-500 via-rose-600 to-indigo-600 text-white p-5 rounded-full shadow-premium z-[150] flex items-center gap-3 border-iridescent group overflow-hidden"
          >
            {/* Pulsing Glow Overlay */}
            <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute inset-0 bg-white rounded-full bg-primary-400"
            />
            <FaCommentDots size={24} className="relative z-10 drop-shadow-lg" />
            <span className="font-black uppercase tracking-widest text-xs relative z-10 hidden md:inline">AI Bot</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window - Spatial UI */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, rotateX: 20 }}
            className="fixed bottom-8 right-8 w-[400px] h-[600px] glass-dark rounded-[32px] shadow-premium flex flex-col z-[200] border-iridescent overflow-hidden perspective-1000"
          >
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary-600/80 to-indigo-600/80 text-white flex justify-between items-center z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-lg">
                  <FaRobot size={22} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs opacity-70">AI Assistant</h3>
                  <h3 className="font-bold text-lg leading-tight">StayScape AI</h3>
                </div>
              </div>
              <motion.button 
                whileHover={{ rotate: 90, scale: 1.1 }}
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </motion.button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  
                  {/* Text Bubble */}
                  <div className={`max-w-[85%] rounded-[24px] px-5 py-3.5 text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'glass-dark border-white/5 text-gray-100 rounded-tl-none'}`}>
                    {msg.content}
                  </div>

                  {/* AI Rich Property Cards */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="mt-4 space-y-4 w-full">
                      {msg.properties.map(p => (
                        <Link key={p._id} to={`/property/${p._id}`} className="block glass-dark border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 group">
                          <div className="flex">
                            <div className="w-24 h-24 overflow-hidden">
                               <img src={p.images[0]?.url || 'https://via.placeholder.com/100'} alt="prop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-3 flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-tighter text-primary-500 mb-1">{p.location.city}</p>
                              <p className="text-xs font-bold truncate text-white mb-1">{p.title}</p>
                              <p className="text-sm text-white font-black">₹{p.pricePerNight}<span className="text-gray-500 text-[10px] font-medium ml-1">/NIGHT</span></p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-start">
                  <div className="glass-dark rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1.5">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary-500 rounded-full"></motion.div>
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary-500 rounded-full"></motion.div>
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary-500 rounded-full"></motion.div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 glass-dark border-t border-white/5 flex items-center gap-3">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="How can I help you?"
                className="flex-1 bg-white/5 border-none rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-primary-500 text-white p-3.5 rounded-2xl shadow-neon transition disabled:opacity-50"
              >
                <FaPaperPlane size={16} />
              </motion.button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
