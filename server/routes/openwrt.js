import { Router } from 'express';
import axios from 'axios';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const router = Router();

let session = { token: null, expires: 0 };
let sample = { ts: 0, rx: 0, tx: 0 };
const dailyTotals = { date: '', rxStart: 0, txStart: 0 };

async function rpc(path, method, params, requireAuth = true) {
  const base = process.env.OPENWRT_URL?.replace(/\/$/, '');
  if (!base) throw new Error('OPENWRT_URL not configured');
  const url = `${base}/cgi-bin/luci/rpc/${path}` + (requireAuth && session.token ? `?auth=${session.token}` : '');
  const { data } = await axios.post(
    url,
    { id: 1, method, params: params || [] },
    { timeout: 8000, headers: { 'Content-Type': 'application/json' } },
  );
  if (data?.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
  return data?.result;
}

async function authenticate() {
  const user = process.env.OPENWRT_USER;
  const pass = process.env.OPENWRT_PASSWORD;
  if (!user || !pass) throw new Error('OPENWRT_USER/PASSWORD not configured');
  const token = await rpc('auth', 'login', [user, pass], false);
  if (!token) throw new Error('OpenWRT login failed');
  session = { token, expires: Date.now() + 30 * 60 * 1000 };
  return token;
}

async function ensureAuth() {
  if (!session.token || Date.now() >= session.expires) await authenticate();
}

async function execLine(cmd) {
  try {
    return await rpc('sys', 'exec', [cmd]);
  } catch (e) {
    if (String(e.message).includes('403') || String(e.message).toLowerCase().includes('access')) {
      await authenticate();
      return rpc('sys', 'exec', [cmd]);
    }
    throw e;
  }
}

function readDevStats(text, iface) {
  const lines = String(text || '').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([^:]+):\s+(.*)$/);
    if (!m) continue;
    if (m[1].trim() !== iface) continue;
    const cols = m[2].trim().split(/\s+/).map(Number);
    return { rx: cols[0] || 0, tx: cols[8] || 0 };
  }
  return null;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', cacheMiddleware('network', 4), async (_req, res) => {
  const iface = process.env.OPENWRT_WAN_INTERFACE || 'eth0';
  try {
    await ensureAuth();
    const proc = await execLine('cat /proc/net/dev');
    const stats = readDevStats(proc, iface);
    if (!stats) throw new Error(`interface ${iface} not found in /proc/net/dev`);

    const now = Date.now();
    let downBps = 0;
    let upBps = 0;
    if (sample.ts && now > sample.ts) {
      const dt = (now - sample.ts) / 1000;
      downBps = Math.max(0, (stats.rx - sample.rx) / dt);
      upBps = Math.max(0, (stats.tx - sample.tx) / dt);
    }
    sample = { ts: now, rx: stats.rx, tx: stats.tx };

    const day = todayKey();
    if (dailyTotals.date !== day) {
      dailyTotals.date = day;
      dailyTotals.rxStart = stats.rx;
      dailyTotals.txStart = stats.tx;
    }
    const dayDown = Math.max(0, stats.rx - dailyTotals.rxStart);
    const dayUp = Math.max(0, stats.tx - dailyTotals.txStart);

    let clients = 0;
    try {
      const out = await execLine("iwinfo 2>/dev/null | awk '/Station/ {print}' | wc -l");
      const n = parseInt(String(out).trim(), 10);
      if (!Number.isNaN(n)) clients = n;
    } catch {
      clients = 0;
    }

    res.json(
      buildResponse({
        iface,
        downMbps: (downBps * 8) / 1_000_000,
        upMbps: (upBps * 8) / 1_000_000,
        clients,
        totals: { rxBytes: dayDown, txBytes: dayUp },
        ts: now,
      }),
    );
  } catch (e) {
    res.json(buildError(e?.message || 'openwrt fetch failed'));
  }
});

export default router;
