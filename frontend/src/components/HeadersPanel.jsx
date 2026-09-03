import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { headerStatusColor } from '../utils/helpers';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';

export default function HeadersPanel({ headers = [] }) {
  if (!headers || headers.length === 0) {
    return (
      <GlassCard className="p-6">
        <SectionHeader title="HTTP Security Headers" icon={ShieldCheck} color="rose" />
        <p className="text-xs font-mono text-muted-foreground mt-4">No header telemetry available for target.</p>
      </GlassCard>
    );
  }

  const presentCount = headers.filter((h) => h.present).length;
  const weakCount = headers.filter((h) => h.present && h.severity === 'medium').length;
  const missingCount = headers.filter((h) => !h.present).length;

  return (
    <GlassCard className="p-6">
      <SectionHeader 
        title="HTTP Security Headers" 
        subtitle={`${presentCount} present · ${weakCount} weak · ${missingCount} missing`}
        icon={ShieldCheck} 
        color="rose" 
      />

      <div className="space-y-2 mt-5">
        {headers.map((header, i) => {
          const isWeak = header.present && header.severity === 'medium';
          const status = headerStatusColor(header.present, isWeak);
          const StatusIcon = header.present
            ? (isWeak ? AlertTriangle : CheckCircle2)
            : XCircle;

          let badgeStyle = "bg-rose-500/15 text-rose-300 border border-rose-500/30";
          if (header.present && !isWeak) {
            badgeStyle = "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
          } else if (isWeak) {
            badgeStyle = "bg-amber-500/15 text-amber-300 border border-amber-500/30";
          }

          return (
            <div
              key={`${header.name}-${i}`}
              className="flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5 border border-rose-500/15 hover:border-rose-500/35 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusIcon className={`h-4 w-4 shrink-0 ${header.present && !isWeak ? 'text-emerald-400' : isWeak ? 'text-amber-400' : 'text-rose-400'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground font-mono">{header.name}</p>
                  {header.value && (
                    <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[280px]" title={header.value}>
                      {header.value}
                    </p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 ml-3 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeStyle}`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
