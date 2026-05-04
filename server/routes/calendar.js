import { Router } from 'express';
import { google } from 'googleapis';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const router = Router();

const PALETTE = ['#9b6dff', '#3b8bf5', '#00d4aa', '#f5a623', '#ff4d4d', '#7ad7f0', '#f06292'];

function getOAuthClient() {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  const refresh = process.env.GOOGLE_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return null;
  const client = new google.auth.OAuth2(id, secret);
  client.setCredentials({ refresh_token: refresh });
  return client;
}

router.get('/', cacheMiddleware('calendar', 4 * 60), async (_req, res) => {
  const auth = getOAuthClient();
  if (!auth) return res.json(buildError('Google OAuth not configured'));

  try {
    const cal = google.calendar({ version: 'v3', auth });
    const { data: list } = await cal.calendarList.list({ maxResults: 50 });
    const calendars = list.items || [];

    const now = new Date();
    const max = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const calendarMeta = calendars.map((c, i) => ({
      id: c.id,
      name: c.summary,
      color: c.backgroundColor || PALETTE[i % PALETTE.length],
    }));

    const responses = await Promise.allSettled(
      calendarMeta.map((c) =>
        cal.events.list({
          calendarId: c.id,
          timeMin: now.toISOString(),
          timeMax: max.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 20,
        }),
      ),
    );

    const events = [];
    responses.forEach((r, i) => {
      if (r.status !== 'fulfilled') return;
      const meta = calendarMeta[i];
      for (const e of r.value.data.items || []) {
        const start = e.start?.dateTime || e.start?.date;
        if (!start) continue;
        events.push({
          id: e.id,
          title: e.summary || '(no title)',
          start,
          end: e.end?.dateTime || e.end?.date || null,
          allDay: !e.start?.dateTime,
          calendar: meta.name,
          color: meta.color,
        });
      }
    });

    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    res.json(buildResponse({ events: events.slice(0, 20) }));
  } catch (e) {
    res.json(buildError(e?.message || 'calendar fetch failed'));
  }
});

export default router;
