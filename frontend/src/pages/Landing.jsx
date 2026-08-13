import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-4 mt-[-10vh]">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6"
        >
          See everything.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mb-12 leading-relaxed"
        >
          Advanced network intelligence, wrapped in an elegant interface. Protect your perimeter with absolute clarity.
        </motion.p>
        
        <motion.button 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => navigate('/scanner')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all"
        >
          Start Scan
        </motion.button>
      </div>

      <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col md:flex-row justify-center gap-6 px-6 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:w-80 pointer-events-auto"
        >
          <Search className="h-6 w-6 text-white/80 mb-3" />
          <h3 className="text-white font-bold text-lg mb-2">Deep Inspection</h3>
          <p className="text-white/50 text-sm">Advanced packet analysis and zero-day mapping.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:w-80 pointer-events-auto"
        >
          <Eye className="h-6 w-6 text-white/80 mb-3" />
          <h3 className="text-white font-bold text-lg mb-2">Stealth Mode</h3>
          <p className="text-white/50 text-sm">Undetectable sweeps to maintain network silence.</p>
        </motion.div>
      </div>
    </div>
  );
}
