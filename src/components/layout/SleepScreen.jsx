import { useEffect, useState } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { CalendarDays, Sunrise } from 'lucide-react';
import { useWidget } from '../../hooks/useWidget.js';

const DIM_PRESETS = [8, 20, 40];

export default function SleepScreen({ dim, setDim, wake }) {
  const [now, setNow] = useState(() => new Date());
  const { data: calendar } = useWidget('calendar', '/api/calendar', 300);
  const { data: media } = useWidget('media', '/api/media', 5);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const next = calendar?.events?.[0];
  const nowPlaying = media?.title ? `${media.title}${media.artist ? ` — ${media.artist}` : ''}` : null;

  return (
    <div className="sleep-screen">
      <div className="sleep-dim">
        <div className="sleep-clock">{format(now, 'HH:mm')}</div>
        <div className="sleep-date">{format(now, 'EEEE, d MMMM')}</div>
        {next && (
          <div className="sleep-event-pill">
            <CalendarDays size={16} className="sleep-event-icon" />
            <span>{isToday(parseISO(next.start)) ? 'Next' : 'First tomorrow'}</span>
            <span className="sleep-event-time">
              {next.allDay ? 'All day' : format(parseISO(next.start), 'HH:mm')}
            </span>
            <span>{next.title}</span>
          </div>
        )}
        {nowPlaying && <div className="sleep-now-playing">♪ {nowPlaying}</div>}
      </div>

      <div className="sleep-controls">
        <span className="sleep-controls-label">Brightness</span>
        {DIM_PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            className={`sleep-dim-pill ${dim === d ? 'sleep-dim-pill-active' : ''}`}
            onClick={() => setDim(d)}
          >
            {d}%
          </button>
        ))}
        <button type="button" className="sleep-wake-pill" onClick={wake}>
          <Sunrise size={14} />
          Wake
        </button>
      </div>
    </div>
  );
}
