'use client';
import type { TimelineEvent } from '@/lib/types';

export function KindDot({ event, size = 10 }: { event: TimelineEvent; size?: number }) {
  const cls = event.kind === 'win' ? 'chip-win' : 'chip-loss';
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: 'var(--dotc)',
    display: 'inline-block',
    flex: 'none',
  };
  if (event.privacy === 'private') {
    style.background = 'var(--paper)';
    style.boxShadow = 'inset 0 0 0 1.4px var(--dotc)';
  } else if (event.privacy === 'shared') {
    style.background = 'linear-gradient(90deg, var(--dotc) 50%, var(--softc) 50%)';
  }
  return <span className={cls} style={style} />;
}
