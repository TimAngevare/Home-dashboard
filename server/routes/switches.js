import { Router } from 'express';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';
import { getStates, callService, parseIdList } from '../lib/ha.js';

const router = Router();

router.get('/', cacheMiddleware('switches', 25), async (_req, res) => {
  const ids = parseIdList(process.env.HA_SWITCH_ENTITY_IDS);
  if (!ids.length) return res.json(buildResponse({ items: [] }));

  try {
    const states = await getStates();
    const byId = new Map(states.map((s) => [s.entity_id, s]));
    const items = ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((s) => {
        const attrs = s.attributes || {};
        return {
          entity_id: s.entity_id,
          name: attrs.friendly_name || s.entity_id.replace(/^switch\./, '').replace(/_/g, ' '),
          state: s.state,
        };
      });
    res.json(buildResponse({ items }));
  } catch (e) {
    res.json(buildError(e?.message || 'home assistant fetch failed'));
  }
});

// POST /api/switches/:entityId  { action: 'toggle' | 'turn_on' | 'turn_off' }
router.post('/:entityId', async (req, res) => {
  const { entityId } = req.params;
  const { action = 'toggle' } = req.body || {};
  if (!['toggle', 'turn_on', 'turn_off'].includes(action)) {
    return res.status(400).json(buildError('invalid action'));
  }
  // Fire-and-forget: don't block the tap on HA's ack (some devices are slow).
  callService('switch', action, { entity_id: entityId }).catch((e) =>
    console.error(`[switches] service call failed for ${entityId}:`, e.message),
  );
  res.json(buildResponse({ ok: true }));
});

export default router;
