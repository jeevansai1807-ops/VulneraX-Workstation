import React from 'react';

export default function SectionHeader({ eyebrow, title, description, subtitle, icon: Icon, color = "rose", action = null }) {
  const desc = description || subtitle;
  
  return (
    <div className="flex items-start justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          {eyebrow ? (
            <p className="mb-1 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-rose-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-black text-foreground tracking-tight">{title}</h2>
          {desc ? <p className="mt-0.5 text-xs text-muted-foreground font-medium">{desc}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
