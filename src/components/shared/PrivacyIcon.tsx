'use client';

export function PrivacyIcon({ privacy, size = 12 }: { privacy: string; size?: number }) {
  if (privacy === 'public') return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-label="public">
      <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="6" cy="6" r="1.6" fill="currentColor" />
    </svg>
  );
  if (privacy === 'shared') return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-label="shared">
      <circle cx="4.5" cy="6" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="6" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-label="private">
      <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.6 1.4" />
    </svg>
  );
}
