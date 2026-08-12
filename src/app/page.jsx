'use client';
import { AnimatePresence } from 'framer-motion';

import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MusicPlayer from '../components/MusicPlayer';
import CustomCursor from '../components/CustomCursor';
import ChatPanel from '../components/ChatPanel';
import AmbientMixer from '../components/AmbientMixer';
import ProverbsWidget from '../components/ProverbsWidget';
import { songs } from '../data/songs';

function App() {
  const backgrounds = ['/bg.jpg', '/bg2.jpg'];
  const [bgIndex, setBgIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentSong, setCurrentSong] = useState(songs[0]); // Default to first song (Alakh Nu)
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeEffects, setActiveEffects] = useState({ rain: false, lightning: false, wind: false });
  const lastSyncTimestampRef = useRef(0);

  useEffect(() => {
    // Check URL for secret vip parameter
    const params = new URLSearchParams(window.location.search);
    const vipParam = params.get('vip');
    if (vipParam === 'monsoon') {
      setActiveRoom('monsoon-vip-room');
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const broadcastPlayerState = async (newState) => {
    if (!activeRoom) return;
    try {
      const payload = {
        room: activeRoom,
        type: 'playerState',
        playerState: {
          songId: newState.songId || currentSong.id,
          isPlaying: newState.isPlaying !== undefined ? newState.isPlaying : isPlaying,
          currentTime: newState.currentTime || 0,
          timestamp: Date.now()
        }
      };
      
      // Update local tracking so we don't bounce our own state back
      lastSyncTimestampRef.current = payload.playerState.timestamp;

      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Failed to broadcast player state", e);
    }
  };

  const togglePlay = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    broadcastPlayerState({ isPlaying: newPlayState });
  };
  
  const nextSong = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
    broadcastPlayerState({ songId: songs[nextIndex].id, isPlaying: true });
  };

  const prevSong = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
    broadcastPlayerState({ songId: songs[prevIndex].id, isPlaying: true });
  };

  const handleRemotePlayerState = (state) => {
    if (!state || state.timestamp <= lastSyncTimestampRef.current) return;
    
    // We received a newer state from someone else!
    lastSyncTimestampRef.current = state.timestamp;
    
    if (state.songId !== currentSong.id) {
      const newSong = songs.find(s => s.id === state.songId);
      if (newSong) setCurrentSong(newSong);
    }
    
    if (state.isPlaying !== isPlaying) {
      setIsPlaying(state.isPlaying);
    }
    
    // Current time syncing will be handled inside MusicPlayer.jsx using a prop 
    // but for simple sync, play/pause and song change is enough to keep the room together!
  };

  return (
    <div className="relative w-full h-screen overflow-hidden cursor-none">
      <CustomCursor mousePosition={mousePosition} />
      <Background mousePosition={mousePosition} bgImage={backgrounds[bgIndex]} activeEffects={activeEffects} />
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <Navbar />
        
        <Hero />
        
        <MusicPlayer 
          currentSong={currentSong}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          nextSong={nextSong}
          prevSong={prevSong}
          onScrub={(time) => broadcastPlayerState({ currentTime: time })}
          remoteSyncTime={null} // Advanced time syncing can be implemented later
        />
        
        <AnimatePresence>
          {activeRoom && (
            <ChatPanel 
              room={activeRoom} 
              onClose={() => {
                setActiveRoom(null);
                window.history.pushState({}, '', '/');
              }} 
              onSyncPlayerState={handleRemotePlayerState}
            />
          )}
        </AnimatePresence>

        <AmbientMixer activeEffects={activeEffects} setActiveEffects={setActiveEffects} />
        <ProverbsWidget />
        
        {/* Unique Cinematic Scene Preview */}
        <div 
          onClick={() => setBgIndex((prev) => (prev + 1) % backgrounds.length)}
          className="absolute bottom-10 right-6 md:right-12 flex flex-col items-end gap-3 z-10 group cursor-pointer"
        >
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
            <span className="w-6 h-[1px] bg-white/50"></span>
            <span className="text-[9px] text-white/70 tracking-[0.3em] uppercase font-semibold drop-shadow-md">
              Next Scene
            </span>
          </div>
          
          <div 
            className="w-[100px] h-[60px] md:w-[140px] md:h-[80px] backdrop-blur-2xl border border-white/30 rounded-2xl overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.6),inset_0_2px_15px_rgba(255,255,255,0.5)]"
          >
            {/* The actual image preview */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-110 group-hover:scale-100"
              style={{ backgroundImage: `url('${backgrounds[(bgIndex + 1) % backgrounds.length]}')` }}
            />
            
            {/* Liquid Glass Sheen */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 100%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
