import { Router } from 'express';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';
import { getStates, callService, parseIdList } from '../lib/ha.js';

const router = Router();

function toLight(l) {
  const attrs = l.attributes || {};
  return {
    entity_id: l.entity_id,
    name: attrs.friendly_name || l.entity_id.replace(/^light\./, '').replace(/_/g, ' '),
    state: l.state, // 'on' | 'off' | 'unavailable'
    brightness: typeof attrs.brightness === 'number' ? attrs.brightness : null,
    color: attrs.rgb_color || null,
    area: attrs.area_id || attrs.area || 'Other',
  };
}

router.get('/', cacheMiddleware('lights', 25), async (_req, res) => {
  const filterIds = new Set(parseIdList(process.env.HA_LIGHT_ENTITY_IDS));

  try {
    const states = await getStates();
    let lights = states.filter((s) => typeof s.entity_id === 'string' && s.entity_id.startsWith('light.'));
    if (filterIds.size) lights = lights.filter((s) => filterIds.has(s.entity_id));

    const items = lights.map(toLight).sort((a, b) => a.name.localeCompare(b.name));
    const onCount = items.filter((l) => l.state === 'on').length;
    res.json(buildResponse({ items, total: items.length, on: onCount }));
  } catch (e) {
    res.json(buildError(e?.message || 'home assistant fetch failed'));
  }
});

// POST /api/lights/:entityId  { action: 'toggle' | 'turn_on' | 'turn_off', brightness_pct? }
router.post('/:entityId', async (req, res) => {
  const { entityId } = req.params;
  const { action = 'toggle', brightness_pct } = req.body || {};
  if (!['toggle', 'turn_on', 'turn_off'].includes(action)) {
    return res.status(400).json(buildError('invalid action'));
  }
  const serviceData = { entity_id: entityId };
  if (action === 'turn_on' && typeof brightness_pct === 'number') {
    serviceData.brightness_pct = brightness_pct;
  }
  // Don't block the tap on HA's response - some devices take 10s+ to ack.
  // Fire the call, respond immediately, let the next poll pick up the state.
  callService('light', action, serviceData).catch((e) =>
    console.error(`[lights] service call failed for ${entityId}:`, e.message),
  );
  res.json(buildResponse({ ok: true }));
});

export default router;
