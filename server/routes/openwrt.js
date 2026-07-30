import { Router } from 'express';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';
import { call } from '../lib/ubus.js';

const router = Router();

let sample = { ts: 0, rx: 0, tx: 0 };
const dailyTotals = { date: '', rxStart: 0, txStart: 0 };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', cacheMiddleware('network', 4), async (_req, res) => {
  const device = process.env.OPENWRT_WAN_DEVICE || 'pppoe-wan';
  try {
    const [info, dev, leases] = await Promise.all([
      call('system', 'info', {}),
      call('network.device', 'status', { name: device }),
      call('luci-rpc', 'getDHCPLeases', {}).catch(() => null),
    ]);

    const stats = dev?.statistics || {};
    const rx = Number(stats.rx_bytes || 0);
    const tx = Number(stats.tx_bytes || 0);

    const now = Date.now();
    let downBps = 0;
    let upBps = 0;
    if (sample.ts && now > sample.ts) {
      const dt = (now - sample.ts) / 1000;
      downBps = Math.max(0, (rx - sample.rx) / dt);
      upBps = Math.max(0, (tx - sample.tx) / dt);
    }
    sample = { ts: now, rx, tx };

    const day = todayKey();
    if (dailyTotals.date !== day) {
      dailyTotals.date = day;
      dailyTotals.rxStart = rx;
      dailyTotals.txStart = tx;
    }
    const dayDown = Math.max(0, rx - dailyTotals.rxStart);
    const dayUp = Math.max(0, tx - dailyTotals.txStart);

    const leaseList = leases?.dhcp_leases || [];
    const mem = info?.memory || {};

    res.json(
      buildResponse({
        iface: device,
        downMbps: (downBps * 8) / 1_000_000,
        upMbps: (upBps * 8) / 1_000_000,
        clients: leaseList.length,
        totals: { rxBytes: dayDown, txBytes: dayUp },
        router: {
          uptimeSec: info?.uptime ?? null,
          load1: Array.isArray(info?.load) ? info.load[0] / 65536 : null,
          memTotalBytes: mem.total ?? null,
          memFreeBytes: mem.free ?? null,
        },
        ts: now,
      }),
    );
  } catch (e) {
    res.json(buildError(e?.message || 'openwrt fetch failed'));
  }
});

export default router;
