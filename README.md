# Pi Dashboard

A fullscreen ambient smart-home dashboard for Raspberry Pi 4 running Chromium in
kiosk mode at 1920×1080. Aggregates weather, news, Home Assistant lights,
OpenWRT network stats, Google Calendar, and Notion todos into a glassmorphism
grid. No interaction required — pure ambient display.

## Stack

- **Frontend** React 18 + Vite, Tailwind CSS, React Query, recharts, lucide-react
- **Backend** Express (port `3001`), `node-cache` per-route caching
- **Single command** `npm run dev` (concurrently runs both)

## 1. Install

On the Pi (or any dev machine):

```bash
git clone <repo> dashboard
cd dashboard
npm install
cp .env.example .env
# fill in API keys (see §3)
```

## 2. Run

```bash
# development (Vite HMR + node --watch backend)
npm run dev

# production-ish (vite preview + node)
npm run build
npm start
```

The frontend serves on `http://localhost:3000` and proxies `/api/*` to the
Express server on port `3001`.

## 3. Configure (`.env`)

All secrets live in `.env` (loaded by Express; never reach the browser).
Each widget degrades independently — leave a section blank and that widget will
show an error state without breaking the rest.

### 3.1 Weather (Open-Meteo)

No key needed. Set coordinates:

```env
WEATHER_LAT=52.1551
WEATHER_LON=5.3875
```

### 3.2 News (RSS)

JSON array of feeds:

```env
NEWS_FEEDS=[{"name":"BBC","url":"http://feeds.bbci.co.uk/news/rss.xml"}]
```

### 3.3 Home Assistant

Create a long-lived access token in HA → Profile → Security → Long-lived tokens.

```env
HA_URL=http://homeassistant.local:8123
HA_TOKEN=eyJ...
HA_LIGHT_ENTITY_IDS=        # blank = all lights
```

### 3.4 OpenWRT (LuCI RPC)

LuCI RPC must be installed on the router (`opkg install luci-mod-rpc
luci-lib-jsonrpc luci-lib-ipkg`) and the user must have RPC ACL access.

```env
OPENWRT_URL=http://192.168.1.1
OPENWRT_USER=root
OPENWRT_PASSWORD=...
OPENWRT_WAN_INTERFACE=eth0
```

### 3.5 Google Calendar (OAuth2 with refresh token)

1. Go to <https://console.cloud.google.com/> → create a project.
2. Enable **Google Calendar API**.
3. **OAuth consent screen** → External, add your Google account as a Test user,
   add scope `https://www.googleapis.com/auth/calendar.readonly`.
4. **Credentials** → Create credentials → OAuth client ID → Desktop app.
   Save `client_id` and `client_secret`.
5. Get a refresh token. Easiest path is the [OAuth Playground]
   (<https://developers.google.com/oauthplayground/>):
   - Click the gear icon → tick **Use your own OAuth credentials** → paste
     `client_id` + `client_secret`.
   - In the left panel scope list pick
     `https://www.googleapis.com/auth/calendar.readonly`.
   - **Authorize APIs** → grant access → **Exchange authorization code for
     tokens** → copy the **refresh token**.
6. Add to `.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
```

### 3.6 Notion

1. <https://www.notion.so/my-integrations> → New integration → copy the secret.
2. Open your Notion todo database → **Connections** → add the integration.
3. Copy the database ID from the URL (the 32-char hex chunk).
4. The database should expose a `Status` (status or select), optional
   `Priority`, and optional `Due` (date) property.

```env
NOTION_TOKEN=secret_...
NOTION_DATABASE_ID=...
```

## 4. Kiosk launch (Pi)

### 4.1 Force 1080p

`/boot/config.txt`:

```ini
hdmi_force_hotplug=1
hdmi_group=2
hdmi_mode=82          # 1920x1080 60Hz
disable_overscan=1
```

### 4.2 Systemd service

`/etc/systemd/system/dashboard.service`:

```ini
[Unit]
Description=Pi Dashboard
After=network.target graphical.target

[Service]
User=pi
Environment=DISPLAY=:0
WorkingDirectory=/home/pi/dashboard
ExecStartPre=/bin/sleep 5
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
```

`/etc/systemd/system/dashboard-kiosk.service`:

```ini
[Unit]
Description=Pi Dashboard Kiosk Browser
After=dashboard.service
Requires=dashboard.service

[Service]
User=pi
Environment=DISPLAY=:0
ExecStartPre=/bin/sleep 10
ExecStart=/usr/bin/chromium-browser \
  --kiosk \
  --no-first-run \
  --disable-infobars \
  --noerrdialogs \
  --incognito \
  --disable-features=TranslateUI \
  --disable-extensions \
  --no-sandbox \
  --disable-dev-shm-usage \
  --gpu-memory-buffer-compositor-limit=16 \
  http://localhost:3000
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
```

Enable both:

```bash
sudo systemctl enable --now dashboard.service dashboard-kiosk.service
```

## 5. Architecture

```
/server          Express, port 3001 (API + cache + secrets)
  /routes        weather, news, homeassistant, openwrt, calendar, notion
  /middleware    cache.js (node-cache wrapper)
/src             React frontend
  /components/layout    Dashboard, GlassCard, TopBar, ErrorBoundary
  /components/widgets   one per data source
  /hooks/useWidget.js   React Query wrapper
  /styles               index.css (design system) + animations.css
```

## 6. Refresh / cache cadence

| Widget   | Frontend poll | Server cache TTL |
|----------|--------------:|-----------------:|
| Weather  | 10 min        | 9 min            |
| News     | 15 min        | 14 min           |
| Lights   | 30 s          | 25 s             |
| Network  | 5 s           | 4 s              |
| Calendar | 5 min         | 4 min            |
| Todos    | 5 min         | 4 min            |

## 7. Out of scope

Touch interactions, auth, mobile responsiveness, persistence, Docker.
