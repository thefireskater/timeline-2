export type Person = {
  id: string;
  name: string;
  short: string;
  tint: string;
};

export type TimelineEvent = {
  id: string;
  date: string;
  person: string;
  kind: 'win' | 'loss';
  privacy: 'public' | 'private' | 'shared';
  title: string;
  note: string;
  imageUrl: string | null;
  imageCaption: string | null;
  sharedWith: string[];
};
