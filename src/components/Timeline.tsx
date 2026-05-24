'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Person, TimelineEvent } from '@/lib/types';
import { getRange, fmtFullShort, TODAY } from '@/lib/dates';
import { filterEvents } from '@/lib/filters';
import { HorizontalView } from './views/HorizontalView';
import { VerticalView } from './views/VerticalView';
import { GridView } from './views/GridView';
import { AddEventModal } from './modals/AddEventModal';
import { EventDetailModal } from './modals/EventDetailModal';
import { createEvent, updateEvent, deleteEvent } from '@/app/actions';

export function Timeline({ people, initialEvents }: {
  people: Person[];
  initialEvents: TimelineEvent[];
}) {
  const [view, setView] = useState<'horizontal' | 'vertical' | 'grid'>('horizontal');
  const [rangeKey, setRangeKey] = useState('year');
  const [showPrivate, setShowPrivate] = useState(true);
  const [peopleSel, setPeopleSel] = useState(() => people.map(p => p.id));
  const [events, setEvents] = useState(() => initialEvents);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const range = useMemo(() => getRange(rangeKey, TODAY), [rangeKey]);
  const visiblePeople = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const p of people) m[p.id] = peopleSel.includes(p.id);
    return m;
  }, [peopleSel, people]);

  const filtered = useMemo(
    () => filterEvents(events, range, visiblePeople, showPrivate),
    [events, range, visiblePeople, showPrivate]
  );

  const wins = filtered.filter(e => e.kind === 'win').length;
  const losses = filtered.filter(e => e.kind === 'loss').length;

  const togglePerson = (pid: string) => {
    setPeopleSel(sel => sel.includes(pid) ? sel.filter(id => id !== pid) : [...sel, pid]);
  };

  const onSaveNew = useCallback(async (newEv: Omit<TimelineEvent, 'id'>) => {
    const tempId = 'temp-' + Date.now();
    const optimistic = { ...newEv, id: tempId } as TimelineEvent;
    setEvents(es => [...es, optimistic]);
    const realId = await createEvent({
      date: newEv.date,
      person: newEv.person,
      kind: newEv.kind,
      privacy: newEv.privacy,
      title: newEv.title,
      note: newEv.note,
      imageUrl: newEv.imageUrl,
      imageCaption: newEv.imageCaption,
      sharedWith: newEv.sharedWith,
    });
    setEvents(es => es.map(e => e.id === tempId ? { ...e, id: realId } : e));
  }, []);

  const onUpdate = useCallback(async (next: TimelineEvent) => {
    setEvents(es => es.map(e => e.id === next.id ? next : e));
    await updateEvent({ id: next.id, privacy: next.privacy, sharedWith: next.sharedWith });
  }, []);

  const onDelete = useCallback(async (ev: TimelineEvent) => {
    setEvents(es => es.filter(e => e.id !== ev.id));
    await deleteEvent(ev.id);
  }, []);

  const openEvent = events.find(e => e.id === openId) || null;

  const rangeLabel = useMemo(() => {
    if (rangeKey === 'all') return 'the full record';
    const a = fmtFullShort(range.start);
    const b = fmtFullShort(range.end);
    return `${a} \u2192 ${b}`;
  }, [rangeKey, range]);

  // Keyboard shortcut: N to add
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) {
        setAdding(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="dot" /> Timeline
          <span className="meta">v1 &middot; personal record</span>
        </div>

        <div className="view-switch" role="tablist">
          {([
            ['horizontal', 'Axis'],
            ['vertical', 'Journal'],
            ['grid', 'Year-in-pixels'],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              className={view === k ? 'is-active' : ''}
              onClick={() => setView(k)}
            >{label}</button>
          ))}
        </div>

        <div className="top-actions">
          <span className="pill" style={{ cursor: 'default' }} title={`${filtered.length} entries match your filters`}>
            <span style={{ width: 7, height: 7, borderRadius: 50, background: 'var(--ink)', display: 'inline-block' }} />
            {filtered.length} <span style={{ color: 'var(--muted)' }}>shown</span>
          </span>
          <button className="pill primary" onClick={() => setAdding(true)}>
            + Add event <span className="k" style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}>N</span>
          </button>
        </div>
      </div>

      <div className="stage">
        <div className="range-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="label">Range</span>
            <div className="seg">
              {['month', 'quarter', 'year', 'all'].map(k => (
                <button key={k}
                  className={rangeKey === k ? 'is-active' : ''}
                  onClick={() => setRangeKey(k)}
                >{k === 'all' ? 'All' : k[0].toUpperCase() + k.slice(1)}</button>
              ))}
            </div>
          </div>

          <div className="people-strip" style={{ flex: 1 }}>
            <span className="label" style={{ marginRight: 4 }}>Showing</span>
            {people.map(p => {
              const on = visiblePeople[p.id];
              return (
                <button key={p.id}
                  className={"person-chip " + (on ? '' : 'is-off')}
                  style={{ '--tint': p.tint } as React.CSSProperties}
                  onClick={() => togglePerson(p.id)}
                  title={on ? `Hide ${p.name}` : `Show ${p.name}`}
                >
                  <span className="av">{p.short}</span> {p.name}
                </button>
              );
            })}
          </div>

          <div className="scrim">
            {rangeLabel}
            <span className="count">
              <span style={{ color: 'var(--win-ink)' }}>{wins} wins</span>
              <span style={{ color: 'var(--muted-2)', margin: '0 8px' }}>&middot;</span>
              <span style={{ color: 'var(--loss-ink)' }}>{losses} losses</span>
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div className="small-caps" style={{ marginBottom: 8 }}>Nothing here yet</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.005em' }}>
              No events in this window.
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', marginTop: 8 }}>
              Widen the range, show more people, or add the next thing that happens.
            </div>
            <button className="pill primary" style={{ marginTop: 18 }} onClick={() => setAdding(true)}>
              + Add the first one
            </button>
          </div>
        ) : view === 'horizontal' ? (
          <HorizontalView events={filtered} range={range} people={people} onOpenEvent={(e) => setOpenId(e.id)} />
        ) : view === 'vertical' ? (
          <VerticalView events={filtered} range={range} people={people} onOpenEvent={(e) => setOpenId(e.id)} />
        ) : (
          <GridView events={filtered} range={range} people={people} onOpenEvent={(e) => setOpenId(e.id)} />
        )}
      </div>

      {adding ? (
        <AddEventModal people={people} onClose={() => setAdding(false)} onSave={onSaveNew} />
      ) : null}
      {openEvent ? (
        <EventDetailModal
          event={openEvent}
          people={people}
          onClose={() => setOpenId(null)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  );
}
