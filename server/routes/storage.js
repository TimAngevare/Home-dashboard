import { Router } from 'express';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const execAsync = promisify(exec);
const router = Router();

async function dfStats(path) {
  // -B1 for byte-precision, -P for portable single-line-per-mount output
  const { stdout } = await execAsync(`df -B1 -P ${JSON.stringify(path)}`);
  const lines = stdout.trim().split('\n');
  const cols = lines[lines.length - 1].trim().split(/\s+/);
  const [filesystem, totalStr, usedStr, availStr, pct, mount] = cols;
  return {
    filesystem,
    mount,
    totalBytes: Number(totalStr),
    usedBytes: Number(usedStr),
    freeBytes: Number(availStr),
    usedPct: Number(String(pct).replace('%', '')),
  };
}

router.get('/', cacheMiddleware('storage', 30), async (_req, res) => {
  const smbPath = process.env.STORAGE_PATH || '/mnt/timssd';
  const smbLabel = process.env.STORAGE_LABEL || 'Storage';

  const results = await Promise.allSettled([dfStats(smbPath), dfStats('/')]);

  const [smbResult, rootResult] = results;
  const drives = [];
  if (smbResult.status === 'fulfilled') {
    drives.push({ label: smbLabel, ...smbResult.value });
  }
  if (rootResult.status === 'fulfilled') {
    drives.push({ label: 'Pi SD card', ...rootResult.value });
  }

  if (!drives.length) {
    return res.json(buildError('could not read disk stats'));
  }
  res.json(buildResponse({ drives }));
});

export default router;
