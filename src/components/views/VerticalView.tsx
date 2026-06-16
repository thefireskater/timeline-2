'use client';
import { useMemo } from 'react';
import type { TimelineEvent, Person } from '@/lib/types';
import { parseDate, fmtMonth, fmtDay } from '@/lib/dates';
import { Avatar, PrivacyIcon, ImagePlaceholder } from '@/components/shared';

function VCardBody({ ev, d, personById }: { ev: TimelineEvent; d: Date; personById: (id: string) => Person }) {
  return (
    <>
      <div className="top">
        <Avatar person={personById(ev.person)} size={18} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {personById(ev.person).name} &middot; {ev.kind}
        </span>
        <span style={{ flex: 1 }} />
        <PrivacyIcon privacy={ev.privacy} />
      </div>
      {(ev.imageUrl || ev.imageCaption) ? (
        <div style={{ margin: '10px -4px 4px' }}>
          <ImagePlaceholder event={ev} height="170px" radius={8} />
        </div>
      ) : null}
      <div className="ttl">{ev.title}</div>
      {ev.note ? <div className="note">{ev.note}</div> : null}
    </>
  );
}

export function VerticalView({ events, range, people, onOpenEvent }: {
  events: TimelineEvent[];
  range: { start: Date; end: Date };
  people: Person[];
  onOpenEvent: (e: TimelineEvent) => void;
}) {
  const personById = (id: string) => people.find(p => p.id === id) || people[0];

  const sorted = useMemo(() => [...events].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()), [events]);

  const byMonth = useMemo(() => {
    const m = new Map<string, { key: string; date: Date; events: TimelineEvent[] }>();
    for (const e of sorted) {
      const d = parseDate(e.date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!m.has(k)) m.set(k, { key: k, date: new Date(d.getFullYear(), d.getMonth(), 1), events: [] });
      m.get(k)!.events.push(e);
    }
    return Array.from(m.values());
  }, [sorted]);

  return (
    <div className="v-view">
      <style>{`
        .v-view{ position: relative; max-width: 980px; margin: 0 auto; padding: 10px 0 60px; }
        .v-axis{
          position: absolute; left: 50%; top: 0; bottom: 0;
          width: 1px; background: var(--rule); transform: translateX(-0.5px);
        }
        .v-month{ position: relative; padding: 22px 0 6px; }
        .v-month-hdr{ position: relative; display: grid; place-items: center; margin-bottom: 16px; }
        .v-month-hdr .pill{
          position: relative; z-index: 1; background: var(--paper);
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ink-2); padding: 6px 14px;
          border: 1px solid var(--rule); border-radius: 999px;
        }
        .v-row{
          display: grid; grid-template-columns: 1fr 80px 1fr;
          align-items: start; gap: 0; margin: 12px 0;
        }
        .v-card{
          background: var(--card); border: 1px solid var(--rule); border-radius: 12px;
          padding: 14px 16px 14px; cursor: pointer;
          transition: transform 160ms, border-color 160ms, box-shadow 160ms; position: relative;
        }
        .v-card:hover{
          border-color: var(--ink); box-shadow: 0 10px 30px rgba(20,15,8,0.06); transform: translateY(-1px);
        }
        .v-card .top{ display: flex; align-items: center; gap: 8px; color: var(--muted); }
        .v-card .ttl{
          font-family: var(--font-serif); font-size: 21px; line-height: 1.15;
          letter-spacing: -0.005em; margin: 4px 0 6px; color: var(--ink);
        }
        .v-card .note{ font-size: 13px; line-height: 1.55; color: var(--ink-2); text-wrap: pretty; }
        .v-card.left  { margin-right: 14px;  border-left: 3px solid var(--dotc); }
        .v-card.right { margin-left: 14px;   border-right: 3px solid var(--dotc); }
        .v-axis-marker{ display: grid; place-items: center; position: relative; overflow: visible; min-height: 54px; }
        .v-axis-marker .day{
          position: absolute; top: 14px; z-index: 2; background: var(--paper);
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em;
          color: var(--muted); padding: 2px 4px; white-space: nowrap;
        }
        .v-axis-marker .dot{
          position: absolute; top: 30px; width: 16px; height: 16px;
          border-radius: 50%; background: var(--dotc); box-shadow: 0 0 0 4px var(--paper);
        }
        .v-axis-marker .dot.private{
          background: var(--paper); box-shadow: 0 0 0 4px var(--paper), inset 0 0 0 2px var(--dotc);
        }
        .v-axis-marker .dot.shared{
          background: linear-gradient(135deg, var(--dotc) 50%, var(--softc) 50%);
        }
      `}</style>

      <div className="v-axis" />

      {byMonth.map(group => (
        <div className="v-month" key={group.key}>
          <div className="v-month-hdr">
            <span className="pill">
              {group.date.toLocaleString('en-US', { month: 'long' })} {group.date.getFullYear()}
            </span>
          </div>

          {group.events.map((ev, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const d = parseDate(ev.date);
            const cls = ev.kind === 'win' ? 'chip-win' : 'chip-loss';
            return (
              <div key={ev.id} className="v-row">
                {side === 'left' ? (
                  <div className={"v-card left " + cls} onClick={() => onOpenEvent(ev)}>
                    <VCardBody ev={ev} d={d} personById={personById} />
                  </div>
                ) : <div />}

                <div className={"v-axis-marker " + cls}>
                  <div className="day">{fmtMonth(d).toUpperCase()} {fmtDay(d)}</div>
                  <div className={"dot " + (ev.privacy === 'private' ? 'private' : ev.privacy === 'shared' ? 'shared' : '')} />
                </div>

                {side === 'right' ? (
                  <div className={"v-card right " + cls} onClick={() => onOpenEvent(ev)}>
                    <VCardBody ev={ev} d={d} personById={personById} />
                  </div>
                ) : <div />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
