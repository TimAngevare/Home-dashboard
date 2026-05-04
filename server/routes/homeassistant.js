import { Router } from 'express';
import axios from 'axios';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const router = Router();

router.get('/', cacheMiddleware('lights', 25), async (_req, res) => {
  const url = process.env.HA_URL;
  const token = process.env.HA_TOKEN;
  if (!url || !token) {
    return res.json(buildError('HA_URL or HA_TOKEN not configured'));
  }
  const filterIds = (process.env.HA_LIGHT_ENTITY_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const { data } = await axios.get(`${url.replace(/\/$/, '')}/api/states`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });

    let lights = (Array.isArray(data) ? data : []).filter((s) =>
      typeof s.entity_id === 'string' && s.entity_id.startsWith('light.'),
    );
    if (filterIds.length) {
      const set = new Set(filterIds);
      lights = lights.filter((s) => set.has(s.entity_id));
    }

    const grouped = new Map();
    for (const l of lights) {
      const attrs = l.attributes || {};
      const area = attrs.area_id || attrs.area || 'Other';
      if (!grouped.has(area)) grouped.set(area, []);
      grouped.get(area).push({
        entity_id: l.entity_id,
        name: attrs.friendly_name || l.entity_id.replace(/^light\./, '').replace(/_/g, ' '),
        state: l.state, // 'on' | 'off' | 'unavailable'
        brightness: typeof attrs.brightness === 'number' ? attrs.brightness : null,
        color: attrs.rgb_color || null,
      });
    }

    const groups = [...grouped.entries()]
      .map(([area, items]) => ({ area, items }))
      .sort((a, b) => a.area.localeCompare(b.area));

    const onCount = lights.filter((l) => l.state === 'on').length;
    res.json(buildResponse({ groups, total: lights.length, on: onCount }));
  } catch (e) {
    res.json(buildError(e?.message || 'home assistant fetch failed'));
  }
});

export default router;
