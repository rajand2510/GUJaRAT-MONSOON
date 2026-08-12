import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function Background({ mousePosition, bgImage = '/bg.jpg', activeEffects }) {
  const controls = useAnimation();
  const [lightning, setLightning] = useState(false);
  
  useEffect(() => {
    // Subtle parallax effect
    const x = (mousePosition.x - window.innerWidth / 2) * -0.01;
    const y = (mousePosition.y - window.innerHeight / 2) * -0.01;
    
    controls.start({
      x,
      y,
      transition: { type: 'spring', damping: 50, stiffness: 400, mass: 1 }
    });
  }, [mousePosition, controls]);

  const isRainActive = activeEffects?.rain;
  const isLightningActive = activeEffects?.lightning;
  const isWindActive = activeEffects?.wind;

  // Lightning effect tied to isLightningActive
  useEffect(() => {
    let timeout1, timeout2, timeout3, interval;
    if (isLightningActive) {
      // initial flash
      setLightning(true);
      timeout1 = setTimeout(() => setLightning(false), 150);
      
      timeout2 = setTimeout(() => {
        setLightning(true);
        timeout3 = setTimeout(() => setLightning(false), 100);
      }, 250);

      // repeat every 2.5s while active
      interval = setInterval(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 150);
      }, 2500);
    } else {
      setLightning(false);
    }
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearInterval(interval);
    };
  }, [isLightningActive]);

  return (
    <div className="fixed inset-0 z-0 bg-bg overflow-hidden pointer-events-none">
      <motion.div
        animate={controls}
        className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)] bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`
        }}
      />
      
      {/* Rainfall Layer (only when active) */}
      <div className={`absolute -inset-20 rain-layer mix-blend-screen transition-opacity duration-1000 ${isRainActive ? 'opacity-40' : 'opacity-0'}`} />
      <div className={`absolute -inset-20 rain-layer-slow mix-blend-screen transition-opacity duration-1000 ${isRainActive ? 'opacity-30' : 'opacity-0'}`} />
      
      {/* Cinematic Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle Mist / Breathing Light (Moves faster if wind is active) */}
      <div className={`absolute inset-0 bg-gradient-to-t from-[#D49A55]/10 via-transparent to-transparent opacity-50 ${isWindActive ? 'animate-[wind_3s_ease-in-out_infinite_alternate]' : 'animate-[breathe_8s_ease-in-out_infinite_alternate]'}`} />
      
      {/* Lightning Flash Overlay */}
      <div 
        className={`absolute inset-0 bg-white mix-blend-overlay pointer-events-none transition-opacity duration-75 ${lightning ? 'opacity-80' : 'opacity-0'}`} 
      />

      <style>{`
        @keyframes breathe {
          from { opacity: 0.3; transform: scale(1); }
          to { opacity: 0.6; transform: scale(1.05); }
        }
        
        @keyframes wind {
          from { opacity: 0.5; transform: translateX(-20px) scale(1); }
          to { opacity: 0.8; transform: translateX(20px) scale(1.05); }
        }
        
        .rain-layer {
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 20 0 L 20 40 M 80 50 L 80 80 M 140 120 L 140 170 M 190 20 L 190 70 M 50 150 L 50 190 M 110 30 L 110 50' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          animation: fallingRain 0.5s linear infinite;
          transform: rotate(8deg) scale(1.5);
          transform-origin: center;
        }

        .rain-layer-slow {
          background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 30 0 L 30 20 M 100 80 L 100 110 M 200 150 L 200 190 M 250 40 L 250 70 M 150 220 L 150 250' stroke='rgba(255,255,255,0.2)' stroke-width='1' stroke-linecap='round'/%3E%3C/svg%3E");
          background-size: 300px 300px;
          animation: fallingRain 0.8s linear infinite;
          transform: rotate(8deg) scale(1.2);
          transform-origin: center;
        }

        @keyframes fallingRain {
          0% { background-position: 0 0; }
          100% { background-position: 0 400px; }
        }
      `}</style>
    </div>
  );
}
