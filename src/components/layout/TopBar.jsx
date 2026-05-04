import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function TopBar() {
  const [now, setNow] = useState(() => new Date());
  const [host, setHost] = useState({ hostname: '', ips: [] });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/health');
        const j = await res.json();
        if (!cancelled) setHost({ hostname: j.hostname || '', ips: j.ips || [] });
      } catch {
        // ignore
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const ip = host.ips[0] || '—';
  return (
    <div className="top-bar">
      <div className="top-bar-cell text-left">
        <span className="font-mono text-base text-[var(--text-primary)]">{format(now, 'HH:mm:ss')}</span>
      </div>
      <div className="top-bar-cell text-center">
        <span className="font-display text-sm text-[var(--text-secondary)] uppercase tracking-[0.18em]">
          {format(now, 'EEEE, d MMMM yyyy')}
        </span>
      </div>
      <div className="top-bar-cell text-right font-mono text-xs text-[var(--text-muted)]">
        {host.hostname ? `${host.hostname} · ${ip}` : ip}
      </div>
    </div>
  );
}
