import React, { useEffect, useRef } from 'react';
import { riskScoreColor } from '../utils/helpers';
import { Gauge } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';

export default function RiskGauge({ score, status }) {
  const canvasRef = useRef(null);
  const animatedScore = useRef(0);
  const animFrameRef = useRef(null);

  const isRunning = status === 'running' || status === 'pending';
  const info = riskScoreColor(score ?? 0, status);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = (size * 0.65) * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.65}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size * 0.55;
    const radius = size * 0.4;
    const lineWidth = 12;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;

    const targetScore = status === 'aborted' ? 0 : isRunning ? 50 : (score ?? 0);

    function draw(currentScore) {
      ctx.clearRect(0, 0, size, size);

      // Background Arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Score Gradient Arc: Coral -> Magenta -> Purple -> Emerald
      const scoreAngle = startAngle + (currentScore / 100) * Math.PI;
      const gradient = ctx.createLinearGradient(0, cy, size, cy);
      gradient.addColorStop(0, '#f43f5e'); // Critical - Fuchsia
      gradient.addColorStop(0.3, '#fb923c'); // High - Coral
      gradient.addColorStop(0.6, '#d946ef'); // Medium - Magenta
      gradient.addColorStop(0.85, '#8b5cf6'); // Good - Purple
      gradient.addColorStop(1, '#34d399'); // Excellent - Emerald

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreAngle);
      ctx.strokeStyle = status === 'aborted' ? '#f43f5e' : isRunning ? '#fb923c' : gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Neon Outer Glow effect
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreAngle);
      ctx.strokeStyle = (info.color || '#f43f5e') + '30';
      ctx.lineWidth = lineWidth + 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Score Value text
      ctx.fillStyle = info.color || '#f43f5e';
      if (status === 'aborted') {
        ctx.font = 'bold 18px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ABORTED', cx, cy - 8);
      } else if (isRunning) {
        ctx.font = 'bold 15px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCANNING...', cx, cy - 8);
      } else {
        ctx.font = '900 36px Outfit, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(currentScore), cx, cy - 8);
      }

      // Label below score
      ctx.fillStyle = '#a69fb8';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText('RISK SCORE', cx, cy + 16);
    }

    const duration = 1200;
    const startTime = performance.now();
    const startVal = animatedScore.current;

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetScore - startVal) * eased;

      animatedScore.current = current;
      draw(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [score, status, isRunning, info.color]);

  return (
    <GlassCard className="flex flex-col h-full w-full p-6 justify-between min-h-[340px]">
      <div className="self-start w-full">
        <SectionHeader 
          title="Risk Score" 
          subtitle={info.label} 
          icon={Gauge} 
          color="rose" 
        />
      </div>
      <div className="relative w-full my-auto flex items-center justify-center py-2">
        <canvas ref={canvasRef} />
      </div>
    </GlassCard>
  );
}
