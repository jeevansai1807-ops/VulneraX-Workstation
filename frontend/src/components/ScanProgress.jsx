import React from 'react';
import { Loader2, CheckCircle2, Zap, XCircle } from 'lucide-react';
import CyberOrb3D from './CyberOrb3D';

const PHASES = [
  'DNS Lookup',
  'Port Scanning',
  'Fingerprinting',
  'Checking Headers',
  'Analyzing Cookies',
  'SSL Scan',
  'Crawling Website',
  'Testing Vulnerabilities',
  'Calculating Risk Score',
];

export default function ScanProgress({ status, currentPhase, onAbort }) {
  if (!status || status === 'completed' || status === 'error' || status === 'aborted') return null;

  const currentIndex = PHASES.findIndex(
    (p) => currentPhase?.toLowerCase().includes(p.toLowerCase())
  );

  return (
    <div className="glass-panel p-6 sm:p-8 animate-fade-in border border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 text-rose-400">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
              Autonomous Scan Active
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </h3>
            <p className="text-xs font-mono text-rose-300/80">
              {currentPhase || 'Initializing Sentinel Crawlers...'}
            </p>
          </div>
        </div>

        {onAbort && (
          <button
            onClick={onAbort}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/15 hover:bg-destructive/25 text-rose-300 border border-destructive/35 font-mono font-bold text-xs uppercase transition-all shadow-sm"
            title="Cancel ongoing scan"
          >
            <XCircle className="h-4 w-4" />
            Abort Scan
          </button>
        )}
      </div>

      {/* Radiant Multi-stop Progress bar */}
      <div className="mb-6 h-2 rounded-full bg-white/5 overflow-hidden border border-rose-500/20 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-purple-600 shadow-[0_0_15px_rgba(244,63,94,0.6)] transition-all duration-700 ease-out"
          style={{ width: `${Math.max(((currentIndex + 1) / PHASES.length) * 100, 8)}%` }}
        />
      </div>

      {/* Phase list */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PHASES.map((phase, i) => {
          let Icon, color, bgColor;
          if (i < currentIndex) {
            Icon = CheckCircle2;
            color = 'text-emerald-300';
            bgColor = 'bg-emerald-500/15 border border-emerald-500/30';
          } else if (i === currentIndex) {
            Icon = Loader2;
            color = 'text-rose-300 font-bold';
            bgColor = 'bg-rose-500/20 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
          } else {
            Icon = null;
            color = 'text-muted-foreground';
            bgColor = 'bg-white/5 border border-white/5';
          }

          return (
            <div
              key={phase}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-mono ${color} ${bgColor} transition-all duration-300`}
            >
              {Icon ? (
                <Icon className={`h-3.5 w-3.5 shrink-0 ${i === currentIndex ? 'animate-spin' : ''}`} />
              ) : (
                <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20" />
              )}
              <span className="truncate">{phase}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
