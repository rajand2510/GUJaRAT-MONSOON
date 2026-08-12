import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const proverbs = [
  {
    gujarati: "આવ રે વરસાદ, ઘેબરીયો પ્રસાદ...",
    english: "Come rain, bring the sweet offerings..."
  },
  {
    gujarati: "મોરલાની ચીચિયારી ને વાદળનો ગડગડાટ...",
    english: "The peacock's cry and the thunder's roar..."
  },
  {
    gujarati: "પહેલો વરસાદ ને માટીની મહેક...",
    english: "The first rain and the scent of the earth..."
  },
  {
    gujarati: "વાદળડી વરસી રે, મારો મનડો હરખાય...",
    english: "The clouds pour down, and my heart rejoices..."
  }
];

export default function ProverbsWidget() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % proverbs.length);
    }, 8000); // Change every 8 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-24 left-6 md:left-12 z-20 pointer-events-none max-w-[280px]">
      <div className="relative">
        <Quote className="absolute -top-4 -left-4 w-8 h-8 text-white/10 rotate-180" />
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="flex flex-col gap-2"
          >
            <p className="text-white/90 font-serif text-lg md:text-xl leading-relaxed drop-shadow-md">
              {proverbs[index].gujarati}
            </p>
            <p className="text-white/50 text-xs md:text-sm font-light tracking-wide italic">
              {proverbs[index].english}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
