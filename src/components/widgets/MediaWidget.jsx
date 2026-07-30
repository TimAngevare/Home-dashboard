import { useEffect, useState } from 'react';
import { Music4, Pause, Play, SkipBack, SkipForward, Volume1, Volume2, AlertTriangle } from 'lucide-react';
import { useWidget, useAction } from '../../hooks/useWidget.js';

function formatTime(sec) {
  if (sec == null || Number.isNaN(sec)) return '0:00';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function MediaWidget() {
  const { data, isLoading, error } = useWidget('media', '/api/media', 5);
  const { act, isActing } = useAction(['media']);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-[var(--accent-red)]">
        <AlertTriangle size={28} />
        <span className="text-sm text-[var(--text-secondary)]">{error}</span>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="shimmer w-40 h-40 rounded-2xl" />
        <div className="shimmer w-56 h-4 rounded" />
      </div>
    );
  }

  const playing = data.state === 'playing';
  const hasTrack = !!data.title;

  let position = data.positionSec ?? 0;
  if (playing && data.positionUpdatedAt) {
    const elapsed = (now - new Date(data.positionUpdatedAt).getTime()) / 1000;
    position = Math.min(data.durationSec ?? position + elapsed, position + Math.max(0, elapsed));
  }
  const duration = data.durationSec ?? 0;
  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div className="media-widget">
      <div className="media-art">
        {data.image ? (
          <img src={data.image} alt="" />
        ) : (
          <Music4 size={48} className="text-[var(--text-muted)]" />
        )}
      </div>

      <div className="media-info">
        {hasTrack ? (
          <>
            <div className="media-title">{data.title}</div>
            <div className="media-artist">
              {data.artist}
              {data.album ? ` — ${data.album}` : ''}
            </div>
          </>
        ) : (
          <div className="media-artist">Nothing playing</div>
        )}

        {duration > 0 && (
          <div className="media-progress">
            <div className="media-progress-bar">
              <div className="media-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="media-progress-times">
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        <div className="media-controls">
          <button
            type="button"
            className="media-btn"
            disabled={!data.controls?.previous || isActing}
            onClick={() => act('/api/media', { action: 'previous' })}
          >
            <SkipBack size={22} />
          </button>
          <button
            type="button"
            className="media-btn media-btn-primary"
            disabled={!data.controls?.playPause || isActing}
            onClick={() => act('/api/media', { action: 'play_pause' })}
          >
            {playing ? <Pause size={26} /> : <Play size={26} />}
          </button>
          <button
            type="button"
            className="media-btn"
            disabled={!data.controls?.next || isActing}
            onClick={() => act('/api/media', { action: 'next' })}
          >
            <SkipForward size={22} />
          </button>
        </div>

        {data.controls?.volume && data.volume != null && (
          <div className="media-volume">
            <Volume1 size={16} className="text-[var(--text-muted)]" />
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={Math.round(data.volume * 100)}
              onChange={(e) => act('/api/media', { action: 'volume', value: Number(e.target.value) / 100 })}
            />
            <Volume2 size={16} className="text-[var(--text-muted)]" />
          </div>
        )}
      </div>
    </div>
  );
}
