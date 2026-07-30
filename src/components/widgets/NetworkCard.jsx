import { ArrowDown, ArrowUp, HardDrive } from 'lucide-react';
import { Area, AreaChart, Line, ResponsiveContainer } from 'recharts';
import { useNetworkSeries } from '../../hooks/useNetworkSeries.js';

function formatBytes(b) {
  if (!b || b < 0) return '0B';
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(0)}MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)}GB`;
}

export default function NetworkCard() {
  const { data, error, series } = useNetworkSeries();

  if (error) {
    return (
      <div className="card card-enter" style={{ padding: 20, textAlign: 'center', color: 'var(--warn)' }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="shimmer h-full w-full" style={{ borderRadius: 'var(--r)' }} />;
  }

  return (
    <div className="card card-enter system-card-body" style={{ paddingTop: 12 }}>
      <div className="glass-card-header" style={{ padding: '0 0 4px' }}>
        <span className="glass-card-header-title">Network</span>
      </div>

      <div className="network-columns">
        <div>
          <div className="network-stat-value" style={{ color: 'var(--accent)' }}>{data.downMbps.toFixed(1)}</div>
          <div className="network-stat-label"><ArrowDown size={11} /> Down Mbps</div>
        </div>
        <div>
          <div className="network-stat-value" style={{ color: 'var(--warm)' }}>{data.upMbps.toFixed(1)}</div>
          <div className="network-stat-label"><ArrowUp size={11} /> Up Mbps</div>
        </div>
        <div className="network-totals">
          <div className="flex items-center justify-end gap-1">
            <HardDrive size={11} />
            ↓{formatBytes(data.totals.rxBytes)} · ↑{formatBytes(data.totals.txBytes)}
          </div>
        </div>
      </div>

      <div className="network-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="sysDownFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="down"
              stroke="var(--accent)"
              strokeWidth={1.6}
              fill="url(#sysDownFill)"
              isAnimationActive={false}
            />
            <Line type="monotone" dataKey="up" stroke="var(--warm)" strokeWidth={1.4} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
