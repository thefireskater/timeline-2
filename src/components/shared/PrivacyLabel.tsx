'use client';
import { PrivacyIcon } from './PrivacyIcon';

export function PrivacyLabel({ privacy }: { privacy: string }) {
  const txt = privacy === 'public' ? 'Public'
            : privacy === 'shared' ? 'Shared'
            : 'Private';
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>
      <PrivacyIcon privacy={privacy} /> {txt}
    </span>
  );
}
