import axios from 'axios';

function client(opts) {
  const url = process.env.HA_URL;
  const token = process.env.HA_TOKEN;
  if (!url || !token) throw new Error('HA_URL or HA_TOKEN not configured');
  return axios.create({
    baseURL: url.replace(/\/$/, ''),
    headers: { Authorization: `Bearer ${token}` },
    timeout: 8000,
    ...opts,
  });
}

export async function getStates() {
  const { data } = await client().get('/api/states');
  return Array.isArray(data) ? data : [];
}

export async function getState(entityId) {
  const { data } = await client().get(`/api/states/${entityId}`);
  return data;
}

/**
 * Call a Home Assistant service, e.g. callService('light', 'toggle', { entity_id }).
 * HA's REST API blocks until the service call finishes, which can take 10s+ for
 * slow/flaky devices (observed with a Zigbee light on this setup) - too slow for
 * a touch tap to feel responsive. Give it a generous timeout but let callers
 * decide whether to await it or fire-and-forget for snappy UI feedback.
 */
export async function callService(domain, service, serviceData) {
  const { data } = await client({ timeout: 15000 }).post(`/api/services/${domain}/${service}`, serviceData || {});
  return data;
}

export async function getCalendars() {
  const { data } = await client().get('/api/calendars');
  return Array.isArray(data) ? data : [];
}

export async function getCalendarEvents(entityId, start, end) {
  const { data } = await client().get(
    `/api/calendars/${entityId}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  );
  return Array.isArray(data) ? data : [];
}

export function parseIdList(envValue) {
  return (envValue || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
