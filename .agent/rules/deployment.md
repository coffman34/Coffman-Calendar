---
trigger: always_on
glob:
description: Deployment rules for the Family Calendar kiosk
---

# Deployment

## Remote Machine
- **Host**: `calendar` (SSH alias configured)
- **User**: `coffman34`
- **Sudo Password**: `1136849`

## Deployment Command
```powershell
./scripts/deploy.ps1
```

## What deploy.ps1 Does
1. Builds the React app locally (`npm run build`)
2. Syncs `dist/` to `/var/www/family-calendar` on the kiosk
3. nginx automatically serves the new files

## Kiosk Auto-Start
- **GDM auto-login**: Enabled for `coffman34`
- **Autostart**: `~/.config/autostart/family-calendar.desktop`
- **Browser**: Chromium in `--kiosk` mode pointing to `http://localhost`

## Setup Script
To reconfigure the kiosk from scratch:
```powershell
ssh calendar "echo $env:REMOTE_SUDO_PASS | sudo -S bash ~/setup-kiosk.sh"
```

## Key Files on Kiosk
- `/var/www/family-calendar/` - Web app files
- `/etc/nginx/sites-enabled/family-calendar` - nginx config
- `~/.config/autostart/family-calendar.desktop` - Chromium autostart
