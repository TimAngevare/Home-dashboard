import { Router } from 'express';
import Parser from 'rss-parser';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const router = Router();
const parser = new Parser({ timeout: 8000 });

const PALETTE = ['#3b8bf5', '#00d4aa', '#f5a623', '#9b6dff', '#ff4d4d', '#7ad7f0', '#f06292'];

function parseFeeds() {
  const raw = process.env.NEWS_FEEDS;
  if (!raw) {
    return [
      { name: 'BBC', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
      { name: 'NOS', url: 'https://feeds.nos.nl/nosnieuwsalgemeen' },
      { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
    ];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

router.get('/', cacheMiddleware('news', 14 * 60), async (_req, res) => {
  const feeds = parseFeeds();
  if (!feeds.length) return res.json(buildResponse({ items: [], feeds: [] }));

  const perFeed = 4;
  const results = await Promise.allSettled(feeds.map((f) => parser.parseURL(f.url)));
  const items = [];
  const feedMeta = feeds.map((f, i) => ({ name: f.name, color: PALETTE[i % PALETTE.length] }));

  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    const meta = feedMeta[i];
    const entries = (r.value.items || []).slice(0, perFeed);
    for (const e of entries) {
      items.push({
        title: e.title || '(untitled)',
        link: e.link || '',
        published: e.isoDate || e.pubDate || null,
        source: meta.name,
        color: meta.color,
      });
    }
  });

  items.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
  const total = Math.min(12, items.length);
  res.json(buildResponse({ items: items.slice(0, total), feeds: feedMeta }));
});

router.use((err, _req, res, _next) => {
  res.json(buildError(err?.message || 'news error'));
});

export default router;
