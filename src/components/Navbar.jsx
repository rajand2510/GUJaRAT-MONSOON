import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Map, MapIcon, PinIcon } from 'lucide-react';

export default function Navbar() {
  const [onlineCount, setOnlineCount] = useState(37);
  const [time, setTime] = useState('');

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase());
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Unique session ID for presence tracking
  const [sessionId] = useState(() => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7));

  // True Real-Time Presence tracking
  useEffect(() => {
    // 1. Send heartbeat immediately, then every 10 seconds
    const sendHeartbeat = () => {
      fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionId })
      }).catch(err => console.log("Heartbeat failed", err));
    };
    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    // 2. Poll the exact active user count every 5 seconds
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/presence');
        const data = await res.json();
        if (data && data.count !== undefined) {
          // If in mock mode without DB keys, just slightly vary it around 37 for aesthetics
          if (data.mock) {
            setOnlineCount(prev => {
              let next = prev + (Math.floor(Math.random() * 5) - 2);
              if (next < 30) next = 30 + Math.floor(Math.random() * 3);
              if (next > 45) next = 45 - Math.floor(Math.random() * 3);
              return next;
            });
          } else {
            setOnlineCount(data.count);
          }
        }
      } catch (err) {
        console.log("Failed to fetch count", err);
      }
    };
    fetchCount();
    const pollInterval = setInterval(fetchCount, 5000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
    };
  }, [sessionId]);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 2 }}
      className="w-full flex items-center justify-between px-6 md:px-12 py-6 z-20"
    >
      {/* Left - Location Tag */}
      <div 
        className="backdrop-blur-2xl border border-white/30 rounded-[100px] px-5 py-2 text-white/90 text-xs md:text-sm tracking-wide pointer-events-none overflow-hidden flex items-center gap-2 relative shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2), inset 0 2px 10px rgba(255,255,255,0.3), inset 0 -2px 15px rgba(0,0,0,0.3)'
        }}
      >
        {/* Glossy liquid sheen overlay */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-[100px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%)'
          }}
        />
       <MapIcon/>
        <span className="relative z-10 font-medium drop-shadow-md">
          Girnar, Gujarat
        </span>
      </div>

      {/* Center - Online indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-full px-4 py-1.5 cursor-default">
        <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_rgba(154,203,98,0.6)]" />
        <span className="font-medium text-xs text-white/90 drop-shadow-sm">{onlineCount} online</span>
      </div>

      {/* Right - Links */}
      <div className="flex items-center gap-3">
        <a href="#" className="bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-2xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-full px-4 py-1.5 flex items-center gap-1.5 font-medium text-xs">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="opacity-100 text-white drop-shadow-sm">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781s.18-1.2.78-1.381c4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.36h-.06z"/>
          </svg>
          <span className="text-white drop-shadow-sm">Spotify</span> <span className="opacity-50">↗</span>
        </a>
        <a href="#" className="bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-2xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-full px-4 py-1.5 flex items-center gap-1.5 font-medium text-xs">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="opacity-100 text-white drop-shadow-sm">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19.556c-4.173 0-7.556-3.383-7.556-7.556S7.827 4.444 12 4.444s7.556 3.383 7.556 7.556-3.383 7.556-7.556 7.556zm3.627-7.98l-5.6-3.232a.49.49 0 0 0-.737.424v6.465a.49.49 0 0 0 .737.424l5.6-3.232a.49.49 0 0 0 0-.85z" />
          </svg>
          YT Music <span className="opacity-50">↗</span>
        </a>
      </div>
    </motion.nav>
  );
}
