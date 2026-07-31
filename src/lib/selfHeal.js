const KEY = 'dash.lastReload';
const COOLDOWN_MS = 10_000;

/** Reloads the page unless we already reloaded within the cooldown window
 * (guards against a reload storm if the crash is persistent, e.g. a bad
 * deploy) - important on a kiosk with no keyboard/mouse to recover it. */
export function reloadIfNotRecent() {
  const last = Number(sessionStorage.getItem(KEY) || 0);
  const now = Date.now();
  if (now - last < COOLDOWN_MS) return;
  sessionStorage.setItem(KEY, String(now));
  window.location.reload();
}
