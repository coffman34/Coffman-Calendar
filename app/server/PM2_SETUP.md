# PM2 Process Manager Setup

This document explains how to set up PM2 (Process Manager 2) for the Family Calendar backend server to ensure automatic restarts and production reliability.

## What is PM2?

PM2 is a production process manager for Node.js applications. It provides:

- **Auto-restart** on crashes
- **Startup scripts** to run on system boot
- **Log management** with automatic rotation
- **Monitoring** of CPU and memory usage
- **Zero-downtime** reloads

## Installation

### On the Kiosk Machine

SSH into the kiosk:

```bash
ssh calendar
```

Install PM2 globally:

```bash
npm install -g pm2
```

## Starting the Server with PM2

Navigate to the server directory and start the application:

```bash
cd /var/www/family-calendar/app/server
pm2 start index.js --name family-calendar
```

## Configure Auto-Start on Boot

Save the current PM2 process list:

```bash
pm2 save
```

Generate and configure the startup script:

```bash
pm2 startup
```

This will output a command to run with sudo. Copy and execute it. It will look something like:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u coffman34 --hp /home/coffman34
```

## Useful PM2 Commands

### View Status

```bash
pm2 status
```

### View Logs

```bash
pm2 logs family-calendar
pm2 logs family-calendar --lines 100
```

### Restart Server

```bash
pm2 restart family-calendar
```

### Stop Server

```bash
pm2 stop family-calendar
```

### Monitor Resources

```bash
pm2 monit
```

### Delete from PM2

```bash
pm2 delete family-calendar
```

## Integration with Deployment

The current deployment script (`scripts/deploy.ps1`) copies files to the kiosk. After deployment, you may need to restart the PM2 process.

### Option 1: Manual Restart After Deploy

```powershell
./scripts/deploy.ps1
ssh calendar "pm2 restart family-calendar"
```

### Option 2: Update deploy.ps1 (Future Enhancement)

Add PM2 restart to the deployment script:

```powershell
# At the end of deploy.ps1
ssh calendar "pm2 restart family-calendar"
```

## Troubleshooting

### Server Not Starting

Check logs for errors:

```bash
pm2 logs family-calendar --err
```

### Port Already in Use

Stop the old process:

```bash
# Find process on port 3001
sudo lsof -i :3001
# Kill it
sudo kill -9 <PID>
# Restart PM2
pm2 restart family-calendar
```

### PM2 Not Starting on Boot

Verify startup script:

```bash
pm2 startup
systemctl status pm2-coffman34
```

## Current Setup (Without PM2)

Currently, the server runs via `node index.js` in a terminal session. This means:

- ❌ Server stops if terminal closes
- ❌ No auto-restart on crashes
- ❌ Manual restart required after reboot

## With PM2

After PM2 setup:

- ✅ Server runs as background daemon
- ✅ Auto-restarts on crashes
- ✅ Starts automatically on system boot
- ✅ Centralized log management
- ✅ Easy monitoring and control
