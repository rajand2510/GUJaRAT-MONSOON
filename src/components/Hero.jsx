import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none z-10 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="text-center"
      >
        <h1 
          className="text-white leading-[1.15] tracking-tighter flex flex-col items-center"
          style={{ 
            textShadow: '0 10px 40px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.8)' 
          }}
        >
          <span className="text-[80px] md:text-[130px] lg:text-[160px] mr-8 md:mr-16" style={{ fontFamily: "'Yatra One', system-ui" }}>गुजरात</span>
          <span className="text-[55px] md:text-[85px] lg:text-[110px] ml-32 md:ml-64 lowercase tracking-wide mt-[-20px] md:mt-[-40px]" style={{ fontFamily: "'Samarkan', sans-serif" }}>Monsoon</span>
        </h1>
      </motion.div>
    </div>
  );
}
