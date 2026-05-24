import { db } from '@/db';
import { people, events } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { Timeline } from '@/components/Timeline';
import type { Person, TimelineEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
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

  return <Timeline people={peopleData} initialEvents={eventsData} />;
}
