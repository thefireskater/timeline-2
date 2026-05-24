import { Timeline } from '@/components/Timeline';
import type { Person, TimelineEvent } from '@/lib/types';
import { SEED_PEOPLE, SEED_EVENTS } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

async function getData(): Promise<{ people: Person[]; events: TimelineEvent[] }> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('user:pass@host')) {
    return { people: SEED_PEOPLE, events: SEED_EVENTS };
  }

  const { db } = await import('@/db');
  const { people, events } = await import('@/db/schema');
  const { asc } = await import('drizzle-orm');

  const peopleRows = await db.select().from(people).orderBy(asc(people.id));
  const eventRows = await db.select().from(events).orderBy(asc(events.date));

  const peopleData: Person[] = peopleRows.map(p => ({
    id: p.id,
    name: p.name,
    short: p.short,
    tint: p.tint,
  }));

  const eventsData: TimelineEvent[] = eventRows.map(e => ({
    id: e.id,
    date: e.date,
    person: e.personId,
    kind: e.kind as 'win' | 'loss',
    privacy: e.privacy as 'public' | 'private' | 'shared',
    title: e.title,
    note: e.note,
    imageUrl: e.imageUrl ?? null,
    imageCaption: e.imageCaption ?? null,
    sharedWith: e.sharedWith ?? [],
  }));

  return { people: peopleData, events: eventsData };
}

export default async function Home() {
  const { people, events } = await getData();
  return <Timeline people={people} initialEvents={events} />;
}
