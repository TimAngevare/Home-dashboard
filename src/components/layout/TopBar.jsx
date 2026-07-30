import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Sun, Moon, BedDouble, Sunset } from 'lucide-react';
import { useWidget } from '../../hooks/useWidget.js';
import { wmo } from '../../lib/weather.js';

const MODES = [
  { id: 'light', Icon: Sun },
  { id: 'dark', Icon: Moon },
  { id: 'sleep', Icon: BedDouble },
];

export default function TopBar({ mode, setMode, auto, toggleAuto, sunsetLabel }) {
  const [now, setNow] = useState(() => new Date());
  const { data: weather } = useWidget('weather', '/api/weather', 600);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const current = weather?.current;
  const { Icon: WeatherIcon } = wmo(current?.code);

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <span className="top-bar-clock">{format(now, 'HH:mm')}</span>
        <span className="top-bar-date">{format(now, 'EEE, d MMM')}</span>
      </div>

      <div className="top-bar-right">
        {current && (
          <div className="weather-pill">
            <WeatherIcon size={15} />
            <span className="weather-pill-temp">{Math.round(current.temp)}°</span>
            {weather?.locationLabel && (
              <span className="weather-pill-location">{weather.locationLabel}</span>
            )}
          </div>
        )}

        <div className="mode-switch">
          {MODES.map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              className={`mode-pill ${mode === id ? 'mode-pill-active' : ''}`}
              onClick={() => setMode(id)}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`auto-chip ${auto ? 'auto-chip-active' : ''}`}
          onClick={toggleAuto}
        >
          <Sunset size={14} />
          Auto
          {sunsetLabel && <span className="auto-chip-time">{sunsetLabel}</span>}
        </button>
      </div>
    </div>
  );
}
