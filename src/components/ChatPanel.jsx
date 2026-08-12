'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, X, MessageSquare } from 'lucide-react';

export default function ChatPanel({ room, onClose, onSyncPlayerState }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');
  
  const messagesEndRef = useRef(null);

  // Load name and uid from local storage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('gujarat_monsoon_name');
    if (savedName) {
      setDisplayName(savedName);
      setIsNameSet(true);
    }
    
    let savedUserId = localStorage.getItem('gujarat_monsoon_uid');
    if (!savedUserId) {
      savedUserId = 'user_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('gujarat_monsoon_uid', savedUserId);
    }
    setUserId(savedUserId);
  }, []);

  // Poll for messages
  useEffect(() => {
    if (!room) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?room=${room}`);
        if (res.ok) {
          const data = await res.json();
          
          if (data.playerState && onSyncPlayerState) {
            onSyncPlayerState(data.playerState);
          }

          const parsed = data.messages.map(msg => 
            typeof msg === 'string' ? JSON.parse(msg) : msg
          ).reverse();
          
          setMessages(parsed);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [room]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isNameSet) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // optimistic clear

    // Optimistic UI update
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      author: displayName,
      userId: userId,
      message: messageText,
      timestamp: Date.now(),
      isOptimistic: true
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, message: messageText, author: displayName, userId })
      });
      // The next polling cycle will pull the actual message and replace the optimistic one
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-[350px] z-50 p-4 pt-24 pb-8 flex flex-col"
    >
      <div 
        className="flex-1 flex flex-col backdrop-blur-3xl rounded-[30px] border border-white/20 overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.1)]"
        style={{ 
          background: 'linear-gradient(135deg, rgba(15, 25, 30, 0.7) 0%, rgba(5, 10, 15, 0.9) 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-white/80" />
            <h3 className="text-white font-medium text-sm tracking-wide">Listen Party</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Room ID Bar */}
        <div className="bg-black/40 py-2 px-4 flex items-center justify-between border-b border-white/5">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Room Code</span>
          <span className="text-xs text-accent-green font-mono tracking-wider">{room}</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <MessageSquare size={32} className="mb-2 text-white/50" />
              <p className="text-sm text-white/80 font-medium">It's quiet here...</p>
              <p className="text-xs text-white/60 mt-1">Be the first to send a message!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.userId ? msg.userId === userId : msg.author === displayName;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <span className={`text-[10px] text-white/50 mb-1 ${isMe ? 'mr-2' : 'ml-2'}`}>{msg.author} {isMe && '(You)'}</span>
                    <div 
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isMe 
                          ? 'bg-white text-black rounded-tr-sm shadow-[0_4px_15px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/10 text-white border border-white/10 rounded-tl-sm backdrop-blur-md'
                      } ${msg.isOptimistic ? 'opacity-70' : ''}`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-white/30 mt-1 mx-1">{formatTime(msg.timestamp)}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isNameSet ? (
          <div className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-md">
            <form onSubmit={(e) => {
              e.preventDefault();
              const finalName = nameInput.trim() || `Guest-${Math.floor(Math.random() * 10000)}`;
              setDisplayName(finalName);
              setIsNameSet(true);
              localStorage.setItem('gujarat_monsoon_name', finalName);
            }} className="flex flex-col gap-2">
              <label className="text-xs text-white/70 font-medium">Choose a display name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Leave blank for Anonymous"
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-white/50 transition-colors placeholder:text-white/30"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                >
                  <User size={16} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-md flex flex-col gap-2">
            <div className="text-[10px] text-white/50 flex justify-between items-center px-1">
              <span>Chatting as <strong className="text-white/80">{displayName}</strong></span>
              <button 
                onClick={() => {
                  setIsNameSet(false);
                  setNameInput(displayName.startsWith('Guest') ? '' : displayName);
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 relative">
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-white/10 border border-white/20 rounded-full pl-4 pr-10 py-2.5 text-sm text-white outline-none focus:border-white/50 transition-colors placeholder:text-white/40"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-0 hover:scale-105 transition-all"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
