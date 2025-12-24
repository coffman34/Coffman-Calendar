# Family Calendar - Deployment Script
$remotePath = "/var/www/family-calendar"

echo "=== 1. Building Project ==="
Push-Location app
npm run build
if ($LASTEXITCODE -ne 0) {
    echo "Build failed!"
    Pop-Location
    exit 1
}
Pop-Location

echo "=== 2. Deploying to Kiosk ==="
ssh calendar "echo $env:REMOTE_SUDO_PASS | sudo -S mkdir -p $remotePath/server/storage && echo $env:REMOTE_SUDO_PASS | sudo -S chown -R coffman34:coffman34 $remotePath"
scp -r ./app/dist/* calendar:$remotePath/
scp -r ./app/server/* calendar:$remotePath/server/
ssh calendar "echo $env:REMOTE_SUDO_PASS | sudo -S chmod -R 755 $remotePath"
ssh calendar "cd $remotePath/server && npm install --production"
ssh calendar "systemctl --user restart family-calendar-server"

echo "=== 3. Complete ==="
echo "App deployed to http://localhost on kiosk"
