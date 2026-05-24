'use client';
import { useState } from 'react';
import type { TimelineEvent, Person } from '@/lib/types';
import { parseDate, fmtFull } from '@/lib/dates';
import { Avatar, PrivacyIcon, PrivacyLabel, ImagePlaceholder } from '@/components/shared';
import { ModalShell } from './ModalShell';

export function EventDetailModal({ event, people, onClose, onUpdate, onDelete }: {
  event: TimelineEvent;
  people: Person[];
  onClose: () => void;
  onUpdate: (ev: TimelineEvent) => void;
  onDelete: (ev: TimelineEvent) => void;
}) {
  const ev = event;
  const d = parseDate(ev.date);
  const cls = ev.kind === 'win' ? 'chip-win' : 'chip-loss';
  const [privacy, setPrivacy] = useState(ev.privacy);
  const [sharedWith, setSharedWith] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    (ev.sharedWith || []).forEach(id => { o[id] = true; });
    return o;
  });

  const personById = (id: string) => people.find(p => p.id === id) || people[0];

  const commitPrivacy = (next: 'public' | 'private' | 'shared') => {
    setPrivacy(next);
    onUpdate({ ...ev, privacy: next });
  };
  const toggleShared = (pid: string) => {
    const nextOn = !sharedWith[pid];
    const nextMap = { ...sharedWith, [pid]: nextOn };
    setSharedWith(nextMap);
    onUpdate({ ...ev, privacy: 'shared', sharedWith: Object.keys(nextMap).filter(k => nextMap[k]) });
  };

  return (
    <ModalShell onClose={onClose} width={580}>
      <div className={cls} style={{ padding: '22px 28px 8px', borderBottom: '1px solid var(--rule)', background: 'linear-gradient(180deg,var(--softc),transparent 70%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--dotc)', display: 'inline-block' }} />
          <span className="small-caps" style={{ color: 'var(--inkc)' }}>{ev.kind}</span>
          <span style={{ flex: 1 }} />
          <PrivacyLabel privacy={privacy} />
        </div>
        <h2 style={{ marginTop: 4 }}>{ev.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 18 }}>
          <Avatar person={personById(ev.person)} size={22} />
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{personById(ev.person).name}</span>
          <span style={{ color: 'var(--muted)' }}>&middot;</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-2)' }}>
            {fmtFull(d).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="modal-body">
        {(ev.imageUrl || ev.imageCaption) ? (
          <div style={{ margin: '-4px 0 16px' }}>
            <ImagePlaceholder event={ev} height="240px" radius={12} />
          </div>
        ) : null}
        {ev.note ? (
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--ink)', margin: '4px 0 8px', textWrap: 'pretty' }}>
            {ev.note}
          </p>
        ) : (
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: 15 }}>
            No note yet &mdash; add a line about what made this matter.
          </p>
        )}

        <div className="hr" style={{ margin: '18px 0 16px' }} />

        <div className="small-caps" style={{ marginBottom: 10 }}>Privacy</div>
        <div className="priv-pick">
          <button className={privacy === 'public' ? 'is-active' : ''} onClick={() => commitPrivacy('public')}>
            <PrivacyIcon privacy="public" /> Public
          </button>
          <button className={privacy === 'shared' ? 'is-active' : ''} onClick={() => commitPrivacy('shared')}>
            <PrivacyIcon privacy="shared" /> Shared
          </button>
          <button className={privacy === 'private' ? 'is-active' : ''} onClick={() => commitPrivacy('private')}>
            <PrivacyIcon privacy="private" /> Private
          </button>
        </div>

        {privacy === 'shared' ? (
          <div style={{ marginTop: 14 }}>
            <div className="small-caps" style={{ marginBottom: 8 }}>Visible to</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {people.filter(p => p.id !== ev.person).map(p => {
                const on = !!sharedWith[p.id];
                return (
                  <button key={p.id}
                    className={"person-chip " + (on ? '' : 'is-off')}
                    style={{ '--tint': p.tint } as React.CSSProperties}
                    onClick={() => toggleShared(p.id)}
                  >
                    <span className="av">{p.short}</span> {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {privacy === 'private' ? (
          <div style={{ marginTop: 10, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: 13.5 }}>
            Only you. Tucked away in your private archive.
          </div>
        ) : null}
        {privacy === 'public' ? (
          <div style={{ marginTop: 10, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: 13.5 }}>
            Anyone in your circle can see this.
          </div>
        ) : null}
      </div>

      <div className="modal-foot">
        <button className="pill" onClick={() => { onDelete(ev); onClose(); }} style={{ color: 'var(--loss-ink)', borderColor: 'transparent' }}>Delete</button>
        <button className="pill primary" onClick={onClose}>Done</button>
      </div>
    </ModalShell>
  );
}
