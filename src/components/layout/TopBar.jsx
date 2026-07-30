import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react';
import { useWidget } from '../../hooks/useWidget.js';

function wmoIcon(code) {
  const c = Number(code);
  if (c === 0) return Sun;
  if (c === 1 || c === 2) return CloudSun;
  if (c >= 51 && c <= 67) return CloudRain;
  if (c >= 71 && c <= 86) return CloudSnow;
  return Cloud;
}

export default function TopBar() {
  const [now, setNow] = useState(() => new Date());
  const { data: weather } = useWidget('weather', '/api/weather', 600);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const current = weather?.current;
  const WeatherIcon = wmoIcon(current?.code);

  return (
    <div className="top-bar">
      <div className="top-bar-cell text-left">
        <span className="font-mono text-base text-[var(--text-primary)]">{format(now, 'HH:mm')}</span>
      </div>
      <div className="top-bar-cell text-center">
        <span className="font-display text-xs text-[var(--text-secondary)] uppercase tracking-[0.12em]">
          {format(now, 'EEE, d MMM')}
        </span>
      </div>
      <div className="top-bar-cell text-right">
        {current ? (
          <span className="flex items-center gap-1.5 font-mono text-sm text-[var(--text-secondary)]">
            <WeatherIcon size={15} className="text-[var(--accent-blue)]" />
            {Math.round(current.temp)}°
          </span>
        ) : null}
      </div>
    </div>
  );
}
