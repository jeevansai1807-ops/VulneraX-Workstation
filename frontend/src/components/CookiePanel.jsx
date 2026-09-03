import React from 'react';
import { Cookie, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';

export default function CookiePanel({ cookies = [] }) {
  if (!cookies || cookies.length === 0) {
    return (
      <GlassCard className="p-6">
        <SectionHeader title="Session & Auth Cookies" icon={Cookie} color="purple" />
        <p className="text-xs font-mono text-muted-foreground mt-4">No cookies detected on target domain.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <SectionHeader 
        title="Session & Auth Cookies" 
        subtitle={`${cookies.length} cookie${cookies.length !== 1 ? 's' : ''} inspected`}
        icon={Cookie} 
        color="purple" 
      />

      <div className="space-y-3 mt-5">
        {cookies.map((cookie, i) => (
          <div key={`${cookie.name}-${i}`} className="rounded-2xl bg-white/5 border border-purple-500/20 p-4 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-rose-300">{cookie.name}</span>
              {cookie.issues?.length > 0 && (
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  {cookie.issues.length} issue{cookie.issues.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: 'HttpOnly', value: cookie.http_only },
                { label: 'Secure', value: cookie.secure },
                { label: 'SameSite', value: !!cookie.same_site, detail: cookie.same_site },
              ].map((flag) => (
                <span
                  key={flag.label}
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    flag.value
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {flag.value ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {flag.label}
                  {flag.detail && `: ${flag.detail}`}
                </span>
              ))}
            </div>

            {/* Issues */}
            {cookie.issues?.length > 0 && (
              <div className="mt-2 space-y-1">
                {cookie.issues.map((issue, j) => (
                  <p key={j} className="text-xs font-mono text-amber-300/90 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    {issue}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
