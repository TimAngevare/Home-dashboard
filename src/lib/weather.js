import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow,
  Cloudy, Sun, Snowflake, CloudSun,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function wmo(code) {
  const c = Number(code);
  if (c === 0) return { label: 'Clear', Icon: Sun };
  if (c === 1 || c === 2) return { label: 'Mostly clear', Icon: CloudSun };
  if (c === 3) return { label: 'Overcast', Icon: Cloudy };
  if (c >= 45 && c <= 48) return { label: 'Fog', Icon: CloudFog };
  if (c >= 51 && c <= 57) return { label: 'Drizzle', Icon: CloudDrizzle };
  if (c >= 61 && c <= 67) return { label: 'Rain', Icon: CloudRain };
  if (c >= 71 && c <= 77) return { label: 'Snow', Icon: CloudSnow };
  if (c >= 80 && c <= 82) return { label: 'Showers', Icon: CloudRain };
  if (c >= 85 && c <= 86) return { label: 'Snow showers', Icon: Snowflake };
  if (c >= 95) return { label: 'Thunderstorm', Icon: CloudLightning };
  return { label: '—', Icon: Cloud };
}

/** One-line plain-language rain advice derived from the next 12 hours. */
export function rainAdvice(hourly) {
  if (!hourly || !hourly.length) return null;
  const idx = hourly.findIndex((h) => (h.rain ?? 0) >= 40);
  if (idx === -1) return 'Dry for the next 12 hours';
  if (idx === 0) return 'Rain likely now';
  return `Dry until ${format(parseISO(hourly[idx].time), 'HH:00')}, rain likely after`;
}
