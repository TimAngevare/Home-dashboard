import { CalendarDays } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import GlassCard from '../layout/GlassCard.jsx';
import { useWidget } from '../../hooks/useWidget.js';

export default function CalendarWidget({ index }) {
  const { data, isLoading, error, lastUpdated, refreshInterval } = useWidget(
    'calendar',
    '/api/calendar',
    300,
  );
  const status = error ? 'error' : isLoading ? 'loading' : 'ok';

  const events = data?.events || [];
  const today = events.filter((e) => isToday(parseISO(e.start)));
  const upcoming = events.filter((e) => !isToday(parseISO(e.start)));
  const visible = [...today, ...upcoming].slice(0, 8);
  const overflow = events.length - visible.length;
  const next = events[0];

  return (
    <GlassCard
      title="Calendar"
      icon={<CalendarDays size={16} className="text-[var(--accent-purple)]" />}
      refreshInterval={refreshInterval}
      lastUpdated={lastUpdated}
      status={status}
      error={error}
      index={index}
      bodyClassName="overflow-y-auto"
    >
      {data ? (
        events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {today.length > 0 && (
              <Section
                heading="Today"
                items={today}
                nextId={next?.id}
              />
            )}
            {upcoming.length > 0 && (
              <Section
                heading="Upcoming"
                items={upcoming.slice(0, Math.max(0, 8 - today.length))}
                nextId={next?.id}
              />
            )}
            {overflow > 0 && (
              <div className="text-[10px] text-[var(--text-muted)] text-center">
                +{overflow} more
              </div>
            )}
          </div>
        )
      ) : (
        <Skeleton />
      )}
    </GlassCard>
  );
}

function Section({ heading, items, nextId }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{heading}</div>
      <div className="flex flex-col gap-1">
        {items.map((e) => (
          <EventRow key={e.id} event={e} highlight={e.id === nextId} />
        ))}
      </div>
    </div>
  );
}

function EventRow({ event, highlight }) {
  const start = parseISO(event.start);
  const time = event.allDay ? 'All day' : format(start, 'HH:mm');
  return (
    <div
      className={`event-row ${highlight ? 'event-row-next' : ''}`}
      style={highlight ? { borderLeftColor: event.color } : undefined}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: event.color }}
        aria-hidden
      />
      <span className="font-mono text-[11px] text-[var(--text-secondary)] w-12 shrink-0">{time}</span>
      <span className="text-xs text-[var(--text-primary)] truncate flex-1">{event.title}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] gap-2">
      <CalendarDays size={28} />
      <span className="text-xs">No meetings today</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="shimmer h-6 w-full rounded" />
      ))}
    </div>
  );
}
