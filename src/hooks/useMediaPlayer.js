import { useEffect, useState } from 'react';
import { useWidget, useAction } from './useWidget.js';

export function formatTime(sec) {
  if (sec == null || Number.isNaN(sec)) return '0:00';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/** Shared now-playing state + position ticking, used by the Home hero and the full Music page. */
export function useMediaPlayer() {
  const { data, isLoading, error } = useWidget('media', '/api/media', 5);
  const { act, isActing } = useAction(['media']);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const playing = data?.state === 'playing';
  let position = data?.positionSec ?? 0;
  if (playing && data?.positionUpdatedAt) {
    const elapsed = (now - new Date(data.positionUpdatedAt).getTime()) / 1000;
    position = Math.min(data.durationSec ?? position + elapsed, position + Math.max(0, elapsed));
  }
  const duration = data?.durationSec ?? 0;
  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return { data, isLoading, error, act, isActing, playing, position, duration, pct };
}
