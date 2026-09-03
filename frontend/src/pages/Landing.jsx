import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import CyberOrb3D from '../components/CyberOrb3D';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full flex flex-col items-center justify-start overflow-visible pt-12 pb-24">
      {/* 3D Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/20 via-fuchsia-600/20 to-violet-600/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-4 w-full">
        {/* 3D Cyber Sentinel Orb Mascot - Fully Visible with no top clipping */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-2 flex items-center justify-center"
        >
          <CyberOrb3D 
            size="large"
            interactive={true}
            showRings={true}
          />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black text-foreground tracking-tighter mb-4"
        >
          See everything<span className="text-gradient-orb">.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mb-8 leading-relaxed"
        >
          Advanced network intelligence, wrapped in an elegant interface. Protect your perimeter with absolute clarity.
        </motion.p>
        
        <motion.button 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => navigate('/scanner')}
          className="btn-cyber-primary px-10 py-4 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-all cursor-pointer z-10"
        >
          Start Scan
        </motion.button>

        {/* 2 Feature Cards Positioned Cleanly Below Start Scan */}
        <div className="mt-14 w-full flex flex-col sm:flex-row justify-center items-stretch gap-6 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-card p-6 w-full sm:w-80 text-left hover:-translate-y-1 transition-transform cursor-pointer"
            onClick={() => navigate('/scanner')}
          >
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 w-fit mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-foreground font-bold text-lg mb-2">Deep Inspection</h3>
            <p className="text-muted-foreground text-sm">Advanced packet analysis and zero-day mapping.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="glass-card p-6 w-full sm:w-80 text-left hover:-translate-y-1 transition-transform cursor-pointer"
            onClick={() => navigate('/scanner')}
          >
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 w-fit mb-3">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-foreground font-bold text-lg mb-2">Stealth Mode</h3>
            <p className="text-muted-foreground text-sm">Undetectable sweeps to maintain network silence.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
