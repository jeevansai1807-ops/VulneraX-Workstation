import React from 'react';

export default function Logo({ size = 'md' }) {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size] || 'w-10 h-10';

  const iconSizes = {
    sm: '18',
    md: '24',
    lg: '32',
    xl: '48'
  }[size] || '24';

  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/20 shrink-0 ${dimensions}`}>
      <svg 
        width={iconSizes} 
        height={iconSizes} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M2 12L12 2L22 12L12 22L2 12Z" />
        <path d="M12 2V22" opacity="0.5" />
        <path d="M2 12H22" opacity="0.5" />
      </svg>
    </div>
  );
}
