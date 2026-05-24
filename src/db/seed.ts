import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const peopleData = [
  { id: 'you',    name: 'You',    short: 'YO', tint: '#1a1714' },
  { id: 'angie',  name: 'Angie',  short: 'AN', tint: '#6b5a3a' },
  { id: 'marcus', name: 'Marcus', short: 'MA', tint: '#3a5a6b' },
  { id: 'lena',   name: 'Lena',   short: 'LE', tint: '#6b3a5a' },
  { id: 'devon',  name: 'Devon',  short: 'DE', tint: '#5a6b3a' },
];

const eventsData = [
  { id: 'e01', date: '2025-06-15', personId: 'you',    kind: 'loss', privacy: 'private', title: 'Lost Northstar account',             note: 'A 14-month relationship gone in a 22-minute call. Their new VP wanted to consolidate vendors. Reminder: a single-thread champion isn\u2019t a moat.',  imageUrl: null, imageCaption: null },
  { id: 'e02', date: '2025-07-04', personId: 'angie',  kind: 'win',  privacy: 'public',  title: 'Course launch \u2014 first 12 sign-ups',       note: 'Soft launch over the long weekend. Three of the twelve are people she\u2019s never met before. That\u2019s the real signal.',                              imageUrl: null, imageCaption: 'Angie at her desk, launch day' },
  { id: 'e03', date: '2025-07-22', personId: 'you',    kind: 'win',  privacy: 'public',  title: 'Shipped v1 to TestFlight',             note: 'Eleven months of weekends. The first crash report came in eight minutes after the email blast. Still counts.',                                      imageUrl: null, imageCaption: 'v1 app icon / screenshot' },
  { id: 'e04', date: '2025-08-10', personId: 'you',    kind: 'loss', privacy: 'private', title: 'Mom in the ER',                        note: 'False alarm in the end. But I spent the night writing emails on a vinyl chair to keep from losing it.',                                            imageUrl: null, imageCaption: null },
  { id: 'e05', date: '2025-08-30', personId: 'marcus', kind: 'win',  privacy: 'shared',  title: 'Closed the seed \u2014 $2.4M',                 note: 'He\u2019d been on the road for six weeks. Two term sheets in the same afternoon.',                                                                    imageUrl: null, imageCaption: null },
  { id: 'e06', date: '2025-09-12', personId: 'angie',  kind: 'win',  privacy: 'public',  title: 'Hit 50 students',                      note: 'No paid ads. All from her newsletter and one podcast appearance.',                                                                                imageUrl: null, imageCaption: null },
  { id: 'e07', date: '2025-09-28', personId: 'you',    kind: 'loss', privacy: 'shared',  title: 'Pitch with Sequoia \u2014 pass',               note: 'They liked the team, not the wedge. Three follow-ups before the no.',                                                                            imageUrl: null, imageCaption: null },
  { id: 'e08', date: '2025-10-11', personId: 'lena',   kind: 'win',  privacy: 'public',  title: 'First 10K under 50:00',                note: 'Started running in March. Sub-50 was the goal for the year. Did it in October.',                                                                    imageUrl: null, imageCaption: null },
  { id: 'e09', date: '2025-10-25', personId: 'you',    kind: 'win',  privacy: 'public',  title: '100 paying customers',                 note: 'Took eleven weeks longer than the deck said it would.',                                                                                           imageUrl: null, imageCaption: null },
  { id: 'e10', date: '2025-11-05', personId: 'devon',  kind: 'win',  privacy: 'public',  title: 'Graduated nursing program',            note: 'Pinning ceremony was Tuesday. She cried. I cried.',                                                                                               imageUrl: null, imageCaption: 'Devon at the pinning ceremony' },
  { id: 'e11', date: '2025-11-19', personId: 'you',    kind: 'loss', privacy: 'private', title: 'Burned out, took the week off',        note: 'Couldn\u2019t open the laptop. Slept eleven hours a night and still felt scraped out. Calendar audit on Monday.',                                    imageUrl: null, imageCaption: null },
  { id: 'e12', date: '2025-12-02', personId: 'marcus', kind: 'loss', privacy: 'shared',  title: 'First key hire quit',                  note: 'Eight weeks in. Said the role wasn\u2019t what he expected. He was probably right.',                                                                  imageUrl: null, imageCaption: null },
  { id: 'e13', date: '2025-12-15', personId: 'angie',  kind: 'win',  privacy: 'public',  title: '100 students on the course',           note: 'She held off the launch a full year while she got the curriculum right. Worth it.',                                                                 imageUrl: null, imageCaption: 'Dashboard at 100 students' },
  { id: 'e14', date: '2025-12-28', personId: 'you',    kind: 'win',  privacy: 'shared',  title: 'Year-end review with the team',        note: 'Hard quarter, strong year. Everyone signed up for next year\u2019s plan without hedging.',                                                          imageUrl: null, imageCaption: null },
  { id: 'e15', date: '2026-01-09', personId: 'you',    kind: 'loss', privacy: 'private', title: 'Started therapy',                      note: 'Filed under loss because of what made me go, not what I think of going.',                                                                          imageUrl: null, imageCaption: null },
  { id: 'e16', date: '2026-01-22', personId: 'lena',   kind: 'loss', privacy: 'shared',  title: 'Didn\u2019t get the promotion',               note: 'Sixth time on the list, fourth time skipped over. She\u2019s deciding what that means.',                                                        imageUrl: null, imageCaption: null },
  { id: 'e17', date: '2026-02-03', personId: 'angie',  kind: 'win',  privacy: 'public',  title: 'Book chapter accepted',                note: 'A textbook publisher reached out via a student. Chapter on adult learning patterns.',                                                               imageUrl: null, imageCaption: null },
  { id: 'e18', date: '2026-02-14', personId: 'you',    kind: 'win',  privacy: 'private', title: 'Quiet anniversary at home',            note: 'Pasta, the cheap wine she pretends not to like, no phones on the table.',                                                                          imageUrl: null, imageCaption: null },
  { id: 'e19', date: '2026-02-27', personId: 'you',    kind: 'loss', privacy: 'private', title: 'Cofounder argument',                   note: 'About hiring pace. We both said things we walked back. Wrote it down so I don\u2019t forget the shape of it.',                                    imageUrl: null, imageCaption: null },
  { id: 'e20', date: '2026-03-11', personId: 'marcus', kind: 'win',  privacy: 'shared',  title: 'First enterprise contract',            note: '$180K ARR. Took two legal rounds. The sales motion is real now.',                                                                                 imageUrl: null, imageCaption: null },
  { id: 'e21', date: '2026-03-24', personId: 'you',    kind: 'win',  privacy: 'public',  title: '1,000 weekly active users',            note: 'Mid-March was the bet. Hit it on the 24th.',                                                                                                     imageUrl: null, imageCaption: 'The chart on the night it crossed' },
  { id: 'e22', date: '2026-04-06', personId: 'lena',   kind: 'win',  privacy: 'public',  title: 'Finished the marathon',                note: '4:11:33. Wept at mile 23. Smiled the rest.',                                                                                                     imageUrl: null, imageCaption: 'Lena at the finish line' },
  { id: 'e23', date: '2026-04-19', personId: 'you',    kind: 'loss', privacy: 'private', title: 'Bad week of metrics',                  note: 'Retention dropped two points without an obvious cause. Three engineers chasing it.',                                                              imageUrl: null, imageCaption: null },
  { id: 'e24', date: '2026-05-02', personId: 'devon',  kind: 'win',  privacy: 'public',  title: 'Engaged',                             note: 'On the dock at the lake house. He had been planning it since Christmas.',                                                                          imageUrl: null, imageCaption: 'The dock at the lake house' },
  { id: 'e25', date: '2026-05-15', personId: 'angie',  kind: 'win',  privacy: 'shared',  title: 'Cohort 3 sold out in 48 hours',        note: 'Doubled the price. Sold out faster than the last one.',                                                                                          imageUrl: null, imageCaption: null },
  { id: 'e26', date: '2026-05-19', personId: 'you',    kind: 'win',  privacy: 'public',  title: 'Hit revenue target a quarter early',  note: 'The Q3 number, hit in Q2. We\u2019re changing the plan, not the team.',                                                                           imageUrl: null, imageCaption: null },
];

async function seed() {
  console.log('Seeding people...');
  await db.insert(schema.people).values(peopleData).onConflictDoNothing();

  console.log('Seeding events...');
  await db.insert(schema.events).values(eventsData).onConflictDoNothing();

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
