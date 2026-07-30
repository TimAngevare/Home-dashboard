import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import os from 'node:os';

import weather from './routes/weather.js';
import lights from './routes/homeassistant.js';
import switches from './routes/switches.js';
import media from './routes/media.js';
import network from './routes/openwrt.js';
import calendar from './routes/calendar.js';
import todos from './routes/notion.js';
import system from './routes/system.js';
import storage from './routes/storage.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  res.json({
    ok: true,
    hostname: os.hostname(),
    ips,
    uptime: os.uptime(),
    ts: Date.now(),
  });
});

app.use('/api/weather', weather);
app.use('/api/lights', lights);
app.use('/api/switches', switches);
app.use('/api/media', media);
app.use('/api/network', network);
app.use('/api/calendar', calendar);
app.use('/api/todos', todos);
app.use('/api/system', system);
app.use('/api/storage', storage);

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err);
  res.status(200).json({ error: true, message: err?.message || 'server error', data: null });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
