import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Disc } from 'lucide-react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';

export default function MusicPlayer({ currentSong, isPlaying, togglePlay, nextSong, prevSong, onScrub }) {
  const {
    containerRef: ytContainerRef,
    isReady,
    duration,
    currentTime: ytCurrentTime,
    loadAndPlay,
    cueVideo,
    play,
    pause,
    seekTo,
  } = useYouTubePlayer({ onEnded: nextSong });

  const [progress, setProgress] = useState(0);
  const [displayCurrentTime, setDisplayCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scrubTime, setScrubTime] = useState(null);
  const loadedVideoRef = useRef(null);

  // YouTube thumbnail as cover art
  const coverUrl = currentSong?.youtubeId
    ? `https://img.youtube.com/vi/${currentSong.youtubeId}/hqdefault.jpg`
    : null;

  // ── Load video when song changes ───────────────────────────────────
  useEffect(() => {
    if (!isReady || !currentSong?.youtubeId) return;

    // Skip if same video is already loaded
    if (loadedVideoRef.current === currentSong.youtubeId) return;
    loadedVideoRef.current = currentSong.youtubeId;

    if (isPlaying) {
      loadAndPlay(currentSong.youtubeId, currentSong.startTime || 0);
    } else {
      cueVideo(currentSong.youtubeId, currentSong.startTime || 0);
    }
  }, [currentSong, isReady]);

  // ── Handle play/pause ──────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !currentSong?.youtubeId) return;

    if (isPlaying) {
      play();
    } else {
      pause();
    }
  }, [isPlaying, isReady]);

  // ── Sync progress from YouTube player ──────────────────────────────
  useEffect(() => {
    if (!isDragging) {
      setDisplayCurrentTime(ytCurrentTime);
      if (duration > 0) {
        setProgress((ytCurrentTime / duration) * 100);
      }
    }
  }, [ytCurrentTime, duration, isDragging]);

  // ── Keyboard Shortcuts ─────────────────────────────────────────────
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
      {/* Hidden YouTube Player – 1×1px off-screen */}
      <div className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div ref={ytContainerRef} />
      </div>
      
      <div 
        className="backdrop-blur-2xl border border-white/30 rounded-[100px] p-2 pr-3 md:pr-6 flex items-center gap-2 md:gap-4 relative overflow-hidden cursor-default"
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

        {/* Circular Album Artwork (YouTube Thumbnail) */}
        <div className={`w-12 h-12 md:w-[68px] md:h-[68px] rounded-full bg-black/40 flex items-center justify-center shrink-0 overflow-hidden relative border border-white/30 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)] z-10 ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
          {coverUrl ? (
            <div className="absolute inset-0 bg-cover bg-center opacity-70 transition-all duration-700" style={{backgroundImage: `url('${coverUrl}')`}}></div>
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
          <h3 className="text-white font-semibold text-sm md:text-[15px] truncate drop-shadow-sm tracking-wide">
            {currentSong?.title || "Select a song"}
          </h3>
          <p className="text-white/70 text-[10px] md:text-xs truncate mb-1 md:mb-2">
            {currentSong?.artist || "Unknown Artist"}
          </p>
          
          {/* Progress Slider & Time */}
          <div className="flex items-center gap-2 md:gap-3 w-full">
            <span className="text-[9px] md:text-[10px] text-white/60 font-medium tracking-wider w-6 md:w-8 shrink-0 text-left">{formatTime(scrubTime !== null ? scrubTime : displayCurrentTime)}</span>
            <div className="flex-1 group relative flex items-center h-8 md:h-4">
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={scrubTime !== null ? scrubTime : displayCurrentTime}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={(e) => {
                  setIsDragging(false);
                  const newTime = Number(e.target.value);
                  seekTo(newTime);
                  setDisplayCurrentTime(newTime);
                  setScrubTime(null);
                  if (onScrub) onScrub(newTime);
                }}
                onChange={(e) => {
                  setScrubTime(Number(e.target.value));
                }}
                className="absolute inset-0 w-full h-full appearance-none bg-transparent outline-none cursor-pointer z-20 opacity-0 touch-none [-webkit-tap-highlight-color:transparent]"
              />
              {/* Fake track for visual (always visible) */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 md:h-1.5 bg-black/40 rounded-full pointer-events-none transition-all duration-300 shadow-inner group-hover:h-2">
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[12px] rounded-full transition-all duration-75 overflow-hidden wavy-track"
                  style={{ 
                    width: `${scrubTime !== null ? (scrubTime/duration)*100 : progress}%`,
                    animationPlayState: (!isPlaying || isDragging) ? 'paused' : 'running'
                  }}
                />
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)] transition-opacity duration-300 pointer-events-none ${isPlaying && !isDragging ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}
                  style={{ left: `calc(${scrubTime !== null ? (scrubTime/duration)*100 : progress}% - 5px)` }}
                />
              </div>
            </div>
            <span className="text-[9px] md:text-[10px] text-white/60 font-medium tracking-wider w-6 md:w-8 shrink-0 text-right">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 pl-1 md:pl-4 z-10">
          <button onClick={prevSong} className="text-white/80 hover:text-white hover:scale-110 transition-all cursor-pointer">
            <SkipBack className="w-4 h-4 md:w-[18px] md:h-[18px]" fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay} 
            className="w-8 h-8 md:w-[42px] md:h-[42px] rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 md:w-[20px] md:h-[20px] fill-current" /> : <Play className="w-4 h-4 md:w-[20px] md:h-[20px] fill-current ml-0.5 md:ml-1" />}
          </button>
          <button onClick={nextSong} className="text-white/80 hover:text-white hover:scale-110 transition-all cursor-pointer">
            <SkipForward className="w-4 h-4 md:w-[18px] md:h-[18px]" fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
