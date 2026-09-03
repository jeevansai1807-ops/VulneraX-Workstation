import React from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { countBySeverity } from '../utils/helpers';
import { Activity } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RiskChart({ vulnerabilities }) {
  const counts = countBySeverity(vulnerabilities);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (total === 0) return null;

  // Radar chart data using Cyber Fuchsia / Magenta / Violet theme
  const data = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
    datasets: [
      {
        label: 'Vulnerability Density',
        data: [counts.critical, counts.high, counts.medium, counts.low, counts.info],
        backgroundColor: 'rgba(244, 63, 94, 0.25)',
        borderColor: 'rgba(244, 63, 94, 1)',
        pointBackgroundColor: [
          '#f43f5e', // Critical (Fuchsia)
          '#fb923c', // High (Coral)
          '#d946ef', // Medium (Magenta)
          '#8b5cf6', // Low (Violet)
          '#a69fb8', // Info (Muted Purple)
        ],
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: 'rgba(244, 63, 94, 1)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(244, 63, 94, 0.2)'
        },
        grid: {
          color: 'rgba(139, 92, 246, 0.15)',
          circular: true,
        },
        pointLabels: {
          color: '#f43f5e',
          font: { family: 'JetBrains Mono, monospace', size: 10, weight: 'bold' }
        },
        ticks: {
          display: false,
          min: 0,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(18, 15, 36, 0.95)',
        titleColor: '#f43f5e',
        bodyColor: '#fcf6ff',
        borderColor: 'rgba(244, 63, 94, 0.4)',
        borderWidth: 1.5,
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        titleFont: { family: 'JetBrains Mono, monospace', weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono, monospace' },
      },
    },
  };

  return (
    <GlassCard className="flex flex-col h-full w-full p-6 justify-between min-h-[340px]">
      <SectionHeader 
        title="Vulnerability Spectrum" 
        subtitle="Radar threat analysis" 
        icon={Activity} 
        color="rose" 
      />

      <div className="relative w-full h-[240px] my-auto flex items-center justify-center overflow-hidden">
        <Radar data={data} options={options} />
      </div>
    </GlassCard>
  );
}
