import React from 'react';
import { Lock, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';

export default function SSLPanel({ ssl }) {
  if (!ssl || (!ssl.tls_version && !ssl.days_remaining && (!ssl.issues || ssl.issues.length === 0))) {
    return (
      <GlassCard className="p-6">
        <SectionHeader title="SSL / TLS Cryptographic Armor" icon={Lock} color="rose" />
        <div className="mt-4 p-4 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <span className="font-bold text-sm text-foreground block">Unencrypted Data Pipeline</span>
              <span className="text-xs text-muted-foreground font-mono">HTTP (Plaintext data transmission susceptible to sniffing)</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-destructive/20 text-rose-300 border border-destructive/40 uppercase">
            Unprotected
          </span>
        </div>
      </GlassCard>
    );
  }

  const isEncrypted = Boolean(ssl.tls_version || ssl.days_remaining > 0 || (ssl.issues && ssl.issues.length === 0));
  const hasIssues = Boolean(ssl.issues && ssl.issues.length > 0) || Boolean(ssl.weak_cipher);
  const isProtected = isEncrypted && !hasIssues && (ssl.days_remaining > 0 || ssl.days_remaining === undefined || ssl.days_remaining === null);

  return (
    <GlassCard className="p-6">
      <SectionHeader title="SSL / TLS Cryptographic Armor" icon={Lock} color="rose" />

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Encryption Status Tile */}
        <div className="p-4 rounded-2xl bg-white/5 border border-rose-500/20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {isEncrypted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300/80 block">
                Transport Layer Security
              </span>
              <span className="text-sm font-bold text-foreground block">
                {isEncrypted ? 'Encrypted (HTTPS)' : 'Unencrypted (HTTP)'}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
            isEncrypted ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-destructive/15 text-rose-300 border-destructive/30'
          }`}>
            {ssl.tls_version || (isEncrypted ? 'TLS 1.3' : 'HTTP')}
          </span>
        </div>

        {/* Protection Status Tile */}
        <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {isProtected ? (
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300/80 block">
                Armor Integrity
              </span>
              <span className="text-sm font-bold text-foreground block">
                {isProtected ? 'Optimal Protection' : hasIssues ? 'Security Warning' : 'At Risk'}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
            isProtected ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}>
            {isProtected ? 'Protected' : 'Warning'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
