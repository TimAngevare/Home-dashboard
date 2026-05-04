import { Lightbulb } from 'lucide-react';
import GlassCard from '../layout/GlassCard.jsx';
import { useWidget } from '../../hooks/useWidget.js';

export default function LightsWidget({ index }) {
  const { data, isLoading, error, lastUpdated, refreshInterval } = useWidget(
    'lights',
    '/api/lights',
    30,
  );
  const status = error ? 'error' : isLoading ? 'loading' : 'ok';
  const groups = data?.groups || [];

  return (
    <GlassCard
      title="Lights"
      icon={<Lightbulb size={16} className="text-[var(--accent-amber)]" />}
      refreshInterval={refreshInterval}
      lastUpdated={lastUpdated}
      status={status}
      error={error}
      index={index}
      bodyClassName="overflow-y-auto"
    >
      {groups.length ? (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-[var(--text-muted)]">
            <span className="font-mono text-[var(--accent-amber)]">{data.on}</span>
            <span> / {data.total} on</span>
          </div>
          {groups.map((g) => (
            <div key={g.area} className="flex flex-col gap-1">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {prettyArea(g.area)}
              </div>
              <div className="flex flex-col gap-1">
                {g.items.map((l) => (
                  <LightRow key={l.entity_id} light={l} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Skeleton />
      )}
    </GlassCard>
  );
}

function LightRow({ light }) {
  const on = light.state === 'on';
  const brightness = light.brightness ?? (on ? 200 : 0);
  const intensity = Math.max(0.25, Math.min(1, brightness / 255));
  return (
    <div className="flex items-center gap-2">
      <span
        className={`light-dot ${on ? 'light-dot-on' : 'light-dot-off'}`}
        style={on ? { opacity: intensity } : undefined}
      />
      <span className="text-xs text-[var(--text-secondary)] truncate flex-1 capitalize">
        {light.name}
      </span>
      {on && light.brightness != null ? (
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {Math.round((light.brightness / 255) * 100)}%
        </span>
      ) : null}
    </div>
  );
}

function prettyArea(a) {
  return String(a || 'Other').replace(/_/g, ' ');
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="shimmer h-5 w-full rounded" />
      ))}
    </div>
  );
}
