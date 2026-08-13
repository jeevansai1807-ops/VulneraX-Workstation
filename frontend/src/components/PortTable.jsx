import React, { useState } from 'react';
import { Network, Wifi, ShieldAlert, ShieldCheck, Search, LayoutGrid, List } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';

const HIGH_RISK_PORTS = [21, 23, 445, 1433, 3306, 3389, 5432, 6379, 27017];

export default function PortTable({ ports = [] }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Filter ports based on category and search
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
      <GlassCard delay={0.2} className="relative overflow-hidden p-6 border border-border shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <SectionHeader
            title="Discovered Ports & Services"
            subtitle={`${ports.length} open ports detected on the target network`}
            icon={Network}
            color="cyan"
          />

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-foreground/5 rounded-lg p-1 border border-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md flex items-center transition-colors ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md flex items-center transition-colors ${viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  filter === id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-foreground/5 text-muted-foreground border-transparent hover:bg-foreground/10 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-52">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search port or service..."
              className="w-full h-8 pl-8 pr-3 bg-foreground/5 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
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
                  <div className="col-span-full py-12 text-center text-sm font-mono text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    No ports match your filters.
                  </div>
                ) : (
                  filteredPorts.map((port, i) => {
                    const isRisky = HIGH_RISK_PORTS.includes(port.port);
                    return (
                      <div 
                        key={`${port.port}-${i}`}
                        className={`p-4 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col items-center text-center gap-2 ${
                          isRisky ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40 hover:shadow-destructive/10' : 'bg-foreground/5 border-border hover:border-primary/40 hover:shadow-primary/10'
                        }`}
                      >
                        <div className={`p-3 rounded-full ${isRisky ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          {isRisky ? <ShieldAlert className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
                        </div>
                        <h4 className="font-mono text-xl font-bold text-foreground">{port.port}</h4>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{port.service || 'unknown'}</div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isRisky ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'}`}>
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
                className="overflow-x-auto rounded-xl border border-border"
              >
                <table className="w-full text-sm">
                  <thead className="bg-foreground/5 border-b border-border">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">Port</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">Service</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">Risk Level</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">State</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">Banner / Version</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPorts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm font-mono text-muted-foreground">
                          No ports match your filter or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredPorts.map((port, i) => {
                        const isRisky = HIGH_RISK_PORTS.includes(port.port);
                        return (
                          <tr key={`${port.port}-${i}`} className="hover:bg-foreground/5 transition-colors">
                            <td className="px-4 py-4 font-mono font-bold text-primary flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isRisky ? 'bg-destructive animate-pulse' : 'bg-emerald-500'}`} />
                              {port.port}
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-mono text-sm text-foreground flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-muted-foreground" />
                                {port.service || 'unknown'}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {isRisky ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-destructive/10 text-destructive border border-destructive/20">
                                  <ShieldAlert className="h-3.5 w-3.5" /> High Risk
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                                  <ShieldCheck className="h-3.5 w-3.5" /> Standard
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {port.state || 'open'}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-mono text-xs text-muted-foreground truncate max-w-[240px]" title={port.banner}>
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
