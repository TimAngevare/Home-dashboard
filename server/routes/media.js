import { Router } from 'express';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';
import { getState, callService } from '../lib/ha.js';

const router = Router();

// HA media_player supported_features bitmask (subset we care about)
const FEATURE = {
  PAUSE: 1,
  VOLUME_SET: 4,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  VOLUME_STEP: 1024,
  PLAY: 16384,
  SHUFFLE_SET: 32768,
};

function entityId() {
  const id = process.env.HA_MEDIA_PLAYER_ENTITY_ID;
  if (!id) throw new Error('HA_MEDIA_PLAYER_ENTITY_ID not configured');
  return id;
}

// HA returns entity_picture as a path relative to HA itself (e.g. the
// media_player_proxy route for Spotify album art) - resolve it against
// HA_URL so the browser isn't fetching it from the dashboard's own origin.
function resolveImage(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (process.env.HA_URL || '').replace(/\/$/, '');
  return `${base}${path}`;
}

router.get('/', cacheMiddleware('media', 5), async (_req, res) => {
  try {
    const s = await getState(entityId());
    const a = s.attributes || {};
    const features = Number(a.supported_features || 0);
    const has = (bit) => (features & bit) === bit;

    res.json(
      buildResponse({
        entity_id: s.entity_id,
        state: s.state, // playing | paused | idle | off | unavailable
        title: a.media_title || null,
        artist: a.media_artist || null,
        album: a.media_album_name || null,
        image: resolveImage(a.entity_picture),
        durationSec: typeof a.media_duration === 'number' ? a.media_duration : null,
        positionSec: typeof a.media_position === 'number' ? a.media_position : null,
        positionUpdatedAt: a.media_position_updated_at || null,
        volume: typeof a.volume_level === 'number' ? a.volume_level : null,
        muted: !!a.is_volume_muted,
        shuffle: !!a.shuffle,
        source: a.source || null,
        controls: {
          playPause: has(FEATURE.PLAY) || has(FEATURE.PAUSE),
          next: has(FEATURE.NEXT_TRACK),
          previous: has(FEATURE.PREVIOUS_TRACK),
          volume: has(FEATURE.VOLUME_SET) || has(FEATURE.VOLUME_STEP),
          shuffle: has(FEATURE.SHUFFLE_SET),
        },
      }),
    );
  } catch (e) {
    res.json(buildError(e?.message || 'media player fetch failed'));
  }
});

const ACTIONS = {
  play_pause: () => callService('media_player', 'media_play_pause', { entity_id: entityId() }),
  next: () => callService('media_player', 'media_next_track', { entity_id: entityId() }),
  previous: () => callService('media_player', 'media_previous_track', { entity_id: entityId() }),
  shuffle: (value) => callService('media_player', 'shuffle_set', { entity_id: entityId(), shuffle: !!value }),
  volume: (value) =>
    callService('media_player', 'volume_set', { entity_id: entityId(), volume_level: Number(value) }),
};

// POST /api/media  { action: 'play_pause'|'next'|'previous'|'shuffle'|'volume', value? }
router.post('/', async (req, res) => {
  const { action, value } = req.body || {};
  const fn = ACTIONS[action];
  if (!fn) return res.status(400).json(buildError('invalid action'));
  // Fire-and-forget: don't block the tap on HA's ack.
  fn(value).catch((e) => console.error(`[media] action ${action} failed:`, e.message));
  res.json(buildResponse({ ok: true }));
});

export default router;
