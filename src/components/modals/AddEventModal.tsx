'use client';
import { useState, useRef } from 'react';
import type { Person, TimelineEvent } from '@/lib/types';
import { isoDate, TODAY } from '@/lib/dates';
import { PrivacyIcon } from '@/components/shared';
import { ModalShell } from './ModalShell';

export function AddEventModal({ people, onClose, onSave }: {
  people: Person[];
  onClose: () => void;
  onSave: (ev: Omit<TimelineEvent, 'id'>) => void;
}) {
  const [kind, setKind] = useState<'win' | 'loss'>('win');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => isoDate(TODAY));
  const [person, setPerson] = useState('you');
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'shared'>('public');
  const [sharedWith, setSharedWith] = useState<Record<string, boolean>>({ angie: true });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSave = title.trim().length > 0 && date.length === 10;

  const save = () => {
    if (!canSave) return;
    onSave({
      date, person, kind, privacy, title: title.trim(), note: note.trim(),
      imageUrl: imageUrl,
      imageCaption: imageCaption || null,
      sharedWith: privacy === 'shared' ? Object.keys(sharedWith).filter(k => sharedWith[k]) : [],
    });
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        if (!imageCaption) setImageCaption(file.name.replace(/\.[^.]+$/, ''));
      }
    } catch {
      // upload failed silently
    } finally {
      setUploading(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="modal-body">
        <div className="small-caps" style={{ marginBottom: 6 }}>New entry</div>
        <h2>What just happened?</h2>
        <p className="lead">A win, a loss, or somewhere between &mdash; keep it short, then a line about why.</p>

        <div className="field">
          <label>Kind</label>
          <div className="kind-pick" style={{ alignSelf: 'flex-start' }}>
            <button className={kind === 'win' ? 'is-active' : ''} onClick={() => setKind('win')}>
              <span className="swatch" style={{ '--swatch': 'var(--win)' } as React.CSSProperties} /> Win
            </button>
            <button className={kind === 'loss' ? 'is-active' : ''} onClick={() => setKind('loss')}>
              <span className="swatch" style={{ '--swatch': 'var(--loss)' } as React.CSSProperties} /> Loss
            </button>
          </div>
        </div>

        <div className="field">
          <label>Headline</label>
          <input
            type="text"
            placeholder={kind === 'win' ? 'e.g. Hit 100 sign-ups for the course' : 'e.g. Lost the Northstar account'}
            value={title}
            autoFocus
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label>One line of context (optional)</label>
          <textarea
            rows={2}
            placeholder={kind === 'win' ? 'What made it happen?' : 'What\u2019s the lesson?'}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Whose</label>
            <div className="person-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
              {people.map(p => (
                <button
                  key={p.id}
                  className={"person-tile " + (person === p.id ? 'is-active' : '')}
                  style={{ '--tint': p.tint } as React.CSSProperties}
                  onClick={() => setPerson(p.id)}
                >
                  <span className="av">{p.short}</span>
                  <span className="name">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field">
          <label>Image (optional)</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <button className="pill" onClick={() => fileRef.current?.click()} style={{ alignSelf: 'flex-start' }}>
            {uploading ? 'Uploading...' : imageUrl ? 'Change image' : 'Upload image'}
          </button>
          {imageUrl && (
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="Image caption"
                value={imageCaption}
                onChange={e => setImageCaption(e.target.value)}
                style={{ borderBottom: '1px solid var(--rule)', background: 'transparent', padding: '6px 0', width: '100%', outline: 'none' }}
              />
            </div>
          )}
        </div>

        <div className="field">
          <label>Privacy</label>
          <div className="priv-pick" style={{ alignSelf: 'flex-start' }}>
            <button className={privacy === 'public' ? 'is-active' : ''} onClick={() => setPrivacy('public')}>
              <PrivacyIcon privacy="public" /> Public
            </button>
            <button className={privacy === 'shared' ? 'is-active' : ''} onClick={() => setPrivacy('shared')}>
              <PrivacyIcon privacy="shared" /> Shared
            </button>
            <button className={privacy === 'private' ? 'is-active' : ''} onClick={() => setPrivacy('private')}>
              <PrivacyIcon privacy="private" /> Private
            </button>
          </div>
          {privacy === 'shared' ? (
            <div style={{ marginTop: 10 }}>
              <div className="small-caps" style={{ marginBottom: 6 }}>Visible to</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {people.filter(p => p.id !== person).map(p => {
                  const on = !!sharedWith[p.id];
                  return (
                    <button key={p.id}
                      className={"person-chip " + (on ? '' : 'is-off')}
                      style={{ '--tint': p.tint } as React.CSSProperties}
                      onClick={() => setSharedWith(s => ({ ...s, [p.id]: !on }))}
                    >
                      <span className="av">{p.short}</span> {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {privacy === 'private' ? (
            <div style={{ marginTop: 8, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: 13 }}>
              Only you. Won&rsquo;t appear in shared views or summaries.
            </div>
          ) : null}
          {privacy === 'public' ? (
            <div style={{ marginTop: 8, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: 13 }}>
              Anyone you&rsquo;ve added to your circle will see this.
            </div>
          ) : null}
        </div>
      </div>

      <div className="modal-foot">
        <span className="small-caps">Esc to cancel</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pill" onClick={onClose}>Cancel</button>
          <button className="pill primary" onClick={save} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
            Add to timeline
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
