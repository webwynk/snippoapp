# Hostinger Business Deployment Guide

This guide is for deploying this app on **Hostinger Business Web Hosting** with:
- Frontend: `https://yourdomain.com`
- API: `https://api.yourdomain.com`

## 1) Architecture and What You Need

Current app stack:
- Frontend: React/Vite (`client/`)
- Backend: Express (`server/`)
- Auth: JWT bearer token
- Persistence: JSON file (`server/data/db.json`) by default

You need:
- Domain with SSL enabled in Hostinger
- Node.js Web App on Hostinger (for backend)
- Static hosting for frontend build files
- Production env vars (see templates below)

## 2) Security/Auth Essentials Before Go-Live

Set these on backend:
- `JWT_SECRET`: long random string (at least 32 chars)
- `JWT_EXPIRES_IN`: token TTL (`7d` default)
- `CORS_ORIGINS`: only your real frontend domains
- `SEED_MODE=secure`: disables demo-seeded users in production
- `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD`: creates first admin on clean database file

Generate JWT secret locally:
```bash
npm --prefix server run jwt:secret
```

## 3) Backend Environment for Hostinger

Use `server/.env.hostinger.example` values in hPanel Environment Variables:

Required:
- `NODE_ENV=production`
- `PORT=4000` (or Hostinger-assigned port if needed)
- `JWT_SECRET=...`
- `CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `TRUST_PROXY=true`
- `SEED_MODE=secure`
- `ADMIN_BOOTSTRAP_EMAIL=owner@yourdomain.com`
- `ADMIN_BOOTSTRAP_PASSWORD=...strong password...`

Recommended:
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=300`
- `AUTH_RATE_LIMIT_MAX=20`
- `DATA_FILE=./data/db.json`

## 4) Deploy Backend on Hostinger (Node.js App)

1. In hPanel, create a Node.js app for your API domain (`api.yourdomain.com`).
2. Upload/clone the project and set app root to `server`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set Start command:
   ```bash
   npm start
   ```
5. Add environment variables from step 3.
6. Start/restart the app.
7. Test:
   - `https://api.yourdomain.com/api/health` should return `{ "ok": true }`.

## 5) Deploy Frontend on Hostinger

Build frontend with production API URL:

1. Create `client/.env.production`:
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```
2. Build:
   ```bash
   npm --prefix client install
   npm --prefix client run build
   ```
3. Upload the contents of `client/dist/` to your main domain web root (`public_html` or Hostinger site root).

## 6) DNS and SSL

Configure:
- `yourdomain.com` -> frontend hosting
- `api.yourdomain.com` -> Node.js app

Enable SSL for both and force HTTPS.

## 7) Database: Do You Need One?

Right now, app uses JSON file storage, so DB server is **not mandatory** to run.

Production recommendation:
- For low traffic/demo: JSON file is okay.
- For business/scale: migrate to MariaDB/MySQL.

Why migrate later:
- Better reliability and concurrency
- Easier backups/restore
- Better performance at higher usage

## 8) First Login After Production Bootstrap

With `SEED_MODE=secure`, first admin is created from:
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

Use those credentials to access admin dashboard and configure services/staff.

## 9) Validation Checklist

After deployment, test:
- User register/login
- Booking creation
- Admin login and booking management
- Staff register/login approval flow
- Embed page `?embed=1`
- CORS errors absent in browser console

## 10) Operational Checklist

- Back up `server/data/db.json` regularly (if staying on JSON storage)
- Rotate JWT secret only with planned logout window
- Keep dependencies updated
- Monitor API logs and 429 responses (rate limiting)

