import { CalendarDays } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { useWidget } from '../../hooks/useWidget.js';

export default function CalendarWidget() {
  const { data, isLoading, error } = useWidget('calendar', '/api/calendar', 300);

  if (error) {
    return (
      <div className="card card-enter agenda-card">
        <span className="text-xs" style={{ color: 'var(--warn)' }}>{error}</span>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="shimmer" style={{ height: '100%', borderRadius: 'var(--r)' }} />;
  }

  const events = data.events || [];
  const today = events.filter((e) => isToday(parseISO(e.start)));
  const later = events.filter((e) => !isToday(parseISO(e.start)));
  const next = events[0];

  return (
    <div className="card card-enter agenda-card">
      <div className="agenda-card-header">
        <span className="glass-card-header-title">Agenda</span>
        <span className="agenda-card-count">
          {today.length} today · {later.length} later
        </span>
      </div>

      {events.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-2" style={{ color: 'var(--fg3)' }}>
          <CalendarDays size={28} />
          <span className="text-xs">No meetings today</span>
        </div>
      ) : (
        <div className="agenda-events">
          {events.slice(0, 12).map((e) => (
            <div key={e.id} className={`agenda-event ${e.id === next?.id ? 'agenda-event-next' : ''}`}>
              <span className="agenda-event-time">{e.allDay ? 'All day' : format(parseISO(e.start), 'HH:mm')}</span>
              <span className="agenda-event-title">{e.title}</span>
              <span className="agenda-event-calendar">{e.calendar}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
