'use client';

export function PhotoHint({ size = 11, color = 'var(--muted)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-label="photo" style={{flex:'none', color}}>
      <rect x="1.25" y="2.5" width="9.5" height="7.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="0.9"/>
      <circle cx="4" cy="5.4" r="0.8" fill="currentColor"/>
      <path d="M2 9 L5 6.5 L7 8 L10 5.5 L10.75 5.5 L10.75 10 L1.25 10 Z" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}
