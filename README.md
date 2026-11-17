# PolyStoreX Seller Web Application

Seller portal for PolyStoreX. Suppliers manage grades, offers, orders, and verification. It is the desktop companion to the PolyStoreX seller mobile app.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS · shadcn/ui
- Zustand · Axios · React Hook Form · Zod

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3003](http://localhost:3003).

Fill secrets in `.env` after copying the template. `.env` is gitignored. The only env file that belongs in git is `.env.example`, and that file must contain placeholders only.

## Secrets

| Where                                           | What goes there                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `.env`                                          | Local secrets and machine-specific values. Never commit.              |
| `.env.local`, `.env.production`, `.env.*.local` | Optional local overrides. Never commit.                               |
| `.env.example`                                  | Names and safe public defaults only. No keys, tokens, or passwords.   |
| Vercel / DigitalOcean                           | Production and preview values. Set them in the host dashboard or CLI. |

`NEXT_PUBLIC_*` variables are compiled into the browser bundle. Do not put server credentials, private API keys, or database passwords behind that prefix. The Maps value, when set, must be a browser key restricted by HTTP referrer to the Maps JavaScript API. Leave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` empty to hide the map. Leave `NEXT_PUBLIC_DEMO_OTP` false outside local development.

Production builds read env from the host at build time. Changing a `NEXT_PUBLIC_*` value requires a new deploy.

## Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Development server on port 3003 |
| `npm run build`     | Production build                |
| `npm start`         | Production server               |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript (`tsc --noEmit`)     |

## Production

The current public deploy is Vercel (`https://swaroop-seller-webapp.vercel.app`). The API is the DigitalOcean backend (`https://swaroop-backend-xzwkz.ondigitalocean.app`). A container build is also available via the Dockerfile for App Platform. Set production env vars on the host. Do not copy `.env` into the image or the repository.
