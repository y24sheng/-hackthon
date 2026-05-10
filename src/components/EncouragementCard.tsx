import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Heart } from 'lucide-react';

interface EncouragementCardProps {
  data: {
    feedback: string;
    atmosphere: string;
    colorTheme: string;
  };
  onClose: () => void;
}

export function EncouragementCard({ data, onClose }: EncouragementCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl"
        style={{ backgroundColor: data.colorTheme || '#FDFCFB' }}
      >
        {/* Background blobs for aesthetic */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/30 blur-3xl rounded-full translate-x-1/4 translate-y-1/4" />

        <div className="relative p-10 flex flex-col items-center text-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-white/80 backdrop-blur-md flex items-center justify-center mb-8 shadow-sm">
            <Sparkles className="w-8 h-8 text-[#BC6C25]" />
          </div>

          <div className="space-y-6 mb-12">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400/80">
              {data.atmosphere} · 心灵回声
            </h3>
            <p className="text-xl md:text-2xl font-serif leading-relaxed text-gray-800">
              {data.feedback}
            </p>
            <div className="w-8 h-[1px] bg-gray-300 mx-auto mt-6" />
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 rounded-full bg-white/60 backdrop-blur-md text-gray-600 text-sm font-medium border border-white/40 shadow-sm hover:bg-white/80 transition-all flex items-center justify-center gap-2 group"
          >
            <span>被看见了，谢谢</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
