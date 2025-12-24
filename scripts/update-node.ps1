# Update Node.js on Kiosk
$remoteHost = "calendar"

Write-Host "=== Updating Node.js on Kiosk ==="

# 1. Setup NodeSource (Needs sudo)
# We wrap the complex pipe in a bash string so sudo runs bash which runs the curl|bash
$setupCmd = "curl -fsSL https://deb.nodesource.com/setup_22.x | bash -"
Write-Host "[1/3] Fetching Node.js 22.x setup..."
# Note: We send password to sudo -S. 
# We use bash -c to execute the pipeline as root.
ssh $remoteHost "echo $env:REMOTE_SUDO_PASS | sudo -S bash -c '$setupCmd'"

# 2. Install Node (Needs sudo)
Write-Host "[2/3] Installing Node.js..."
ssh $remoteHost "echo $env:REMOTE_SUDO_PASS | sudo -S apt-get install -y nodejs"

# 3. Restart Service (User service, no sudo)
Write-Host "[3/3] Restarting backend service..."
ssh $remoteHost "systemctl --user restart family-calendar-server"

Write-Host "=== Verify ==="
ssh $remoteHost "node -v"
