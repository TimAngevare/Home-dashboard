import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

export default function GlassCard({
  title,
  icon,
  refreshInterval,
  lastUpdated,
  status = 'ok',
  error,
  index = 0,
  className = '',
  bodyClassName = '',
  children,
}) {
  const isError = status === 'error' || !!error;
  const isLoading = status === 'loading';
  const animationDelay = `${Math.min(index, 8) * 50}ms`;

  return (
    <div
      className={`glass-card animate-fade-in-up flex flex-col overflow-hidden ${
        isError ? 'glass-card-error' : ''
      } ${className}`}
      style={{ animationDelay }}
    >
      <header className="glass-card-header">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          {icon}
          <span className="font-display text-sm uppercase tracking-[0.14em]">{title}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          {isLoading && <span className="pulse-dot" />}
          {refreshInterval ? <span>{formatRefresh(refreshInterval)}</span> : null}
        </div>
      </header>

      <div className={`flex-1 min-h-0 p-4 pt-3 ${bodyClassName}`}>
        {isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-[var(--accent-red)]">
            <AlertTriangle size={24} />
            <span className="text-xs text-[var(--text-secondary)] max-w-[80%] truncate">
              {error || 'Data unavailable'}
            </span>
          </div>
        ) : (
          children
        )}
      </div>

      <footer className="glass-card-footer">
        <span>
          {lastUpdated
            ? `Updated ${formatDistanceToNowStrict(new Date(lastUpdated), { addSuffix: true })}`
            : isLoading
              ? 'Loading…'
              : '—'}
        </span>
        {isError ? <span className="text-[var(--accent-red)]">offline</span> : null}
      </footer>
    </div>
  );
}

function formatRefresh(s) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}
