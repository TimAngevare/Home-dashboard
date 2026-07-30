import { useWidget } from '../../hooks/useWidget.js';
import StorageWidget from './StorageWidget.jsx';

function formatUptime(sec) {
  if (!sec) return '—';
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((sec % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function formatGB(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export default function PiCard() {
  const { data, error } = useWidget('system', '/api/system', 5);
  const { data: network } = useWidget('network', '/api/network', 5);

  if (error || !data) {
    return <div className="shimmer h-full w-full" style={{ borderRadius: 'var(--r)' }} />;
  }

  const tempHot = data.cpuTempC != null && data.cpuTempC >= 75;
  const memPct = data.memTotalBytes ? Math.round((data.memUsedBytes / data.memTotalBytes) * 100) : null;

  return (
    <div className="card card-enter system-card-body" style={{ paddingTop: 12 }}>
      <div className="glass-card-header" style={{ padding: '0 0 4px' }}>
        <span className="glass-card-header-title">Raspberry Pi 4</span>
        <span className="pi-uptime">up {formatUptime(data.uptimeSec)}</span>
      </div>

      <div className="stat-grid">
        <Stat label="CPU Temp" value={data.cpuTempC != null ? `${data.cpuTempC.toFixed(1)}°` : '—'} warn={tempHot} />
        <Stat label="Load 1m" value={data.loadavg?.[0]?.toFixed(2) ?? '—'} />
        <Stat label="Memory" value={memPct != null ? `${memPct}% · ${formatGB(data.memUsedBytes)}GB` : '—'} />
        <Stat label="Clients" value={network?.clients ?? '—'} />
      </div>

      <StorageWidget />
    </div>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div className={`stat-tile ${warn ? 'stat-tile-warn' : ''}`}>
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{value}</div>
    </div>
  );
}
