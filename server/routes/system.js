import { Router } from 'express';
import os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { cacheMiddleware, buildResponse } from '../middleware/cache.js';

const execAsync = promisify(exec);
const router = Router();

async function cpuTempC() {
  try {
    const { stdout } = await execAsync('vcgencmd measure_temp');
    const m = stdout.match(/temp=([\d.]+)/);
    if (m) return Number(m[1]);
  } catch {
    // fall through to /sys
  }
  try {
    const raw = await readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    return Number(raw.trim()) / 1000;
  } catch {
    return null;
  }
}

router.get('/', cacheMiddleware('system', 4), async (_req, res) => {
  const temp = await cpuTempC();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  res.json(
    buildResponse({
      hostname: os.hostname(),
      cpuTempC: temp,
      loadavg: os.loadavg(), // [1m, 5m, 15m]
      cpuCount: os.cpus().length,
      memTotalBytes: totalMem,
      memFreeBytes: freeMem,
      memUsedBytes: totalMem - freeMem,
      uptimeSec: os.uptime(),
    }),
  );
});

export default router;
