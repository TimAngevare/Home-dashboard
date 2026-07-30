import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Display-mode controller for the Sunrise dashboard.
 *
 * - Three modes: 'light' | 'dark' | 'sleep'
 * - `auto` follows the weather feed's sunrise/sunset. A manual pick wins
 *   until the next boundary crossing.
 * - `dim` is the sleep brightness in percent (8 | 20 | 40); 20 is the default.
 * - Everything persists in localStorage so a Pi reboot restores the state.
 *
 * Usage:
 *   const { mode, auto, dim, setMode, setDim, toggleAuto, themeClass } = useDisplayMode(weather?.sun);
 *   <div className={`dashboard-root ${themeClass}`} style={{ '--sleep-b': dim / 100 }}>
 */

const KEY = { mode: 'dash.mode', auto: 'dash.auto', dim: 'dash.dim' };

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — ignore */
  }
}

/** Mode implied by the sun times: night -> sleep, dusk -> dark, day -> light. */
export function modeForTime(now, sun) {
  if (!sun?.sunrise || !sun?.sunset) return null;
  const t = now.getTime();
  const sunrise = new Date(sun.sunrise).getTime();
  const sunset = new Date(sun.sunset).getTime();
  const bedtime = sunset + 2 * 60 * 60 * 1000; // 2h after sunset

  if (t < sunrise || t > bedtime) return 'sleep';
  if (t > sunset) return 'dark';
  return 'light';
}

export function useDisplayMode(sun) {
  const [manual, setManual] = useState(() => read(KEY.mode, null));
  const [auto, setAuto] = useState(() => read(KEY.auto, true));
  const [dim, setDimState] = useState(() => read(KEY.dim, 20));
  const [now, setNow] = useState(() => new Date());

  // One minute is plenty for boundary checks; the clock has its own 1s interval.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const autoMode = useMemo(() => modeForTime(now, sun), [now, sun]);

  // Clear the manual override once the automatic mode moves on.
  useEffect(() => {
    if (auto && manual && autoMode && manual !== autoMode) {
      setManual(null);
      write(KEY.mode, null);
    }
  }, [auto, manual, autoMode]);

  const mode = auto ? (manual ?? autoMode ?? 'dark') : (manual ?? 'dark');

  const setMode = useCallback((m) => {
    setManual(m);
    setAuto(false);
    write(KEY.mode, m);
    write(KEY.auto, false);
  }, []);

  const setDim = useCallback((d) => {
    setDimState(d);
    write(KEY.dim, d);
  }, []);

  const toggleAuto = useCallback(() => {
    setAuto((a) => {
      const next = !a;
      write(KEY.auto, next);
      if (next) {
        setManual(null);
        write(KEY.mode, null);
      }
      return next;
    });
  }, []);

  /** Back to whatever auto would pick (used by the Wake button). */
  const wake = useCallback(() => {
    setAuto(true);
    write(KEY.auto, true);
    setManual(null);
    write(KEY.mode, null);
  }, []);

  return {
    mode,
    auto,
    dim,
    setMode,
    setDim,
    toggleAuto,
    wake,
    sunsetLabel: sun?.sunset ? new Date(sun.sunset).toTimeString().slice(0, 5) : null,
    themeClass:
      mode === 'sleep' ? 'theme-sunrise-sleep' : mode === 'light' ? 'theme-sunrise-light' : 'theme-sunrise-dark',
  };
}
