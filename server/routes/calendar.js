import { Router } from 'express';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';
import { getCalendars, getCalendarEvents, parseIdList } from '../lib/ha.js';

const router = Router();

const PALETTE = ['#9b6dff', '#3b8bf5', '#00d4aa', '#f5a623', '#ff4d4d', '#7ad7f0', '#f06292'];

function prettyName(entityId) {
  return entityId.replace(/^calendar\./, '').replace(/_/g, ' ');
}

router.get('/', cacheMiddleware('calendar', 4 * 60), async (_req, res) => {
  const configuredIds = parseIdList(process.env.HA_CALENDAR_ENTITY_IDS);

  let calendarMeta;
  try {
    // Prefer HA's calendar list so we get real friendly names + let a blank
    // env var mean "all calendars". Falls back to the configured id list
    // (with a derived name) if HA's calendar component isn't loaded.
    const list = await getCalendars();
    const filtered = configuredIds.length
      ? list.filter((c) => configuredIds.includes(c.entity_id))
      : list;
    calendarMeta = filtered.map((c, i) => ({
      id: c.entity_id,
      name: c.name || prettyName(c.entity_id),
      color: PALETTE[i % PALETTE.length],
    }));
  } catch {
    calendarMeta = configuredIds.map((id, i) => ({
      id,
      name: prettyName(id),
      color: PALETTE[i % PALETTE.length],
    }));
  }

  if (!calendarMeta.length) {
    return res.json(buildError('no calendars configured (set HA_CALENDAR_ENTITY_IDS, or check HA calendar integration)'));
  }

  const now = new Date();
  const max = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    const responses = await Promise.allSettled(
      calendarMeta.map((c) => getCalendarEvents(c.id, now.toISOString(), max.toISOString())),
    );

    const events = [];
    let anyOk = false;
    responses.forEach((r, i) => {
      if (r.status !== 'fulfilled') return;
      anyOk = true;
      const meta = calendarMeta[i];
      for (const e of r.value) {
        const start = e.start?.dateTime || e.start?.date;
        if (!start) continue;
        events.push({
          id: `${meta.id}:${e.uid || start}`,
          title: e.summary || '(no title)',
          start,
          end: e.end?.dateTime || e.end?.date || null,
          allDay: !e.start?.dateTime,
          calendar: meta.name,
          color: meta.color,
        });
      }
    });

    if (!anyOk) {
      throw new Error('all calendars unreachable (check the Google/HA calendar integration in Home Assistant)');
    }

    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    res.json(buildResponse({ events: events.slice(0, 20) }));
  } catch (e) {
    res.json(buildError(e?.message || 'calendar fetch failed'));
  }
});

export default router;
