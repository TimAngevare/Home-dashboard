import { Music4, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useMediaPlayer, formatTime } from '../../hooks/useMediaPlayer.js';

export default function NowPlayingHero() {
  const { data, isLoading, act, isActing, playing, position, duration, pct } = useMediaPlayer();

  if (isLoading || !data) {
    return (
      <div className="card card-enter now-playing-hero">
        <div className="shimmer now-playing-art" />
        <div className="shimmer" style={{ flex: 1, height: 40, borderRadius: 8 }} />
      </div>
    );
  }

  const hasTrack = !!data.title;

  return (
    <div className="card card-enter now-playing-hero">
      <div className="now-playing-art">
        {data.image ? <img src={data.image} alt="" /> : <Music4 size={40} style={{ color: 'var(--fg3)' }} />}
      </div>

      <div className="now-playing-info">
        <div className="now-playing-source">
          <span className="pulse-dot" style={{ background: 'var(--ok)', animationPlayState: playing ? 'running' : 'paused' }} />
          Spotify · Living room
        </div>
        {hasTrack ? (
          <>
            <div className="now-playing-title">{data.title}</div>
            <div className="now-playing-artist">
              {data.artist}
              {data.album ? ` · ${data.album}` : ''}
            </div>
          </>
        ) : (
          <div className="now-playing-artist">Nothing playing</div>
        )}

        {duration > 0 && (
          <>
            <div className="now-playing-progress">
              <div className="now-playing-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="now-playing-times">
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </>
        )}
      </div>

      <div className="now-playing-controls">
        <button
          type="button"
          className="player-btn"
          disabled={!data.controls?.previous || isActing}
          onClick={() => act('/api/media', { action: 'previous' })}
        >
          <SkipBack size={19} />
        </button>
        <button
          type="button"
          className="player-btn player-btn-primary"
          disabled={!data.controls?.playPause || isActing}
          onClick={() => act('/api/media', { action: 'play_pause' })}
        >
          {playing ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          type="button"
          className="player-btn"
          disabled={!data.controls?.next || isActing}
          onClick={() => act('/api/media', { action: 'next' })}
        >
          <SkipForward size={19} />
        </button>
      </div>
    </div>
  );
}
