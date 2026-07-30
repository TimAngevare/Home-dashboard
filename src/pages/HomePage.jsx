import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Wind } from 'lucide-react';
import { useWidget, useToggleTodo } from '../hooks/useWidget.js';
import { wmo } from '../lib/weather.js';
import { sortByPriority, PRIORITY_COLORS } from '../lib/todos.js';
import NowPlayingHero from '../components/widgets/NowPlayingHero.jsx';
import LightRow from '../components/widgets/LightRow.jsx';
import { N8nMini } from '../components/widgets/N8nWidget.jsx';
import NetworkPiMini from '../components/widgets/NetworkPiMini.jsx';

function greeting(now) {
  const h = now.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function HeroCard() {
  const [now, setNow] = useState(() => new Date());
  const { data: weather } = useWidget('weather', '/api/weather', 600);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const current = weather?.current;
  const { label, Icon } = wmo(current?.code);

  return (
    <div className="card card-enter hero-card">
      <div>
        <div className="hero-greeting">{greeting(now)}</div>
        <div className="hero-clock">{format(now, 'HH:mm')}</div>
      </div>
      {current && (
        <div className="hero-weather">
          <div className="hero-weather-text">
            <div className="hero-weather-temp">{Math.round(current.temp)}°</div>
            <div className="hero-weather-condition">{label}</div>
            <div className="hero-weather-meta">
              feels {Math.round(current.feelsLike ?? current.temp)}° · {Math.round(current.wind)} km/h
            </div>
          </div>
          <Icon size={54} className="hero-weather-icon" />
        </div>
      )}
    </div>
  );
}

function TodayCard() {
  const { data } = useWidget('todos', '/api/todos', 300);
  const toggle = useToggleTodo();

  const items = data?.items || [];
  const done = items.filter((t) => t.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const openTop3 = sortByPriority(items.filter((t) => !t.done)).slice(0, 3);

  return (
    <div className="card card-enter" style={{ padding: '14px 16px' }}>
      <div className="today-header">
        <span className="glass-card-header-title">Today</span>
        <span className="font-mono text-xs" style={{ color: 'var(--fg2)' }}>
          {done} / {total} done
        </span>
      </div>
      <div className="today-progress">
        <div className="today-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div>
        {openTop3.map((t) => (
          <button key={t.id} type="button" className="today-row" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }} onClick={() => toggle(t)}>
            <span className="today-check" />
            <span className="today-row-title">{t.title}</span>
            {t.priority && (
              <span
                style={{ width: 6, height: 6, borderRadius: 999, background: PRIORITY_COLORS[t.priority] || 'var(--fg3)', flexShrink: 0 }}
              />
            )}
            {t.due && <span className="today-row-due">{format(new Date(t.due), 'd MMM')}</span>}
          </button>
        ))}
        {openTop3.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fg3)', fontSize: 13, padding: '12px 0' }}>All clear</div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="page home-grid">
      <div className="home-col-left">
        <HeroCard />
        <NowPlayingHero />
        <LightRow />
      </div>
      <div className="home-col-right">
        <TodayCard />
        <N8nMini />
        <NetworkPiMini />
      </div>
    </div>
  );
}
