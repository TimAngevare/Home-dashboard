import { ArrowDown, ArrowUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useNetworkSeries } from '../../hooks/useNetworkSeries.js';
import { useWidget } from '../../hooks/useWidget.js';

export default function NetworkPiMini() {
  const { data, series } = useNetworkSeries();
  const { data: system } = useWidget('system', '/api/system', 5);

  if (!data) return <div className="shimmer h-full w-full" style={{ borderRadius: 'var(--r)' }} />;

  return (
    <div className="card card-enter mini-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <div style={{ flexShrink: 0 }}>
        <div className="network-stat-value" style={{ color: 'var(--accent)' }}>
          <span className="network-stat-label" style={{ display: 'inline-flex' }}>
            <ArrowDown size={12} />
          </span>{' '}
          {data.downMbps.toFixed(1)}
        </div>
        <div className="network-stat-value" style={{ color: 'var(--warm)', marginTop: 2 }}>
          <ArrowUp size={12} style={{ display: 'inline', marginRight: 4 }} />
          {data.upMbps.toFixed(1)}
        </div>
      </div>

      <div style={{ width: 160, height: 60, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="homeSparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="down"
              stroke="var(--accent)"
              strokeWidth={1.6}
              fill="url(#homeSparkFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
        <div className="network-stat-value" style={{ fontSize: 12, color: 'var(--fg2)' }}>
          {system?.cpuTempC != null ? `${system.cpuTempC.toFixed(0)}°C` : '—'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 2 }}>{data.clients} clients</div>
      </div>
    </div>
  );
}
