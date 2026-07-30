import axios from 'axios';

let session = { id: null, expiresAt: 0 };
let rpcId = 1;

function endpoint() {
  const base = process.env.OPENWRT_URL;
  if (!base) throw new Error('OPENWRT_URL not configured');
  return `${base.replace(/\/$/, '')}/ubus`;
}

async function rawCall(sessionId, object, method, params) {
  const { data } = await axios.post(
    endpoint(),
    { jsonrpc: '2.0', id: rpcId++, method: 'call', params: [sessionId, object, method, params || {}] },
    { timeout: 8000, headers: { 'Content-Type': 'application/json' } },
  );
  if (data?.error) throw new Error(data.error.message || 'ubus RPC error');
  const result = data?.result;
  if (!Array.isArray(result)) throw new Error('malformed ubus response');
  const [status, payload] = result;
  if (status !== 0) throw new Error(`ubus call failed (${object}/${method}): status ${status}`);
  return payload;
}

async function login() {
  const user = process.env.OPENWRT_USER;
  const pass = process.env.OPENWRT_PASSWORD;
  if (!user || !pass) throw new Error('OPENWRT_USER/PASSWORD not configured');
  const payload = await rawCall('00000000000000000000000000000000', 'session', 'login', {
    username: user,
    password: pass,
  });
  session = {
    id: payload.ubus_rpc_session,
    // refresh a bit before actual expiry
    expiresAt: Date.now() + Math.max(10, (payload.timeout || 300) - 30) * 1000,
  };
  return session.id;
}

async function ensureSession() {
  if (!session.id || Date.now() >= session.expiresAt) await login();
  return session.id;
}

/** Call a ubus method, transparently logging in / re-logging in on auth failure. */
export async function call(object, method, params) {
  const sid = await ensureSession();
  try {
    return await rawCall(sid, object, method, params);
  } catch (e) {
    if (/status 6/.test(e.message)) {
      // access denied -> session likely expired, retry once with a fresh login
      const fresh = await login();
      return rawCall(fresh, object, method, params);
    }
    throw e;
  }
}
