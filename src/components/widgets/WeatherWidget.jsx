import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow,
  Cloudy, Sun, Snowflake, Wind, Droplets, CloudSun,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import GlassCard from '../layout/GlassCard.jsx';
import { useWidget } from '../../hooks/useWidget.js';

function wmo(code) {
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

export default function WeatherWidget({ index }) {
  const { data, isLoading, error, lastUpdated, refreshInterval } = useWidget(
    'weather',
    '/api/weather',
    600,
  );

  const status = error ? 'error' : isLoading ? 'loading' : 'ok';
  const current = data?.current;
  const cur = wmo(current?.code);

  return (
    <GlassCard
      title="Weather"
      icon={<cur.Icon size={16} className="text-[var(--accent-blue)]" />}
      refreshInterval={refreshInterval}
      lastUpdated={lastUpdated}
      status={status}
      error={error}
      index={index}
    >
      {data && current ? (
        <div className="h-full flex flex-col">
          <div className="flex items-start gap-4">
            <div className="font-mono text-2xl text-[var(--text-primary)] leading-none">
              {Math.round(current.temp)}°
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-sm text-[var(--text-secondary)]">{cur.label}</span>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Wind size={12} /> {Math.round(current.wind)} km/h
                </span>
                <span className="flex items-center gap-1">
                  <Droplets size={12} /> {current.humidity}%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-auto flex justify-between gap-2 pt-3">
            {(data.forecast || []).slice(0, 4).map((f) => {
              const w = wmo(f.code);
              return (
                <div
                  key={f.date}
                  className="flex-1 flex flex-col items-center gap-1 rounded-lg py-2 bg-[rgba(255,255,255,0.02)]"
                >
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    {format(parseISO(f.date), 'EEE')}
                  </span>
                  <w.Icon size={18} className="text-[var(--accent-blue)]" />
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {Math.round(f.tmax)}° / {Math.round(f.tmin)}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Skeleton />
      )}
    </GlassCard>
  );
}

function Skeleton() {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="shimmer h-12 w-32 rounded" />
      <div className="shimmer h-4 w-40 rounded" />
      <div className="mt-auto flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer flex-1 h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
