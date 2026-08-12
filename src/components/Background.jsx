import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function Background({ mousePosition, bgImage = '/bg.jpg' }) {
  const controls = useAnimation();
  
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

  return (
    <div className="fixed inset-0 z-0 bg-bg overflow-hidden pointer-events-none">
      <motion.div
        animate={controls}
        className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)] bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`
        }}
      />
      
      {/* Cinematic Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle Mist / Breathing Light */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#D49A55]/10 via-transparent to-transparent opacity-50 animate-[breathe_8s_ease-in-out_infinite_alternate]" />
      <style>{`
        @keyframes breathe {
          from { opacity: 0.3; transform: scale(1); }
          to { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
