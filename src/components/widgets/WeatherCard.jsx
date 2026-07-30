import { Wind, Droplets, Sunrise, Sunset, Umbrella } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useWidget } from '../../hooks/useWidget.js';
import { wmo, rainAdvice } from '../../lib/weather.js';

export default function WeatherCard() {
  const { data, isLoading, error } = useWidget('weather', '/api/weather', 600);

  if (error) {
    return (
      <div className="card card-enter weather-card">
        <span className="text-xs" style={{ color: 'var(--warn)' }}>{error}</span>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="shimmer" style={{ height: '100%', borderRadius: 'var(--r)' }} />;
  }

  const current = data.current;
  const { label, Icon } = wmo(current?.code);
  const advice = rainAdvice(data.hourly);
  const maxRain = Math.max(1, ...(data.hourly || []).map((h) => h.rain ?? 0));

  return (
    <div className="card card-enter weather-card">
      <div className="weather-card-top">
        <Icon size={60} className="weather-card-icon" />
        <div>
          <span className="weather-card-temp">{Math.round(current.temp)}°</span>
          <span className="weather-card-condition">
            {label} · feels {Math.round(current.feelsLike ?? current.temp)}°
          </span>
        </div>

        <div className="weather-metric-grid" style={{ marginLeft: 'auto' }}>
          <div className="weather-metric">
            <Wind size={15} className="weather-metric-icon" /> {Math.round(current.wind)} km/h
          </div>
          <div className="weather-metric">
            <Droplets size={15} className="weather-metric-icon" /> {current.humidity}%
          </div>
          <div className="weather-metric">
            <Sunrise size={15} className="weather-metric-icon weather-metric-icon-warm" />
            {data.sun?.sunrise ? format(parseISO(data.sun.sunrise), 'HH:mm') : '—'}
          </div>
          <div className="weather-metric">
            <Sunset size={15} className="weather-metric-icon weather-metric-icon-warm" />
            {data.sun?.sunset ? format(parseISO(data.sun.sunset), 'HH:mm') : '—'}
          </div>
        </div>
      </div>

      {advice && (
        <div className="weather-advice">
          <Umbrella size={16} className="weather-advice-icon" />
          {advice}
        </div>
      )}

      {data.hourly?.length > 0 && (
        <div className="hour-strip">
          {data.hourly.map((h) => {
            const rain = h.rain ?? 0;
            return (
              <div key={h.time} className={`hour-col ${rain >= 20 ? 'hour-col-rain' : ''}`}>
                <span className="hour-col-temp">{Math.round(h.temp)}°</span>
                <div className="hour-col-bar-track">
                  <div
                    className="hour-col-bar"
                    style={{
                      height: `${Math.max(6, (rain / maxRain) * 100)}%`,
                      opacity: 0.35 + (rain / 100) * 0.65,
                    }}
                  />
                </div>
                <span className="hour-col-rain-pct">{rain}%</span>
                <span className="hour-col-hour">{format(parseISO(h.time), 'HH')}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
