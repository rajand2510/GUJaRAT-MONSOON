import { useRef, useEffect } from 'react';
import { CloudRain, CloudLightning, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AmbientMixer({ activeEffects, setActiveEffects }) {
  const audioRefs = {
    rain: useRef(null),
    lightning: useRef(null),
    wind: useRef(null)
  };

  const tracks = [
    { id: 'rain', name: 'Rain', icon: CloudRain, url: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' },
    { id: 'lightning', name: 'Lightning', icon: CloudLightning, url: 'https://actions.google.com/sounds/v1/weather/rolling_thunder.ogg' },
    { id: 'wind', name: 'Wind', icon: Wind, url: 'https://actions.google.com/sounds/v1/weather/strong_wind.ogg' }
  ];

  const triggerEffect = (id) => {
    const isCurrentlyActive = activeEffects[id];
    
    // Toggle state for this specific effect
    setActiveEffects(prev => ({ ...prev, [id]: !isCurrentlyActive }));

    if (isCurrentlyActive) {
      // Turn off
      if (audioRefs[id].current) {
        audioRefs[id].current.pause();
        audioRefs[id].current.currentTime = 0;
      }
    } else {
      // Turn on
      if (audioRefs[id].current) {
        audioRefs[id].current.volume = 0.8;
        audioRefs[id].current.loop = true; // Ensure they loop infinitely
        audioRefs[id].current.play().catch(e => console.log('Play failed', e));
      }
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs).forEach(ref => {
        if (ref.current) ref.current.pause();
      });
    };
  }, []);

  return (
    <div className="fixed top-24 right-6 md:right-12 z-30 flex flex-col gap-3 items-end cursor-default">
      {/* Hidden Audio Elements */}
      {tracks.map(track => (
        <audio 
          key={`audio-${track.id}`}
          ref={audioRefs[track.id]} 
          src={track.url} 
          preload="auto"
        />
      ))}

      {tracks.map(track => {
        const Icon = track.icon;
        const isActive = activeEffects[track.id];
        
        return (
          <button 
            key={track.id}
            onClick={() => triggerEffect(track.id)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all shadow-lg z-10 cursor-pointer ${
              isActive 
                ? 'bg-white/20 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-110' 
                : 'bg-black/40 border-white/20 text-white/60 hover:text-white hover:bg-white/10 hover:scale-105 hover:border-white/40'
            }`}
            title={`Toggle ${track.name} Effect`}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
