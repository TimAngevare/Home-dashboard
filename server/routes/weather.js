import { Router } from 'express';
import axios from 'axios';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const router = Router();

router.get('/', cacheMiddleware('weather', 9 * 60), async (_req, res) => {
  const lat = process.env.WEATHER_LAT || '52.1551';
  const lon = process.env.WEATHER_LON || '5.3875';
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
    `&timezone=auto&forecast_days=4`;
  try {
    const { data } = await axios.get(url, { timeout: 8000 });
    const current = data.current || {};
    const daily = data.daily || {};
    const forecast = (daily.time || []).map((date, i) => ({
      date,
      tmax: daily.temperature_2m_max?.[i] ?? null,
      tmin: daily.temperature_2m_min?.[i] ?? null,
      code: daily.weathercode?.[i] ?? null,
    }));
    res.json(
      buildResponse({
        location: { lat: Number(lat), lon: Number(lon) },
        current: {
          temp: current.temperature_2m ?? null,
          code: current.weathercode ?? null,
          wind: current.windspeed_10m ?? null,
          humidity: current.relative_humidity_2m ?? null,
          time: current.time ?? null,
        },
        forecast,
      }),
    );
  } catch (e) {
    res.json(buildError(e?.message || 'weather fetch failed'));
  }
});

export default router;
