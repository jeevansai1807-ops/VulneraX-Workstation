import React from 'react';

export default function SectionHeader({ eyebrow, title, description, subtitle, icon: Icon, color = "primary", action = null }) {
  const desc = description || subtitle;
  
  return (
    <div className="flex items-start justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
          {desc ? <p className="mt-0.5 text-sm text-muted-foreground font-medium">{desc}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
