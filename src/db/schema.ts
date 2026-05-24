import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const people = pgTable('people', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  short: text('short').notNull(),
  tint: text('tint').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  personId: text('person_id')
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  privacy: text('privacy').notNull().default('public'),
  title: text('title').notNull(),
  note: text('note').notNull().default(''),
  imageUrl: text('image_url'),
  imageCaption: text('image_caption'),
  sharedWith: text('shared_with').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
