export const MS_DAY = 86400000;

export const parseDate = (s: string | Date): Date => {
  if (s instanceof Date) return s;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

export const fmtMonth = (d: Date): string => d.toLocaleString('en-US', { month: 'short' });
export const fmtMonthLong = (d: Date): string => d.toLocaleString('en-US', { month: 'long' });
export const fmtDay = (d: Date): number => d.getDate();
export const fmtFull = (d: Date): string => d.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
export const fmtFullShort = (d: Date): string => d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const isoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
};

export const daysBetween = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / MS_DAY);

export function getRange(rangeKey: string, anchor: Date): { start: Date; end: Date } {
  const end = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), 23, 59, 59);
  const start = new Date(end);
  if (rangeKey === 'month')   start.setMonth(start.getMonth() - 1);
  if (rangeKey === 'quarter') start.setMonth(start.getMonth() - 3);
  if (rangeKey === 'year')    start.setFullYear(start.getFullYear() - 1);
  if (rangeKey === 'all')     { start.setFullYear(2025, 5, 1); }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export const TODAY = new Date('2026-05-23T12:00:00');
