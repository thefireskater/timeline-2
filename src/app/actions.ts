'use server';

import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

export async function createEvent(data: {
  date: string;
  person: string;
  kind: 'win' | 'loss';
  privacy: 'public' | 'private' | 'shared';
  title: string;
  note: string;
  imageUrl: string | null;
  imageCaption: string | null;
  sharedWith: string[];
}) {
  const id = nanoid(10);
  await db.insert(events).values({
    id,
    date: data.date,
    personId: data.person,
    kind: data.kind,
    privacy: data.privacy,
    title: data.title,
    note: data.note,
    imageUrl: data.imageUrl,
    imageCaption: data.imageCaption,
    sharedWith: data.sharedWith.length > 0 ? data.sharedWith : null,
  });
  revalidatePath('/');
  return id;
}

export async function updateEvent(data: {
  id: string;
  privacy: 'public' | 'private' | 'shared';
  sharedWith?: string[];
}) {
  await db.update(events)
    .set({
      privacy: data.privacy,
      sharedWith: data.sharedWith && data.sharedWith.length > 0 ? data.sharedWith : null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, data.id));
  revalidatePath('/');
}

export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id));
  revalidatePath('/');
}
