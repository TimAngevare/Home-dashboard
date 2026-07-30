import { HardDrive } from 'lucide-react';
import { useWidget } from '../../hooks/useWidget.js';

function formatGB(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(0);
}

export default function StorageWidget() {
  const { data, error } = useWidget('storage', '/api/storage', 30);

  if (error || !data) {
    return <div className="shimmer h-full w-full rounded-2xl" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {(data.drives || []).map((d) => (
        <div key={d.mount} className="storage-row">
          <div className="storage-row-header">
            <span className="flex items-center gap-2" style={{ color: 'var(--fg2)' }}>
              <HardDrive size={14} />
              {d.label}
            </span>
            <span className="font-mono text-xs" style={{ color: 'var(--fg3)' }}>
              {formatGB(d.usedBytes)} / {formatGB(d.totalBytes)} GB
            </span>
          </div>
          <div className="storage-bar">
            <div
              className={`storage-bar-fill ${d.usedPct >= 90 ? 'storage-bar-fill-warn' : ''}`}
              style={{ width: `${Math.min(100, d.usedPct)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
