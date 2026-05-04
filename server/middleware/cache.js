import NodeCache from 'node-cache';

const stores = new Map();

function getStore(namespace, ttl) {
  let store = stores.get(namespace);
  if (!store) {
    store = new NodeCache({ stdTTL: ttl, checkperiod: Math.max(1, Math.floor(ttl / 2)) });
    stores.set(namespace, store);
  }
  return store;
}

export function cacheMiddleware(namespace, ttlSeconds) {
  const store = getStore(namespace, ttlSeconds);
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const hit = store.get(key);
    if (hit !== undefined) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(hit);
    }
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        if (body && body.error !== true) store.set(key, body);
      } catch {
        // ignore cache write errors
      }
      return originalJson(body);
    };
    next();
  };
}

export function buildResponse(data) {
  return { error: false, message: null, data, ts: Date.now() };
}

export function buildError(message) {
  return { error: true, message, data: null, ts: Date.now() };
}
