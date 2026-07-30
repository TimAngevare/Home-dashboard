#!/bin/bash
# Waits for the dashboard's own server to come up, then launches Chromium in
# kiosk mode. Run from ~/.xinitrc (plain X session started via startx from the
# tty1 console autologin - see ~/.profile).
set -u

URL="http://localhost:3000"

until curl -sf -o /dev/null "$URL"; do
  sleep 1
done

# Fresh, throwaway profile every launch (in tmpfs, gone on reboot) - keeps
# the kiosk stateless so a stray zoom level, extension, or cache issue can
# never persist across restarts like it did during testing.
rm -rf /tmp/chromium-kiosk-profile
mkdir -p /tmp/chromium-kiosk-profile

exec chromium \
  --kiosk \
  --user-data-dir=/tmp/chromium-kiosk-profile \
  --no-first-run \
  --disable-infobars \
  --noerrdialogs \
  --disable-features=TranslateUI \
  --disable-extensions \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --force-device-scale-factor=1 \
  --window-size=1024,600 \
  --window-position=0,0 \
  "$URL"
