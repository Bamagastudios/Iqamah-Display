export interface Announcement {
  title: string;
  body: string;
}

/** Placeholder announcements until the Supabase content layer lands (Phase 4). */
export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  { title: 'Community dinner', body: 'Join us after Maghrib this Friday for a shared meal in the hall.' },
  { title: "Qur'an circle", body: 'Weekly halaqah after Isha, Tuesdays — all ages welcome.' },
  { title: 'Parking reminder', body: 'Please keep the east driveway clear for emergency access.' },
];
