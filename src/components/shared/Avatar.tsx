'use client';
import type { Person } from '@/lib/types';

export function Avatar({ person, size = 22, ring = false }: { person: Person; size?: number; ring?: boolean }) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.max(8, size * 0.38),
    background: person.tint,
    display: 'inline-grid',
    placeItems: 'center',
    borderRadius: '50%',
    color: '#f7f3e8',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.02em',
    lineHeight: 1,
    flex: 'none',
    ...(ring ? { boxShadow: '0 0 0 2px var(--paper)' } : {}),
  };
  return <span style={style}>{person.short}</span>;
}
