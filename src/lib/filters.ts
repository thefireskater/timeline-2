import { parseDate, daysBetween } from './dates';
import type { TimelineEvent } from './types';

export function filterEvents(
  events: TimelineEvent[],
  range: { start: Date; end: Date },
  visiblePeople: Record<string, boolean>,
  showPrivate: boolean
): TimelineEvent[] {
  return events.filter(e => {
    const d = parseDate(e.date);
    if (d < range.start || d > range.end) return false;
    if (!visiblePeople[e.person]) return false;
    if (!showPrivate && e.privacy === 'private') return false;
    return true;
  });
}

export type Cluster = {
  date: Date;
  events: TimelineEvent[];
};

export function clusterEvents(events: TimelineEvent[], tolDays: number): Cluster[] {
  if (events.length === 0) return [];
  const out: Cluster[] = [];
  let cur: Cluster | null = null;
  for (const ev of events) {
    const d = parseDate(ev.date);
    if (!cur || daysBetween(parseDate(cur.events[0].date), d) > tolDays) {
      cur = { date: d, events: [ev] };
      out.push(cur);
    } else {
      cur.events.push(ev);
    }
  }
  return out;
}
