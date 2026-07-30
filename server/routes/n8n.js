import { Router } from 'express';
import axios from 'axios';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

/**
 * GET /api/n8n — stats for the n8n card on Home + System.
 *
 * .env:
 *   N8N_URL=http://localhost:5678
 *   N8N_API_KEY=n8n_api_...        (Settings → n8n API → create an API key)
 */

const router = Router();

function headers() {
  const key = process.env.N8N_API_KEY;
  if (!key) throw new Error('N8N_API_KEY not configured');
  return { 'X-N8N-API-KEY': key, Accept: 'application/json' };
}

function base() {
  const url = process.env.N8N_URL;
  if (!url) throw new Error('N8N_URL not configured');
  return url.replace(/\/$/, '');
}

router.get('/', cacheMiddleware('n8n', 55), async (_req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [workflows, executions] = await Promise.all([
      axios.get(`${base()}/api/v1/workflows?active=true&limit=100`, { headers: headers(), timeout: 8000 }),
      axios.get(`${base()}/api/v1/executions?limit=100&includeData=false`, { headers: headers(), timeout: 8000 }),
    ]);

    const all = executions.data?.data || [];
    const today = all.filter((e) => new Date(e.startedAt || e.createdAt) >= startOfDay);
    const failedToday = today.filter((e) => e.status === 'error' || e.status === 'crashed').length;
    const finished = today.filter((e) => e.status && e.status !== 'running' && e.status !== 'waiting');

    // Executions per hour for the last 7 hours -> the mini bar strip.
    const hourly = Array.from({ length: 7 }, (_, i) => {
      const from = Date.now() - (7 - i) * 3600 * 1000;
      const to = from + 3600 * 1000;
      return all.filter((e) => {
        const t = new Date(e.startedAt || e.createdAt).getTime();
        return t >= from && t < to;
      }).length;
    });

    const last = all[0];

    res.json(
      buildResponse({
        activeWorkflows: (workflows.data?.data || []).length,
        runsToday: today.length,
        failedToday,
        successRate: finished.length
          ? Math.round(((finished.length - failedToday) / finished.length) * 100)
          : null,
        lastRunAgoSec: last ? Math.max(0, Math.round((Date.now() - new Date(last.startedAt || last.createdAt)) / 1000)) : null,
        hourly,
        recent: all.slice(0, 6).map((e) => ({
          id: String(e.id),
          name: e.workflowName || e.workflowData?.name || `workflow ${e.workflowId}`,
          status: e.status === 'crashed' ? 'error' : e.status || 'success',
          finishedAt: e.stoppedAt || e.startedAt || e.createdAt || null,
        })),
      }),
    );
  } catch (e) {
    res.json(buildError(e?.message || 'n8n fetch failed'));
  }
});

export default router;
