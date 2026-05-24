'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { TimelineEvent, Person } from '@/lib/types';
import { parseDate, fmtMonth, fmtFull, daysBetween, TODAY } from '@/lib/dates';
import { clusterEvents } from '@/lib/filters';
import { Avatar, KindDot, PhotoHint, PrivacyIcon } from '@/components/shared';

function ClusterLabel({ cluster, side }: { cluster: { date: Date; events: TimelineEvent[] }; side: 'above' | 'below' }) {
  const top = cluster.events[0];
  const extra = cluster.events.length - 1;
  const max = 24;
  const text = top.title.length > max ? top.title.slice(0, max - 1).trim() + '\u2026' : top.title;
  const style: React.CSSProperties = side === 'above'
    ? { bottom: 6 + cluster.events.length * 18 + 14, left: '50%', transform: 'translateX(-2px) rotate(-42deg)' }
    : { top: 6 + cluster.events.length * 18 + 14, left: '50%', transform: 'translateX(-2px) rotate(42deg)' };
  return (
    <div className={"h-label " + (side === 'below' ? 'below' : '')} style={style}>
      <span className="ttl">{text}</span>
      {extra > 0 ? <span className="more">+{extra}</span> : null}
    </div>
  );
}

export function HorizontalView({ events, range, people, onOpenEvent }: {
  events: TimelineEvent[];
  range: { start: Date; end: Date };
  people: Person[];
  onOpenEvent: (e: TimelineEvent) => void;
}) {
  const { start, end } = range;
  const hostRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1280);
  const [hover, setHover] = useState<{ id: string; side: 'above' | 'below' } | null>(null);

  const personById = (id: string) => people.find(p => p.id === id) || people[0];

  useEffect(() => {
    if (!hostRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

  const totalDays = Math.max(1, daysBetween(start, end));

  const months = useMemo(() => {
    const out: Date[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      out.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  }, [start.getTime(), end.getTime()]);

  const padX = 60;
  const padRight = 130;
  const xFor = (d: Date) => {
    const t = (d.getTime() - start.getTime()) / (end.getTime() - start.getTime());
    return Math.max(0, Math.min(1, t)) * (w - padX - padRight) + padX;
  };

  const sorted = useMemo(() => [...events].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()), [events]);
  const wins = sorted.filter(e => e.kind === 'win');
  const losses = sorted.filter(e => e.kind === 'loss');

  const tolDays = Math.max(2, Math.round(totalDays * 28 / Math.max(600, w)));
  const winClusters = clusterEvents(wins, tolDays);
  const lossClusters = clusterEvents(losses, tolDays);

  const axisY = 240;
  const totalH = 480;

  return (
    <div className="h-view" ref={hostRef}>
      <style>{`
        .h-view{ position:relative; height:${totalH}px; user-select:none; }
        .h-axis{ position:absolute; left:${padX}px; right:${padX}px; top:${axisY}px; height:1px; background:var(--ink); opacity:0.85; }
        .h-tick{ position:absolute; top:${axisY - 5}px; width:1px; height:10px; background:var(--ink); opacity:0.35; }
        .h-tick.major{ height:18px; top:${axisY - 9}px; opacity:0.7; }
        .h-month-lbl{
          position:absolute; top:${axisY + 14}px; transform:translateX(-50%);
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted); white-space: nowrap;
        }
        .h-year-lbl{
          position:absolute; top:${axisY + 34}px; transform:translateX(-50%);
          font-family: var(--font-serif); font-style: italic; font-size: 15px; color: var(--ink-2);
        }
        .h-zone-lbl{
          position: absolute; left: 0;
          font-family: var(--font-serif); font-style: italic; color: var(--ink-2); font-size: 15px;
        }
        .h-cluster{
          position:absolute; transform: translateX(-50%);
          display: flex; align-items: center; flex-direction: column; width: 22px;
        }
        .h-cluster.above{ bottom: ${totalH - axisY}px; justify-content: flex-end; flex-direction: column-reverse; }
        .h-cluster.below{ top: ${axisY + 1}px; }
        .h-stem{ width:1px; flex: none; background: var(--rule); }
        .h-stack{ display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .h-cluster.above .h-stack{ flex-direction: column-reverse; }
        .h-dot{
          width: 14px; height: 14px; border-radius: 50%; background: var(--dotc);
          border: 1.5px solid var(--paper); cursor: pointer; transition: transform 140ms;
        }
        .h-dot:hover{ transform: scale(1.3); }
        .h-dot.private{ background: var(--paper); box-shadow: inset 0 0 0 2px var(--dotc); }
        .h-dot.shared{ background: linear-gradient(135deg, var(--dotc) 50%, var(--softc) 50%); }
        .h-label{
          position: absolute; font-family: var(--font-serif); font-size: 14.5px;
          line-height: 1.2; color: var(--ink-2); white-space: nowrap;
          transform-origin: left bottom; transform: rotate(-42deg);
          padding-left: 2px; letter-spacing: -0.005em;
        }
        .h-label.below{ transform-origin: left top; transform: rotate(42deg); }
        .h-label .ttl{ color: var(--ink); }
        .h-label .more{
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
          color: var(--muted); text-transform: uppercase; margin-left: 6px;
        }
        .h-popover{
          position:absolute; transform: translateX(-50%); width: 260px;
          padding: 14px 14px 12px; background: var(--card); border: 1px solid var(--ink);
          border-radius: 12px; box-shadow: 0 20px 50px rgba(20,15,8,0.18); z-index: 20;
        }
        .h-popover .row{
          display: flex; gap: 10px; padding: 8px 0; align-items: flex-start;
          cursor: pointer; border-top: 1px dashed var(--rule);
        }
        .h-popover .row:first-of-type{ border-top: 0; padding-top: 4px; }
        .h-popover .row:hover .ttl{ text-decoration: underline; text-underline-offset: 3px; }
        .h-popover .row .ttl{
          font-family: var(--font-serif); font-size: 15px; line-height: 1.2;
          color: var(--ink); letter-spacing:-0.005em;
        }
        .h-popover .row .meta{
          font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted); margin-top: 3px;
          display:flex; gap:8px; align-items:center;
        }
        .h-popover .hd{
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 4px;
        }
        .h-leg{
          position: absolute; right: ${padX}px; top: 4px;
          display: flex; gap: 14px; align-items: center;
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted);
        }
        .h-leg .swatch{ width:9px; height:9px; border-radius:50%; }
        .h-today{
          position:absolute; top: ${axisY - 12}px; bottom: 80px;
          width: 0; border-left: 1px dashed var(--ink); opacity: 0.32;
        }
        .h-today-lbl{
          position:absolute; top: ${axisY - 30}px; transform: translateX(-50%);
          font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ink-2); background: var(--paper);
          padding: 2px 7px; border: 1px solid var(--rule); border-radius: 4px; white-space: nowrap;
        }
      `}</style>

      <div className="h-zone-lbl" style={{ top: 18, left: padX - 32 }}>wins</div>
      <div className="h-zone-lbl" style={{ top: axisY + 72, left: padX - 32 }}>losses</div>

      <div className="h-leg">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="swatch" style={{ background: 'var(--win)' }} />win</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="swatch" style={{ background: 'var(--loss)' }} />loss</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="swatch" style={{ background: 'var(--paper)', border: '1.5px solid var(--ink)' }} />private</span>
      </div>

      <div className="h-axis" />

      {months.map((m, i) => {
        const x = xFor(m);
        const isJan = m.getMonth() === 0;
        return (
          <div key={"m" + i} style={{ display: 'contents' }}>
            <div className={"h-tick" + (isJan ? " major" : "")} style={{ left: x }} />
            <div className="h-month-lbl" style={{ left: x }}>{fmtMonth(m)}</div>
            {isJan ? <div className="h-year-lbl" style={{ left: x }}>{m.getFullYear()}</div> : null}
          </div>
        );
      })}

      {(() => {
        const today = TODAY;
        if (today < start || today > end) return null;
        const x = xFor(today);
        return <>
          <div className="h-today" style={{ left: x }} />
          <div className="h-today-lbl" style={{ left: x }}>today</div>
        </>;
      })()}

      {winClusters.map((cl, i) => {
        const x = xFor(cl.date);
        const id = "w" + i;
        const cls = "chip-win";
        return (
          <div key={id} className={"h-cluster above " + cls}
            style={{ left: x }}
            onMouseEnter={() => setHover({ id, side: 'above' })}
            onMouseLeave={() => setHover(h => h && h.id === id ? null : h)}
          >
            <div className="h-stack">
              {cl.events.map(ev => (
                <div key={ev.id}
                  className={"h-dot " + (ev.privacy === 'private' ? 'private' : ev.privacy === 'shared' ? 'shared' : '') + " " + cls}
                  onClick={() => onOpenEvent(ev)}
                  title={ev.title}
                />
              ))}
            </div>
            <div className="h-stem" style={{ height: 10 + cl.events.length * 4 }} />
            <ClusterLabel cluster={cl} side="above" />
          </div>
        );
      })}

      {lossClusters.map((cl, i) => {
        const x = xFor(cl.date);
        const id = "l" + i;
        const cls = "chip-loss";
        return (
          <div key={id} className={"h-cluster below " + cls}
            style={{ left: x }}
            onMouseEnter={() => setHover({ id, side: 'below' })}
            onMouseLeave={() => setHover(h => h && h.id === id ? null : h)}
          >
            <div className="h-stem" style={{ height: 10 + cl.events.length * 4 }} />
            <div className="h-stack">
              {cl.events.map(ev => (
                <div key={ev.id}
                  className={"h-dot " + (ev.privacy === 'private' ? 'private' : ev.privacy === 'shared' ? 'shared' : '') + " " + cls}
                  onClick={() => onOpenEvent(ev)}
                  title={ev.title}
                />
              ))}
            </div>
            <ClusterLabel cluster={cl} side="below" />
          </div>
        );
      })}

      {hover ? (() => {
        const list = hover.side === 'above' ? winClusters : lossClusters;
        const idx = parseInt(hover.id.slice(1), 10);
        const cl = list[idx];
        if (!cl) return null;
        const x = xFor(cl.date);
        const cls = hover.side === 'above' ? 'chip-win' : 'chip-loss';
        return (
          <div className={"h-popover " + cls}
            style={{
              left: x,
              [hover.side === 'above' ? 'bottom' : 'top']: hover.side === 'above' ? (totalH - axisY + 90) : (axisY + 90),
            }}
            onMouseEnter={() => setHover(hover)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="hd">{fmtFull(cl.date)}{cl.events.length > 1 ? ` \u00b7 ${cl.events.length} entries` : ''}</div>
            {cl.events.map(ev => (
              <div key={ev.id} className="row" onClick={() => onOpenEvent(ev)}>
                <KindDot event={ev} size={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ttl">{ev.title}</div>
                  <div className="meta">
                    <Avatar person={personById(ev.person)} size={14} />
                    <span>{personById(ev.person).name}</span>
                    <span style={{ flex: 1 }} />
                    {ev.imageUrl || ev.imageCaption ? <PhotoHint size={11} /> : null}
                    <PrivacyIcon privacy={ev.privacy} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })() : null}
    </div>
  );
}
