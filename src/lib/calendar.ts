// ── Calendar invites for confirmed calls ─────────────────────────────
// Two things, because no single one covers everybody:
//
//   googleCalendarUrl() — a one-click "Add to Google Calendar" link. No OAuth,
//   no API, no consent screen. Google's calendar scope is a *sensitive* scope
//   and needs an app verification review before it can be used in production,
//   so writing events into someone's calendar directly is weeks away. This
//   works today and puts the event in the same place.
//
//   icsFile() — the same event as a real .ics, which Outlook, Apple Calendar
//   and Google all import. Attached to the email so nobody is forced through
//   a Google link to get the meeting.

export type CalendarEvent = {
  title: string;
  description: string;
  startsAt: string;   // ISO 8601
  minutes: number;
  location?: string;
};

/** Google's template URL wants basic UTC: 20260908T100000Z. */
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function window_(e: CalendarEvent) {
  const start = new Date(e.startsAt);
  const end = new Date(start.getTime() + e.minutes * 60_000);
  return { start, end };
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const { start, end } = window_(e);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: e.description,
    ...(e.location ? { location: e.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

/** RFC 5545 folds long lines and escapes , ; and newlines. Skip either and
 *  strict clients (Outlook especially) reject the whole file. */
function esc(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts = [line.slice(0, 74)];
  for (let i = 74; i < line.length; i += 73) parts.push(" " + line.slice(i, i + 73));
  return parts.join("\r\n");
}

export function icsFile(e: CalendarEvent, opts: { uid: string; organizer: string; attendees: string[] }): string {
  const { start, end } = window_(e);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hyrde//Calls//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@hyrde.net`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description)}`,
    ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
    `ORGANIZER:mailto:${opts.organizer}`,
    ...opts.attendees.map(a => `ATTENDEE;RSVP=TRUE;CN=${esc(a)}:mailto:${a}`),
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n");
}
