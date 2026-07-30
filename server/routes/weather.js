import { Router } from 'express';
import axios from 'axios';
import { cacheMiddleware, buildResponse, buildError } from '../middleware/cache.js';

const router = Router();

router.get('/', cacheMiddleware('weather', 9 * 60), async (_req, res) => {
  const lat = process.env.WEATHER_LAT || '52.1551';
  const lon = process.env.WEATHER_LON || '5.3875';
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset` +
    `&hourly=temperature_2m,precipitation_probability,weathercode` +
    `&timezone=auto&forecast_days=4`;
  try {
    const { data } = await axios.get(url, { timeout: 8000 });
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const forecast = (daily.time || []).map((date, i) => ({
      date,
      tmax: daily.temperature_2m_max?.[i] ?? null,
      tmin: daily.temperature_2m_min?.[i] ?? null,
      code: daily.weathercode?.[i] ?? null,
    }));

    const nowHour = new Date(current.time || Date.now());
    nowHour.setMinutes(0, 0, 0);
    const startIdx = (hourly.time || []).findIndex((t) => new Date(t).getTime() >= nowHour.getTime());
    const from = startIdx === -1 ? 0 : startIdx;
    const nextHours = (hourly.time || []).slice(from, from + 12).map((time, i) => ({
      time,
      temp: hourly.temperature_2m?.[from + i] ?? null,
      rain: hourly.precipitation_probability?.[from + i] ?? null,
      code: hourly.weathercode?.[from + i] ?? null,
    }));

    res.json(
      buildResponse({
        location: { lat: Number(lat), lon: Number(lon) },
        locationLabel: process.env.WEATHER_LOCATION_LABEL || null,
        current: {
          temp: current.temperature_2m ?? null,
          feelsLike: current.apparent_temperature ?? null,
          code: current.weathercode ?? null,
          wind: current.windspeed_10m ?? null,
          humidity: current.relative_humidity_2m ?? null,
          time: current.time ?? null,
        },
        sun: { sunrise: daily.sunrise?.[0] ?? null, sunset: daily.sunset?.[0] ?? null },
        forecast,
        hourly: nextHours,
      }),
    );
  } catch (e) {
    res.json(buildError(e?.message || 'weather fetch failed'));
  }
});

export default router;
