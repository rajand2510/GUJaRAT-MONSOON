import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Disc } from 'lucide-react';
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

export default function MusicPlayer({ currentSong, isPlaying, togglePlay, nextSong, prevSong, onScrub }) {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [builtInCoverUrl, setBuiltInCoverUrl] = useState(null);

  // Extract Built-In ID3 Artwork
  useEffect(() => {
    if (!currentSong?.audioSrc) return;

    // Fetch the file as a Blob first to avoid jsmediatags URL reader issues in Vite
    fetch(currentSong.audioSrc)
      .then(res => res.blob())
      .then(blob => {
        jsmediatags.read(blob, {
          onSuccess: function(tag) {
            const picture = tag.tags.picture;
            if (picture) {
              let base64String = "";
              for (let i = 0; i < picture.data.length; i++) {
                base64String += String.fromCharCode(picture.data[i]);
              }
              const base64 = "data:" + picture.format + ";base64," + window.btoa(base64String);
              setBuiltInCoverUrl(base64);
            } else {
              setBuiltInCoverUrl(null);
            }
          },
          onError: function(error) {
            console.log("Could not read ID3 tags:", error);
            setBuiltInCoverUrl(null);
          }
        });
      })
      .catch(err => {
        console.log("Failed to fetch audio blob for tags:", err);
        setBuiltInCoverUrl(null);
      });
  }, [currentSong]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.log("Audio play prevented:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentSong]);

  // Robust Start Time Jump
  useEffect(() => {
    if (audioRef.current && currentSong) {
      const audio = audioRef.current;
      
      const applyStartTime = () => {
        if (currentSong.startTime) {
          audio.currentTime = currentSong.startTime;
          setCurrentTime(currentSong.startTime);
        } else {
          audio.currentTime = 0;
          setCurrentTime(0);
        }
      };

      if (audio.readyState >= 1) {
        applyStartTime();
      } else {
        audio.addEventListener('loadedmetadata', applyStartTime, { once: true });
      }
    }
  }, [currentSong]);

  const [isDragging, setIsDragging] = useState(false);
  const [scrubTime, setScrubTime] = useState(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent triggering if user is typing
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault(); // prevent page scroll
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        nextSong();
      } else if (e.code === 'ArrowLeft') {
        prevSong();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextSong, prevSong]);

  // Handle Audio Events
  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (total) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    nextSong();
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 2.5 }}
      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] md:w-[650px] z-20"
    >
      <audio 
        ref={audioRef}
        src={currentSong?.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div 
        className="backdrop-blur-2xl border border-white/30 rounded-[100px] p-2 pr-6 flex items-center gap-4 relative overflow-hidden cursor-default"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 2px 10px rgba(255,255,255,0.3), inset 0 -2px 15px rgba(0,0,0,0.3)'
        }}
      >
        {/* Glossy liquid sheen overlay */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-[100px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%)'
          }}
        />

        {/* Circular Album Artwork */}
        <div className={`w-[68px] h-[68px] rounded-full bg-black/40 flex items-center justify-center shrink-0 overflow-hidden relative border border-white/30 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)] z-10 ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
          {builtInCoverUrl || currentSong?.coverUrl ? (
            <div className="absolute inset-0 bg-cover bg-center opacity-70 transition-all duration-700" style={{backgroundImage: `url('${builtInCoverUrl || currentSong?.coverUrl}')`}}></div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-black/60 opacity-90 gap-0.5">
              {/* Dynamic Fallback Equalizer */}
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className={`w-1 bg-white/80 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] ${isPlaying ? 'eq-bar' : 'h-1.5'}`} 
                  style={isPlaying ? { animationDelay: `${i * 0.15}s` } : {}} 
                />
              ))}
            </div>
          )}
          <Disc size={20} className="text-white/80 z-10 absolute mix-blend-overlay" />
          <div className="w-2.5 h-2.5 bg-black rounded-full z-10 border border-white/30 shadow-inner"></div>
        </div>
        
        {/* Track Info & Progress */}
        <div className="flex-1 min-w-0 py-1 z-10">
          <h3 className="text-white font-semibold text-[15px] truncate drop-shadow-sm tracking-wide">
            {currentSong?.title || "Select a song"}
          </h3>
          <p className="text-white/70 text-xs truncate mb-2">
            {currentSong?.artist || "Unknown Artist"}
          </p>
          
          {/* Progress Slider & Time */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] text-white/60 font-medium tracking-wider w-8">{formatTime(scrubTime !== null ? scrubTime : currentTime)}</span>
            <div className="flex-1 group relative flex items-center h-4">
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={scrubTime !== null ? scrubTime : currentTime}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={(e) => {
                  setIsDragging(false);
                  const newTime = Number(e.target.value);
                  if (audioRef.current) {
                    audioRef.current.currentTime = newTime;
                  }
                  setCurrentTime(newTime);
                  setScrubTime(null);
                  if (onScrub) onScrub(newTime);
                }}
                onChange={(e) => {
                  setScrubTime(Number(e.target.value));
                }}
                className="w-full h-1.5 appearance-none bg-black/40 rounded-full outline-none cursor-pointer relative z-10 opacity-0 group-hover:opacity-100 transition-opacity touch-none focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0) ${scrubTime !== null ? (scrubTime/duration)*100 : progress}%, rgba(0,0,0,0.4) ${scrubTime !== null ? (scrubTime/duration)*100 : progress}%)`
                }}
              />
              {/* Fake track for visual (always visible) */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1.5 bg-black/40 rounded-full pointer-events-none transition-all duration-300 shadow-inner group-hover:h-2">
                <div 
                  className="absolute left-0 top-0 h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-75 overflow-hidden wavy-track"
                  style={{ 
                    width: `${scrubTime !== null ? (scrubTime/duration)*100 : progress}%`,
                    animationPlayState: (!isPlaying || isDragging) ? 'paused' : 'running'
                  }}
                />
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)] transition-opacity duration-300 pointer-events-none ${isPlaying && !isDragging ? 'opacity-0' : 'opacity-100'}`}
                  style={{ left: `calc(${scrubTime !== null ? (scrubTime/duration)*100 : progress}% - 5px)` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-white/60 font-medium tracking-wider w-8 text-right">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0 pl-4 z-10">
          <button onClick={prevSong} className="text-white/80 hover:text-white hover:scale-110 transition-all cursor-pointer">
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay} 
            className="w-[42px] h-[42px] rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
          </button>
          <button onClick={nextSong} className="text-white/80 hover:text-white hover:scale-110 transition-all cursor-pointer">
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
