#!/bin/bash
# Family Calendar Kiosk Setup Script
# Run this directly on the Ubuntu kiosk machine

set -e

echo "=== Family Calendar Kiosk Setup ==="

# 0. Install Media Codecs & Player
echo "[0/5] Installing media codecs and VLC..."
sudo apt-get update
sudo apt-get install -y chromium-codecs-ffmpeg-extra vlc

# 1. Cleanup old attempts
echo "[1/5] Cleaning up old configurations..."
sudo snap disable ubuntu-frame 2>/dev/null || true
sudo snap disable wpe-webkit-mir-kiosk 2>/dev/null || true
systemctl --user disable family-calendar.service 2>/dev/null || true
rm -f ~/.config/systemd/user/family-calendar.service 2>/dev/null || true

# 2. Configure GDM auto-login
echo "[2/5] Configuring auto-login..."
sudo sed -i 's/#\?AutomaticLoginEnable=.*/AutomaticLoginEnable=true/' /etc/gdm3/custom.conf
sudo sed -i 's/#\?AutomaticLogin=.*/AutomaticLogin=coffman34/' /etc/gdm3/custom.conf

# 3. Create autostart directory
echo "[3/5] Setting up autostart..."
mkdir -p ~/.config/autostart

# 4. Create autostart entry for Chromium kiosk
cat > ~/.config/autostart/family-calendar.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Family Calendar
Exec=chromium --kiosk --noerrdialogs --disable-infobars --no-first-run --disable-session-crashed-bubble --disable-restore-session-state http://localhost
Terminal=false
X-GNOME-Autostart-enabled=true
X-GNOME-Autostart-Delay=3
EOF

# 4a. Create systemd service for backend server
echo "[3.5/5] Setting up backend server service..."
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/family-calendar-server.service << 'EOF'
[Unit]
Description=Family Calendar Backend API
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /var/www/family-calendar/server/index.js
WorkingDirectory=/var/www/family-calendar/server
Restart=always
Environment=PORT=3001

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now family-calendar-server.service

# 5. Verify nginx is running
echo "[4/5] Verifying nginx..."
if curl -s http://localhost > /dev/null; then
    echo "✓ nginx is serving content"
else
    echo "✗ nginx is not running - check configuration"
fi

echo "[5/5] Setup complete!"
echo ""
echo "=== Next Steps ==="
echo "1. Reboot the machine: sudo reboot"
echo "2. The kiosk should auto-login and show the calendar fullscreen"
echo ""
echo "To test now without rebooting:"
echo "  chromium --kiosk http://localhost"
