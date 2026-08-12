import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export default function CustomCursor({ mousePosition }) {
  // Use framer-motion motion values for smooth following
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring config for smooth lagging effect
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);
  
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Ripple state
  const [ripples, setRipples] = useState([]);
  const lastRipplePos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if device supports touch (mobile/tablet)
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    cursorX.set(mousePosition.x);
    cursorY.set(mousePosition.y);

    if (!isTouchDevice) {
      // Spawn ripple on move if distance is enough
      const dist = Math.hypot(mousePosition.x - lastRipplePos.current.x, mousePosition.y - lastRipplePos.current.y);
      if (dist > 60) {
        lastRipplePos.current = { x: mousePosition.x, y: mousePosition.y };
        const newRipple = { id: Date.now() + Math.random(), x: mousePosition.x, y: mousePosition.y, isClick: false };
        setRipples(prev => [...prev.slice(-15), newRipple]); // keep max 15 ripples to avoid DOM bloat
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 1000);
      }
    }
  }, [mousePosition, cursorX, cursorY, isTouchDevice]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      setIsClicking(true);
      // Spawn a larger ripple on click
      const clickRipple = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY, isClick: true };
      setRipples(prev => [...prev.slice(-15), clickRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== clickRipple.id));
      }, 1000);
    };
    
    const handleMouseUp = () => setIsClicking(false);
    
    const handleMouseOver = (e) => {
      // Check if we are hovering over an anchor, button, or an element with cursor-pointer
      const target = e.target;
      if (target.closest('a') || target.closest('button') || target.closest('.cursor-pointer')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Small precise dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference"
        style={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        animate={{
          scale: isClicking ? 0.5 : (isHovering ? 0 : 1),
          opacity: isHovering ? 0 : 1
        }}
        transition={{ duration: 0.15 }}
      />
      
      {/* Large trailing blurred glow */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border rounded-full pointer-events-none z-[99] flex items-center justify-center transition-colors"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%'
        }}
        animate={{
          scale: isClicking ? 0.8 : (isHovering ? 1.5 : 1),
          backgroundColor: isHovering ? 'rgba(255,255,255,0.15)' : (isClicking ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'),
          borderColor: isHovering ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
          backdropFilter: isHovering ? 'blur(0px)' : 'blur(4px)',
          boxShadow: isHovering ? '0 0 20px rgba(255,255,255,0.4)' : '0 0 15px rgba(255,255,255,0.2)'
        }}
        transition={{ duration: 0.2, type: 'tween' }}
      />

      {/* Ripple effects */}
      {ripples.map(r => (
        <motion.div
          key={r.id}
          className="fixed top-0 left-0 border border-white/30 rounded-full pointer-events-none z-[98] mix-blend-overlay"
          initial={{ 
            x: r.x, y: r.y, 
            width: r.isClick ? 10 : 20, 
            height: r.isClick ? 10 : 20, 
            translateX: '-50%', translateY: '-50%',
            opacity: r.isClick ? 0.8 : 0.4
          }}
          animate={{ 
            width: r.isClick ? 100 : 70, 
            height: r.isClick ? 100 : 70, 
            opacity: 0 
          }}
          transition={{ duration: r.isClick ? 0.8 : 1, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}
