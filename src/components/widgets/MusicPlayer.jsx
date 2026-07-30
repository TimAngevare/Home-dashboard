import { Music4, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, AlertTriangle } from 'lucide-react';
import { useMediaPlayer, formatTime } from '../../hooks/useMediaPlayer.js';

export default function MusicPlayer() {
  const { data, isLoading, error, act, isActing, playing, position, duration, pct } = useMediaPlayer();

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-2" style={{ color: 'var(--warn)' }}>
        <AlertTriangle size={28} />
        <span className="text-sm" style={{ color: 'var(--fg2)' }}>{error}</span>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center gap-6" style={{ padding: 22 }}>
        <div className="shimmer" style={{ width: 288, height: 288, borderRadius: 18 }} />
        <div className="shimmer" style={{ flex: 1, height: 40, borderRadius: 8 }} />
      </div>
    );
  }

  const hasTrack = !!data.title;

  return (
    <div className="music-card">
      <div className="music-art">
        {data.image ? <img src={data.image} alt="" /> : <Music4 size={72} style={{ color: 'var(--fg3)' }} />}
      </div>

      <div className="music-info">
        <div className="music-source">
          <span className="pulse-dot" style={{ background: 'var(--ok)', animationPlayState: playing ? 'running' : 'paused' }} />
          Now playing · Spotify
        </div>

        {hasTrack ? (
          <>
            <div className="music-title">{data.title}</div>
            <div className="music-artist">{data.artist}</div>
            {data.album && <div className="music-album">{data.album}</div>}
          </>
        ) : (
          <div className="music-artist">Nothing playing</div>
        )}

        {duration > 0 && (
          <>
            <div className="music-progress">
              <div className="music-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="music-times">
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </>
        )}

        <div className="music-controls">
          <button
            type="button"
            className={`music-ctrl-btn ${data.shuffle ? 'music-ctrl-btn-active' : ''}`}
            disabled={!data.controls?.shuffle || isActing}
            onClick={() => act('/api/media', { action: 'shuffle', value: !data.shuffle })}
          >
            <Shuffle size={20} />
          </button>
          <button
            type="button"
            className="music-btn-side"
            disabled={!data.controls?.previous || isActing}
            onClick={() => act('/api/media', { action: 'previous' })}
          >
            <SkipBack size={24} />
          </button>
          <button
            type="button"
            className="music-btn-side music-btn-play"
            disabled={!data.controls?.playPause || isActing}
            onClick={() => act('/api/media', { action: 'play_pause' })}
          >
            {playing ? <Pause size={34} /> : <Play size={34} />}
          </button>
          <button
            type="button"
            className="music-btn-side"
            disabled={!data.controls?.next || isActing}
            onClick={() => act('/api/media', { action: 'next' })}
          >
            <SkipForward size={24} />
          </button>
          <button type="button" className="music-ctrl-btn" disabled>
            <Repeat size={20} />
          </button>

          {data.controls?.volume && data.volume != null && (
            <div className="music-volume">
              <Volume2 size={18} style={{ color: 'var(--fg2)' }} />
              <input
                type="range"
                min="0"
                max="100"
                defaultValue={Math.round(data.volume * 100)}
                onChange={(e) => act('/api/media', { action: 'volume', value: Number(e.target.value) / 100 })}
              />
              <span className="music-volume-value">{Math.round(data.volume * 100)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
