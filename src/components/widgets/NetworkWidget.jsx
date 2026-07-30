import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowDown, ArrowUp, Users, HardDrive } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from '../layout/GlassCard.jsx';
import { useWidget } from '../../hooks/useWidget.js';

const MAX_POINTS = 60;

export default function NetworkWidget({ index }) {
  const { data, isLoading, error, lastUpdated, refreshInterval } = useWidget(
    'network',
    '/api/network',
    5,
  );
  const status = error ? 'error' : isLoading ? 'loading' : 'ok';
  const [series, setSeries] = useState([]);
  const lastTs = useRef(0);

  useEffect(() => {
    if (!data || data.ts === lastTs.current) return;
    lastTs.current = data.ts;
    setSeries((prev) => {
      const next = [
        ...prev,
        { ts: data.ts, down: Number(data.downMbps.toFixed(2)), up: Number(data.upMbps.toFixed(2)) },
      ];
      if (next.length > MAX_POINTS) next.splice(0, next.length - MAX_POINTS);
      return next;
    });
  }, [data]);

  return (
    <GlassCard
      title="Network"
      icon={<Activity size={16} className="text-[var(--accent-teal)]" />}
      refreshInterval={refreshInterval}
      lastUpdated={lastUpdated}
      status={status}
      error={error}
      index={index}
    >
      {data ? (
        <div className="h-full grid grid-cols-[260px_1fr] gap-5">
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <Stat
                icon={<ArrowDown size={14} className="text-[var(--accent-teal)]" />}
                label="Download"
                value={`${data.downMbps.toFixed(1)}`}
                unit="Mbps"
                color="var(--accent-teal)"
              />
              <Stat
                icon={<ArrowUp size={14} className="text-[var(--accent-amber)]" />}
                label="Upload"
                value={`${data.upMbps.toFixed(1)}`}
                unit="Mbps"
                color="var(--accent-amber)"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-3">
              <span className="flex items-center gap-1">
                <Users size={12} /> <span className="font-mono">{data.clients}</span> clients
              </span>
              <span className="flex items-center gap-1">
                <HardDrive size={12} />
                <span className="font-mono">
                  ↓{formatBytes(data.totals.rxBytes)} · ↑{formatBytes(data.totals.txBytes)}
                </span>
              </span>
            </div>
            {data.router && (
              <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                router load {data.router.load1?.toFixed(2) ?? '—'} · up {formatUptime(data.router.uptimeSec)}
              </div>
            )}
          </div>

          <div className="min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="downFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="upFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5a623" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,12,18,0.85)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  labelFormatter={() => ''}
                  formatter={(v, k) => [`${v} Mbps`, k]}
                />
                <Area
                  type="monotone"
                  dataKey="down"
                  stroke="#00d4aa"
                  strokeWidth={1.6}
                  fill="url(#downFill)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="up"
                  stroke="#f5a623"
                  strokeWidth={1.6}
                  fill="url(#upFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <Skeleton />
      )}
    </GlassCard>
  );
}

function Stat({ icon, label, value, unit, color }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {icon}
        {label}
      </div>
      <div className="font-mono text-xl mt-0.5" style={{ color }}>
        {value}
        <span className="ml-1 text-xs text-[var(--text-secondary)]">{unit}</span>
      </div>
    </div>
  );
}

function formatUptime(sec) {
  if (!sec) return '—';
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

function formatBytes(b) {
  if (!b || b < 0) return '0B';
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(0)}MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)}GB`;
}

function Skeleton() {
  return (
    <div className="h-full grid grid-cols-[260px_1fr] gap-5">
      <div className="flex flex-col gap-3">
        <div className="shimmer h-12 w-32 rounded" />
        <div className="shimmer h-12 w-32 rounded" />
      </div>
      <div className="shimmer h-full w-full rounded" />
    </div>
  );
}
