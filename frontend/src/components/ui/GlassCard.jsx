import React from 'react';

export default function GlassCard({ className = '', tone = 'default', children, onClick = null }) {
  const toneClass =
    tone === 'ai'
      ? 'border-purple-500/35 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.15)]'
      : tone === 'critical'
      ? 'border-rose-500/40 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.2)]'
      : tone === 'coral'
      ? 'border-orange-500/35 bg-orange-500/10 shadow-[0_0_40px_rgba(251,146,60,0.15)]'
      : 'border-rose-500/20 bg-card/85';

  return (
    <section 
      onClick={onClick}
      className={`rounded-3xl border backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ${toneClass} ${className}`}
    >
      {children}
    </section>
  );
}
