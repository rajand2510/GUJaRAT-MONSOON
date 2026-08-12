import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic } from 'lucide-react';
import { songs } from '../data/songs';

export default function Playlist({ isOpen, setIsOpen, currentSong, setCurrentSong, isPlaying }) {
  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-6 md:right-12 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-3 rounded-full border border-white/10"
      >
        <ListMusic size={18} />
        <span className="hidden md:inline text-sm font-medium">વરસાદના ગીતો</span>
      </motion.button>

      {/* Playlist Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#071719]/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListMusic className="text-accent-green" size={20} />
                  વરસાદના ગીતો
                </h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white p-2"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {songs.map((song, index) => {
                  const isActive = currentSong?.id === song.id;
                  
                  return (
                    <button
                      key={song.id}
                      onClick={() => setCurrentSong(song)}
                      className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group ${
                        isActive 
                          ? 'bg-white/10' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className={`text-xs font-mono w-6 text-right ${isActive ? 'text-accent-green' : 'text-white/30'}`}>
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      
                      <div className="flex-1 overflow-hidden">
                        <div className={`truncate ${isActive ? 'text-white font-medium' : 'text-white/80 group-hover:text-white'}`}>
                          {song.title}
                        </div>
                        <div className="text-sm text-white/50 truncate">
                          {song.artist}
                        </div>
                      </div>
                      
                      {isActive && isPlaying && (
                        <div className="flex items-end gap-1 h-4 px-2">
                          <div className="w-1 bg-accent-green eq-bar" />
                          <div className="w-1 bg-accent-green eq-bar" />
                          <div className="w-1 bg-accent-green eq-bar" />
                        </div>
                      )}
                      {isActive && !isPlaying && (
                        <div className="w-2 h-2 rounded-full bg-accent-green" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
