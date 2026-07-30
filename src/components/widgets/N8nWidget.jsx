import { Workflow, PlugZap } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useWidget } from '../../hooks/useWidget.js';

function agoLabel(sec) {
  if (sec == null) return '—';
  if (sec < 60) return `${sec}s ago`;
  return `${formatDistanceToNowStrict(Date.now() - sec * 1000)} ago`;
}

export function N8nMini() {
  const { data, error } = useWidget('n8n', '/api/n8n', 60);

  if (error) return null;
  if (!data) return <div className="shimmer h-full w-full" style={{ borderRadius: 'var(--r)' }} />;

  const maxHourly = Math.max(1, ...(data.hourly || []));

  return (
    <div className="card card-enter mini-card">
      <div className="mini-card-header">
        <Workflow size={15} style={{ color: 'var(--accent2)' }} />
        <span className="mini-card-header-title">N8N</span>
        <span className="mini-card-header-meta">{agoLabel(data.lastRunAgoSec)}</span>
      </div>
      <div className="mini-card-stats">
        <span className="mini-card-stat-value" style={{ color: 'var(--fg)' }}>{data.runsToday}</span>
        <span className="mini-card-stat-value" style={{ color: 'var(--ok)' }}>
          {data.successRate != null ? `${data.successRate}%` : '—'}
        </span>
        <div className="mini-card-bars">
          {(data.hourly || []).map((v, i, arr) => (
            <div
              key={i}
              className={`mini-card-bar ${i === arr.length - 1 && data.failedToday > 0 ? 'mini-card-bar-failed' : ''}`}
              style={{ height: `${Math.max(15, (v / maxHourly) * 100)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function N8nPanel() {
  const { data, error, isLoading } = useWidget('n8n', '/api/n8n', 60);

  if (isLoading && !data) {
    return <div className="shimmer h-full w-full" style={{ borderRadius: 'var(--r)' }} />;
  }

  return (
    <div className="card card-enter system-card-body" style={{ paddingTop: 12 }}>
      <div className="glass-card-header" style={{ padding: '0 0 4px' }}>
        <div className="flex items-center gap-2" style={{ color: 'var(--fg2)' }}>
          <Workflow size={16} style={{ color: 'var(--accent2)' }} />
          <span className="glass-card-header-title">n8n automations</span>
        </div>
        {!error && data && (
          <span className="n8n-healthy-badge">
            <span className="n8n-healthy-dot" />
            {data.failedToday > 0 ? `${data.failedToday} failed` : 'healthy'}
          </span>
        )}
      </div>

      {error ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-2" style={{ color: 'var(--warn)' }}>
          <PlugZap size={24} />
          <span className="text-xs" style={{ color: 'var(--fg2)' }}>{error}</span>
        </div>
      ) : (
        <>
          <div className="n8n-stat-tiles">
            <div className="stat-tile">
              <div className="stat-tile-label">Active flows</div>
              <div className="stat-tile-value">{data.activeWorkflows}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-label">Runs today</div>
              <div className="stat-tile-value">{data.runsToday}</div>
            </div>
            <div className={`stat-tile ${data.failedToday > 0 ? 'stat-tile-warn' : ''}`}>
              <div className="stat-tile-label">Failed</div>
              <div className="stat-tile-value">{data.failedToday}</div>
            </div>
          </div>

          <div className="n8n-success-row">
            <div className="n8n-success-track">
              <div className="n8n-success-fill" style={{ width: `${data.successRate ?? 0}%` }} />
            </div>
            <span className="n8n-success-label">{data.successRate != null ? `${data.successRate}%` : '—'}</span>
          </div>

          <div className="n8n-run-list">
            {(data.recent || []).map((r) => (
              <div key={r.id} className={`n8n-run-row ${r.status === 'error' ? 'n8n-run-row-failed' : ''}`}>
                <span
                  className={`n8n-run-dot ${r.status === 'error' ? 'n8n-run-dot-error' : r.status === 'running' ? 'n8n-run-dot-running' : ''}`}
                />
                <span className="n8n-run-name">{r.name}</span>
                <span className="n8n-run-age">{r.finishedAt ? formatDistanceToNowStrict(new Date(r.finishedAt)) : '—'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
