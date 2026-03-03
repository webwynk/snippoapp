# LumaSpa Full-Stack App

This project is now a working full-stack web app:
- `client/`: React + Vite frontend
- `server/`: Express API with JSON-file persistence (`server/data/db.json`)

For Hostinger Business deployment, see:
- `HOSTINGER_DEPLOY.md`

## Prerequisites

- Node.js 18+ (recommended Node.js 20+)
- npm 9+

## Setup

```bash
npm install
npm run setup
```

## Run in Development

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`

## Production-like Run

```bash
npm run build
npm run start
```

## Demo Credentials

- Admin: `admin@lumaspa.com` / `admin123`
- User: `alex@example.com` / `password123`
- Staff: `marcus@lumaspa.com` / `staff123`

## Environment Variables

Copy examples if you want to customize:

- `server/.env.example` -> `server/.env`
- `server/.env.hostinger.example` -> Hostinger production env reference
- `client/.env.example` -> `client/.env`
- `client/.env.production.example` -> production frontend build reference

## Notes

- Data is persisted in `server/data/db.json`.
- Deleting `server/data/db.json` resets data to seed values on next API start.
- In production, use `SEED_MODE=secure` and set `ADMIN_BOOTSTRAP_*` values to avoid demo credentials.
- Generate JWT secret with:
  ```bash
  npm --prefix server run jwt:secret
  ```
