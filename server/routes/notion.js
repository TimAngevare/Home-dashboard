import { Router } from 'express';
import { Client } from '@notionhq/client';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const router = Router();

const PRIORITY_COLORS = {
  high: '#ff4d4d',
  medium: '#f5a623',
  low: '#3b8bf5',
  urgent: '#ff4d4d',
};

function readPlain(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map((t) => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map((t) => t.plain_text).join('');
  return '';
}

function readSelect(prop) {
  if (!prop) return null;
  if (prop.select) return prop.select.name || null;
  if (prop.status) return prop.status.name || null;
  return null;
}

function readDate(prop) {
  if (!prop || !prop.date) return null;
  return prop.date.start || null;
}

router.get('/', cacheMiddleware('notion', 4 * 60), async (_req, res) => {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) return res.json(buildError('NOTION_TOKEN/DATABASE_ID not configured'));

  try {
    const notion = new Client({ auth: token });

    const dbInfo = await notion.databases.retrieve({ database_id: databaseId });
    const props = dbInfo.properties || {};

    const titleKey = Object.keys(props).find((k) => props[k].type === 'title') || 'Name';
    const statusKey = Object.keys(props).find((k) => props[k].type === 'status') ||
      Object.keys(props).find((k) => k.toLowerCase() === 'status');
    const priorityKey = Object.keys(props).find((k) => k.toLowerCase() === 'priority');
    const dueKey = Object.keys(props).find((k) => /due|date/i.test(k) && props[k].type === 'date');
    const projectKey = Object.keys(props).find((k) => k.toLowerCase() === 'project');

    const filter = statusKey
      ? props[statusKey].type === 'status'
        ? { property: statusKey, status: { does_not_equal: 'Done' } }
        : { property: statusKey, select: { does_not_equal: 'Done' } }
      : undefined;

    const sorts = [];
    if (priorityKey) sorts.push({ property: priorityKey, direction: 'descending' });
    sorts.push({ timestamp: 'created_time', direction: 'descending' });

    const query = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
      page_size: 25,
    });

    const items = query.results.map((page) => {
      const p = page.properties || {};
      const status = statusKey ? readSelect(p[statusKey]) : null;
      const priority = priorityKey ? readSelect(p[priorityKey]) : null;
      const due = dueKey ? readDate(p[dueKey]) : null;
      return {
        id: page.id,
        title: readPlain(p[titleKey]) || '(untitled)',
        status,
        priority,
        priorityColor: priority ? PRIORITY_COLORS[priority.toLowerCase()] || '#9b6dff' : null,
        done: status?.toLowerCase() === 'done',
        due,
        project: projectKey ? readSelect(p[projectKey]) || readPlain(p[projectKey]) || null : null,
      };
    });

    res.json(
      buildResponse({
        items,
        total: items.length,
        schema: { statusKey: statusKey || null, statusType: statusKey ? props[statusKey].type : null },
      }),
    );
  } catch (e) {
    res.json(buildError(e?.message || 'notion fetch failed'));
  }
});

// PATCH /api/todos/:id  { done: true }
router.patch('/:id', async (req, res) => {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) return res.json(buildError('NOTION_TOKEN/DATABASE_ID not configured'));

  const done = req.body?.done !== false;
  const doneName = process.env.NOTION_DONE_STATUS || 'Done';
  const openName = process.env.NOTION_OPEN_STATUS || 'In progress';

  try {
    const notion = new Client({ auth: token });
    const dbInfo = await notion.databases.retrieve({ database_id: databaseId });
    const props = dbInfo.properties || {};
    const statusKey =
      Object.keys(props).find((k) => props[k].type === 'status') ||
      Object.keys(props).find((k) => k.toLowerCase() === 'status');
    if (!statusKey) return res.json(buildError('no status property on the database'));

    const value = done ? doneName : openName;
    const properties =
      props[statusKey].type === 'status'
        ? { [statusKey]: { status: { name: value } } }
        : { [statusKey]: { select: { name: value } } };

    await notion.pages.update({ page_id: req.params.id, properties });
    res.json(buildResponse({ ok: true, id: req.params.id, done }));
  } catch (e) {
    res.json(buildError(e?.message || 'notion update failed'));
  }
});

export default router;
