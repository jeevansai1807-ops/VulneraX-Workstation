import React from 'react';
import CyberOrb3D from './CyberOrb3D';

export default function Logo({ size = 'md', animated = true }) {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size] || 'w-10 h-10';

  const orbSizes = {
    sm: 'avatar',
    md: 'avatar',
    lg: 'compact',
    xl: 'compact',
  }[size] || 'avatar';

  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/30 via-fuchsia-500/20 to-violet-600/30 border border-rose-500/40 p-0.5 shadow-[0_0_20px_rgba(244,63,94,0.35)] shrink-0 overflow-hidden ${containerSizes}`}>
      {/* 3D Cyber Sentinel Mini Orb */}
      <CyberOrb3D 
        size={orbSizes}
        interactive={false}
        showRings={false}
        showParticles={false}
        className="scale-95"
      />
    </div>
  );
}
