---
trigger: always_on
---

# Environment Rules & Differences

This document serves as the "source of truth" for architectural differences between the **Local Development** (Windows) and **Kiosk Deployment** (Linux/Nginx) environments.

## 1. Network Architecture & API Routing

| Feature | Local Development | Kiosk Deployment |
|:---|:---|:---|
| **Frontend Port** | `80` (Vite Default) | `80` (Nginx) |
| **Backend Port** | `3001` (Node/Express) | `3001` (Node/Express) |
| **API Proxy** | Vite Proxy (`/api` → `:3001`) | Nginx Proxy (`/api` → `:3001`) |
| **URL Pattern** | `http://localhost` | `http://localhost:5173` |

### 🚨 Critical Rule: Relative API Paths

**NEVER** hardcode `http://localhost:3001` in frontend services (e.g., `googleAuth.js`).

- **Correct**: `const BACKEND_URL = '/api/auth';`
- **Why**: This ensures the request goes to the port 80 proxy (Vite or Nginx), avoiding CORS issues and ensuring consistency across environments.

---

## 2. Google OAuth Configuration

### Redirect URIs

Google Cloud Console must have both URIs authorized:

1. `http://localhost:5173` (Dev)
2. `http://localhost` (Kiosk/Production)

### Refresh Tokens (`invalid_grant`)

If the app is in "Testing" mode in Google Cloud Console, a re-authentication is required every **7 days**. Ensure the project is set to "Production" for permanent kiosk usage.

---

## 3. Filesystem & Deployment

### OS Pathing

The Kiosk runs Linux (`/var/...`), while Dev runs Windows (`C:\...`).

- **Rule**: Always use `path.join(__dirname, ...)` in server code.
- **Rule**: Never use hardcoded backslashes `\` or drive letters.

### Deployment "Clean" Requirement

Vite generates hashed asset names (e.g., `index-A1B2.js`).

- **Issue**: Old hashes remain on the kiosk after `scp`, causing 404s if the browser tries to load a stale filename or if `index.html` references a purged file.
- **Rule**: Always purge the remote `/var/www/family-calendar/assets/` directory before deploying a new build.

---

## 4. Key Deployment Flow (CLI)

When pushing updates, use this specific sequence to avoid 404s and race conditions:

```powershell
# 1. Purge remote assets to prevent 404 conflicts
ssh calendar "rm -rf /var/www/family-calendar/assets/*"

# 2. Run local clean build
cd app; npm run build; cd ..

# 3. Deploy (via scripts/deploy.ps1)
./scripts/deploy.ps1
```

---

## 5. Known Race Conditions

### Auth Callback

In `GoogleAuthProvider.jsx`, ensure `handleAuthCallback()` is awaited **BEFORE** clearing the URL via `replaceState`. If cleared too early, the `code` parameter will be missing when the server request fires.
