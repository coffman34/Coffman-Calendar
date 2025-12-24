# Coffman Calendar (Family Kiosk)

## Project Overview
The **Coffman Calendar** is a React-based web application designed to run as a kiosk dashboard for family organization. It integrates calendar management, chore tracking, meal planning, and user settings into a unified interface optimized for a touch-screen display.

## Tech Stack
- **Framework:** React 19 + Vite
- **UI Library:** Material UI (@mui/material)
- **Animations:** Framer Motion
- **Date Handling:** date-fns
- **Runtime:** Node.js (Development), Nginx (Production/Kiosk)

## Architecture
The application source code is located in the `app/` directory and follows a feature-based module structure:

- **`app/src/modules/`**: Contains core feature sets.
  - `calendar/`: Main calendar view, event handling, and display.
  - `chores/`: Chore tracking and management.
  - `meals/`: Meal planning interface.
  - `users/`: User profiles and management (Google Sync contexts).
  - `settings/`: Application settings.
- **`app/src/services/`**: logic for external integrations (Google Calendar/Auth).
- **`app/src/components/`**: Reusable UI components (Layouts, Widgets).
- **`scripts/`**: Deployment and setup automation scripts.

## Development

### Prerequisites
- Node.js & npm
- PowerShell (for deployment scripts)

### Commands
All commands should be run from the `app/` directory.

- **Start Dev Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Lint Code:** `npm run lint`
- **Preview Build:** `npm run preview`

## Deployment
The project includes automated deployment scripts for a Linux-based kiosk machine.

- **Target:** Remote host aliased as `calendar`.
- **Method:** `scripts/deploy.ps1` builds the React app and syncs the `dist/` folder to the remote machine via SSH/SCP.
- **Destination:** `/var/www/family-calendar` on the remote host.
- **Kiosk Setup:** The remote machine runs Nginx to serve the static files and Chromium in kiosk mode (`--kiosk http://localhost`).

## Key Conventions
- **State Management:** Uses React Context (`UserContext`) and local state.
- **Styling:** Material UI components with custom theming (`theme/theme.js`).
- **Navigation:** Module-based navigation handled in `App.jsx` (not React Router).
- **File Structure:** Co-locate components with their specific modules where possible.
