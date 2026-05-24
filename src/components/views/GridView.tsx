'use client';
import { useMemo } from 'react';
import type { TimelineEvent, Person } from '@/lib/types';
import { parseDate, fmtMonthLong, TODAY } from '@/lib/dates';
import { KindDot, PhotoHint, Avatar } from '@/components/shared';

function MonthCard({ month, events, people, onOpenEvent }: {
  month: Date;
  events: TimelineEvent[];
  people: Person[];
  onOpenEvent: (e: TimelineEvent) => void;
}) {
  const personById = (id: string) => people.find(p => p.id === id) || people[0];
  const year = month.getFullYear();
  const mIdx = month.getMonth();
  const daysIn = new Date(year, mIdx + 1, 0).getDate();
  const firstDow = new Date(year, mIdx, 1).getDay();
  const lead = (firstDow + 6) % 7;
  const totalCells = Math.ceil((lead + daysIn) / 7) * 7;

  const byDay: Record<number, TimelineEvent[]> = {};
  for (const e of events) {
    const d = parseDate(e.date).getDate();
    (byDay[d] ||= []).push(e);
  }

  const wins = events.filter(e => e.kind === 'win').length;
  const losses = events.filter(e => e.kind === 'loss').length;

  const today = TODAY;
  const isThisMonth = today.getFullYear() === year && today.getMonth() === mIdx;

  return (
    <div className="g-month">
      <div className="g-mh">
        <div>
          <div className="name">{fmtMonthLong(month)}</div>
          <div className="yr">{year}</div>
        </div>
        <div className="tot">
          {wins > 0 ? <span className="w">{wins}W</span> : null}
          {losses > 0 ? <span className="l">{losses}L</span> : null}
          {wins === 0 && losses === 0 ? <span style={{ color: 'var(--muted-2)' }}>&mdash;</span> : null}
        </div>
      </div>

      <div className="g-days">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="g-dow">{d}</div>
        ))}
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - lead + 1;
          if (dayNum < 1 || dayNum > daysIn) {
            return <div key={i} className="g-cell out" />;
          }
          const dayEvents = byDay[dayNum] || [];
          const hasWin = dayEvents.some(e => e.kind === 'win');
          const hasLoss = dayEvents.some(e => e.kind === 'loss');
          let fill = '';
          if (hasWin && hasLoss) fill = 'g-fill-mixed';
          else if (hasWin) fill = 'g-fill-win';
          else if (hasLoss) fill = 'g-fill-loss';

          const isToday = isThisMonth && today.getDate() === dayNum;

          return (
            <div
              key={i}
              className={"g-cell " + fill + (dayEvents.length ? ' has ' : '') + (isToday ? ' today' : '')}
              onClick={dayEvents.length ? () => onOpenEvent(dayEvents[0]) : undefined}
              title={dayEvents.length ? dayEvents.map(e => e.title).join(' \u2022 ') : ''}
            >
              <span className="g-num">{dayNum}</span>
              {dayEvents.length ? (
                <div className="g-dots">
                  {dayEvents.slice(0, 4).map((e, j) => {
                    const cls = e.kind === 'win' ? 'win' : 'loss';
                    const priv = e.privacy === 'private';
                    return (
                      <div
                        key={j}
                        className={"g-dot " + cls + (priv ? ' private' : '')}
                        style={priv ? { '--dotc-here': e.kind === 'win' ? 'var(--win)' : 'var(--loss)' } as React.CSSProperties : undefined}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {events.length > 0 ? (
        <div className="g-list">
          {events
            .slice()
            .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
            .map(e => (
              <div key={e.id} className="g-evt" onClick={() => onOpenEvent(e)}>
                <KindDot event={e} size={8} />
                <span className="d">{String(parseDate(e.date).getDate()).padStart(2, '0')}</span>
                <span className="ttl">{e.title}</span>
                {(e.imageUrl || e.imageCaption) ? <PhotoHint /> : null}
                <Avatar person={personById(e.person)} size={16} />
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}

export function GridView({ events, range, people, onOpenEvent }: {
  events: TimelineEvent[];
  range: { start: Date; end: Date };
  people: Person[];
  onOpenEvent: (e: TimelineEvent) => void;
}) {
  const { start, end } = range;

  const months = useMemo(() => {
    const out: Date[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const stop = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= stop) {
      out.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  }, [start.getTime(), end.getTime()]);

  const monthMap = useMemo(() => {
    const m = new Map<string, TimelineEvent[]>();
    for (const e of events) {
      const d = parseDate(e.date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return m;
  }, [events]);

  const colCount = months.length <= 4 ? months.length : (months.length <= 6 ? 3 : 4);

  return (
    <div className="g-view">
      <style>{`
        .g-view{ display: grid; grid-template-columns: repeat(${colCount}, 1fr); gap: 18px; }
        .g-month{
          background: var(--card); border: 1px solid var(--rule); border-radius: 14px;
          padding: 16px 16px 18px; position: relative;
        }
        .g-mh{ display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
        .g-mh .name{ font-family: var(--font-serif); font-size: 22px; letter-spacing: -0.005em; line-height: 1; }
        .g-mh .yr{ font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; color: var(--muted); }
        .g-mh .tot{ display: inline-flex; gap: 10px; font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-2); }
        .g-mh .tot .w{ color: var(--win-ink); }
        .g-mh .tot .l{ color: var(--loss-ink); }
        .g-days{ display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 4px; }
        .g-dow{
          font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.04em;
          color: var(--muted-2); text-align: center; padding: 2px 0;
        }
        .g-cell{
          aspect-ratio: 1 / 1; border-radius: 5px; background: var(--card-2);
          position: relative; display: grid; place-items: center;
          font-family: var(--font-mono); font-size: 9.5px; color: var(--muted-2);
          cursor: default; overflow: hidden;
        }
        .g-cell.out{ opacity: 0.25; }
        .g-cell.today{ outline: 1.5px solid var(--ink); outline-offset: -1.5px; color: var(--ink); }
        .g-cell.has{ cursor: pointer; color: var(--ink); }
        .g-cell.has:hover{ transform: scale(1.08); z-index: 3; }
        .g-fill-win  { background: var(--win-soft); }
        .g-fill-loss { background: var(--loss-soft); }
        .g-fill-mixed{ background: linear-gradient(135deg, var(--win-soft) 50%, var(--loss-soft) 50%); }
        .g-dots{
          position: absolute; bottom: 3px; left: 0; right: 0;
          display: flex; justify-content: center; gap: 2px;
        }
        .g-dot{ width: 5px; height: 5px; border-radius: 50%; }
        .g-dot.win{  background: var(--win); }
        .g-dot.loss{ background: var(--loss); }
        .g-dot.private{
          background: var(--paper);
          box-shadow: inset 0 0 0 1px var(--dotc-here, var(--ink));
        }
        .g-num{
          position: absolute; top: 3px; left: 5px;
          font-family: var(--font-mono); font-size: 9px; color: var(--muted-2);
        }
        .g-cell.has .g-num{ color: var(--ink-2); }
        .g-list{
          margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--rule);
          display: flex; flex-direction: column; gap: 6px;
        }
        .g-evt{ display: flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer; }
        .g-evt .ttl{
          font-size: 12.5px; color: var(--ink-2); line-height: 1.3; flex: 1; text-wrap: pretty;
        }
        .g-evt:hover .ttl{ color: var(--ink); text-decoration: underline; text-decoration-thickness: 0.5px; text-underline-offset: 3px; }
        .g-evt .d{ font-family: var(--font-mono); font-size: 10px; color: var(--muted); width: 22px; }
      `}</style>

      {months.map((m, i) => (
        <MonthCard
          key={i}
          month={m}
          events={monthMap.get(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`) || []}
          people={people}
          onOpenEvent={onOpenEvent}
        />
      ))}
    </div>
  );
}
