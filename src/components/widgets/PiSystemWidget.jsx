import { Cpu, Thermometer, MemoryStick, Clock } from 'lucide-react';
import { useWidget } from '../../hooks/useWidget.js';

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

export default function PiSystemWidget() {
  const { data, error } = useWidget('system', '/api/system', 5);

  if (error || !data) {
    return <div className="shimmer h-full w-full rounded-2xl" />;
  }

  const tempHot = data.cpuTempC != null && data.cpuTempC >= 75;
  const memPct = data.memTotalBytes ? Math.round((data.memUsedBytes / data.memTotalBytes) * 100) : null;

  return (
    <div className="stat-grid">
      <Stat
        icon={<Thermometer size={18} />}
        label="CPU Temp"
        value={data.cpuTempC != null ? `${data.cpuTempC.toFixed(1)}°C` : '—'}
        warn={tempHot}
      />
      <Stat icon={<Cpu size={18} />} label="Load (1m)" value={data.loadavg?.[0]?.toFixed(2) ?? '—'} />
      <Stat
        icon={<MemoryStick size={18} />}
        label="Memory"
        value={memPct != null ? `${memPct}% · ${formatGB(data.memUsedBytes)}/${formatGB(data.memTotalBytes)}GB` : '—'}
      />
      <Stat icon={<Clock size={18} />} label="Uptime" value={formatUptime(data.uptimeSec)} />
    </div>
  );
}

function Stat({ icon, label, value, warn }) {
  return (
    <div className={`stat-tile ${warn ? 'stat-tile-warn' : ''}`}>
      <div className="stat-tile-icon">{icon}</div>
      <div className="stat-tile-body">
        <div className="stat-tile-label">{label}</div>
        <div className="stat-tile-value">{value}</div>
      </div>
    </div>
  );
}
