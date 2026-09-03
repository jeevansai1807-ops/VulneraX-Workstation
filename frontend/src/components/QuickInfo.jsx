import { Globe, Server, MapPin, Network, Shield, Cpu } from 'lucide-react';
import { riskScoreColor } from '../utils/helpers';

export default function QuickInfo({ scanResult, status: propStatus }) {
  if (!scanResult) return null;

  const { dns, fingerprint, ports, risk_score, status: resultStatus } = scanResult;
  const currentStatus = propStatus || resultStatus;
  const isRunning = currentStatus === 'running' || currentStatus === 'pending';
  const scoreInfo = riskScoreColor(risk_score?.overall ?? 0, currentStatus);

  const cards = [
    {
      icon: Globe,
      label: 'IP Address',
      value: dns?.ip_address || (isRunning ? 'Resolving...' : '—'),
      color: 'text-rose-400',
      bg: 'bg-rose-500/15 border-rose-500/30',
    },
    {
      icon: MapPin,
      label: 'Country / Region',
      value: dns?.country || (isRunning ? 'Checking...' : '—'),
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/15 border-fuchsia-500/30',
    },
    {
      icon: Server,
      label: 'Server Engine',
      value: fingerprint?.server || (isRunning ? 'Fingerprinting...' : '—'),
      color: 'text-purple-400',
      bg: 'bg-purple-500/15 border-purple-500/30',
    },
    {
      icon: Cpu,
      label: 'Tech Stack',
      value: fingerprint?.technologies?.length
        ? fingerprint.technologies.slice(0, 3).join(', ')
        : (isRunning ? 'Analyzing...' : '—'),
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/15 border-indigo-500/30',
    },
    {
      icon: Network,
      label: 'Open Ports',
      value: isRunning && (!ports || ports.length === 0) ? 'Scanning...' : (ports?.length?.toString() || '0'),
      color: 'text-orange-400',
      bg: 'bg-orange-500/15 border-orange-500/30',
    },
    {
      icon: Shield,
      label: 'Risk Posture',
      value: isRunning ? 'Scanning...' : currentStatus === 'aborted' ? 'Aborted' : currentStatus === 'error' ? 'N/A' : `${risk_score?.overall ?? 0}/100`,
      color: '',
      bg: 'bg-rose-500/15 border-rose-500/30',
      customColor: scoreInfo.color,
      sublabel: scoreInfo.label,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card p-5 flex flex-col items-center text-center gap-2.5 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(244,63,94,0.18)] transition-all duration-300"
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${card.bg}`}>
            <card.icon
              className="h-5 w-5"
              style={card.customColor ? { color: card.customColor } : undefined}
              {...(!card.customColor ? { className: `h-5 w-5 ${card.color}` } : {})}
            />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              {card.label}
            </p>
            <p
              className="text-xs font-black text-foreground truncate max-w-[130px]"
              title={card.value}
              style={card.customColor ? { color: card.customColor } : undefined}
            >
              {card.value}
            </p>
            {card.sublabel && (
              <p className="text-[9px] font-mono font-bold mt-0.5" style={{ color: card.customColor }}>
                {card.sublabel}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
