import React, { useMemo, useState } from 'react';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';
import { ShieldAlert, ArrowRight, Zap, Sparkles } from 'lucide-react';

const tabs = ['All', 'Critical', 'High', 'Medium', 'Low', 'Info'];

export default function VulnPanel({ vulnerabilities = [], onSelectVuln }) {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() => {
    if (activeTab === 'All') return vulnerabilities;
    return vulnerabilities.filter((item) => item.severity?.toLowerCase() === activeTab.toLowerCase());
  }, [activeTab, vulnerabilities]);

  return (
    <GlassCard className="p-6 flex flex-col h-full w-full">
      <SectionHeader
        title="Discovered Vulnerabilities"
        subtitle="Investigate exposed attack vectors, threat scoring, and AI code fixes."
        icon={ShieldAlert}
        color="rose"
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-xs transition-all duration-300 font-mono uppercase tracking-widest font-bold ${
              activeTab === tab
                ? 'btn-cyber-primary text-white shadow-md'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-rose-500/15'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto min-h-0 pr-2">
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground">
            <tr className="border-b border-rose-500/20">
              <th className="pb-3 px-3 font-mono text-[10px] uppercase tracking-widest text-rose-300 font-bold">Threat Name</th>
              <th className="pb-3 px-3 font-mono text-[10px] uppercase tracking-widest text-rose-300 font-bold">Endpoint</th>
              <th className="pb-3 px-3 font-mono text-[10px] uppercase tracking-widest text-rose-300 font-bold">Category</th>
              <th className="pb-3 px-3 font-mono text-[10px] uppercase tracking-widest text-rose-300 font-bold">Severity</th>
              <th className="pb-3 px-3 font-mono text-[10px] uppercase tracking-widest text-rose-300 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
               // Determine styles based on severity with new color palette
               let sevClass = "bg-purple-500/15 text-purple-300 border border-purple-500/30";
               let sevGlow = "bg-purple-400";
               if (item.severity?.toLowerCase() === 'critical') { 
                 sevClass = "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]"; 
                 sevGlow = "bg-rose-400"; 
               } else if (item.severity?.toLowerCase() === 'high') { 
                 sevClass = "bg-orange-500/20 text-orange-300 border border-orange-500/40"; 
                 sevGlow = "bg-orange-400"; 
               } else if (item.severity?.toLowerCase() === 'medium') { 
                 sevClass = "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40"; 
                 sevGlow = "bg-fuchsia-400"; 
               }

               return (
                <tr key={`${item.name}-${i}`} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-3 font-bold text-foreground max-w-[220px] truncate" title={item.name}>
                    {item.name}
                  </td>
                  <td className="py-4 px-3 font-mono text-xs text-rose-400 truncate max-w-[220px]" title={item.url || item.endpoint}>
                    {item.url || item.endpoint}
                  </td>
                  <td className="py-4 px-3 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                    {item.category || 'Vulnerability'}
                  </td>
                  <td className="py-4 px-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest ${sevClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${sevGlow}`} />
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button 
                      onClick={() => onSelectVuln?.(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-fuchsia-500/15 to-purple-600/15 hover:from-rose-500 hover:to-purple-600 border border-rose-500/30 hover:border-transparent px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-rose-300 hover:text-white transition-all font-mono uppercase shadow-sm group-hover:scale-105"
                    >
                      <Zap className="h-3 w-3" />
                      Remediate
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="py-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
            No vulnerabilities detected in this filter range.
          </p>
        ) : null}
      </div>
    </GlassCard>
  );
}
