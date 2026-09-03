import React, { useState } from 'react';
import { Network, Wifi, ShieldAlert, ShieldCheck, Search, LayoutGrid, List } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';

const HIGH_RISK_PORTS = [21, 23, 445, 1433, 3306, 3389, 5432, 6379, 27017];

export default function PortTable({ ports = [] }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredPorts = ports.filter((p) => {
    const isRisky = HIGH_RISK_PORTS.includes(p.port);
    const isWeb = [80, 443, 8080, 8443, 3000].includes(p.port);

    if (filter === 'risky' && !isRisky) return false;
    if (filter === 'web' && !isWeb) return false;
    if (filter === 'infra' && (isWeb || isRisky)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.port.toString().includes(q) ||
        (p.service || '').toLowerCase().includes(q) ||
        (p.banner || '').toLowerCase().includes(q)
      );
    }

    return true;
  });

  const riskyCount = ports.filter(p => HIGH_RISK_PORTS.includes(p.port)).length;
  const webCount = ports.filter(p => [80, 443, 8080, 8443, 3000].includes(p.port)).length;

  return (
    <div className="space-y-6">
      <GlassCard className="relative overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-500/20 pb-4">
          <SectionHeader
            title="Discovered Ports & Services"
            subtitle={`${ports.length} network entry-points mapped on target`}
            icon={Network}
            color="rose"
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-white/5 rounded-xl p-1 border border-rose-500/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg flex items-center transition-colors ${viewMode === 'grid' ? 'bg-rose-500/20 text-rose-300 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg flex items-center transition-colors ${viewMode === 'table' ? 'bg-rose-500/20 text-rose-300 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All (${ports.length})` },
              { id: 'risky', label: `High Risk (${riskyCount})` },
              { id: 'web', label: `Web (${webCount})` },
              { id: 'infra', label: 'Infrastructure' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  filter === id
                    ? 'btn-cyber-primary text-white shadow-sm'
                    : 'bg-white/5 text-muted-foreground border-rose-500/15 hover:bg-white/10 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-rose-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search port or service..."
              className="w-full h-9 pl-9 pr-3 bg-white/5 border border-rose-500/20 focus:border-rose-500 rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors font-mono"
            />
          </div>
        </div>

        {/* Dynamic View: Grid or Table */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {filteredPorts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs font-mono text-muted-foreground border border-dashed border-rose-500/20 rounded-2xl">
                    No ports match active filter parameters.
                  </div>
                ) : (
                  filteredPorts.map((port, i) => {
                    const isRisky = HIGH_RISK_PORTS.includes(port.port);
                    return (
                      <div 
                        key={`${port.port}-${i}`}
                        className={`p-4 rounded-2xl border transition-all hover:-translate-y-1 flex flex-col items-center text-center gap-2 ${
                          isRisky ? 'bg-destructive/10 border-destructive/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-white/5 border-rose-500/20 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl ${isRisky ? 'bg-destructive/15 text-rose-400' : 'bg-purple-500/15 text-purple-300'}`}>
                          {isRisky ? <ShieldAlert className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                        </div>
                        <h4 className="font-mono text-xl font-black text-foreground">{port.port}</h4>
                        <div className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">{port.service || 'unknown'}</div>
                        <div className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isRisky ? 'bg-destructive/20 text-rose-300 border border-destructive/30' : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'}`}>
                          {isRisky ? 'High Risk' : 'Standard'}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto rounded-2xl border border-rose-500/20"
              >
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-rose-500/20">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-mono font-bold text-rose-300 text-[10px] uppercase tracking-wider">Port</th>
                      <th className="px-4 py-3 font-mono font-bold text-rose-300 text-[10px] uppercase tracking-wider">Service</th>
                      <th className="px-4 py-3 font-mono font-bold text-rose-300 text-[10px] uppercase tracking-wider">Risk Level</th>
                      <th className="px-4 py-3 font-mono font-bold text-rose-300 text-[10px] uppercase tracking-wider">State</th>
                      <th className="px-4 py-3 font-mono font-bold text-rose-300 text-[10px] uppercase tracking-wider">Banner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPorts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs font-mono text-muted-foreground">
                          No ports match active search query.
                        </td>
                      </tr>
                    ) : (
                      filteredPorts.map((port, i) => {
                        const isRisky = HIGH_RISK_PORTS.includes(port.port);
                        return (
                          <tr key={`${port.port}-${i}`} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3.5 font-mono font-black text-rose-400 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isRisky ? 'bg-rose-500 animate-pulse' : 'bg-purple-400'}`} />
                              {port.port}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-foreground">
                              {port.service || 'unknown'}
                            </td>
                            <td className="px-4 py-3.5">
                              {isRisky ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-destructive/15 text-rose-300 border border-destructive/30">
                                  <ShieldAlert className="h-3 w-3" /> High Risk
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  <ShieldCheck className="h-3 w-3" /> Standard
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border bg-purple-500/15 text-purple-300 border-purple-500/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                                {port.state || 'open'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground truncate max-w-[240px]" title={port.banner}>
                              {port.banner || '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}
