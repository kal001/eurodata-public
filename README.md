# eurodata.app – Frontend

![license](https://img.shields.io/badge/license-MIT-blue)
![react](https://img.shields.io/badge/react-18-blue)
![vite](https://img.shields.io/badge/vite-6.3.5-646CFF)
![tailwind](https://img.shields.io/badge/tailwindcss-4.1.12-38B2AC)
![auth0](https://img.shields.io/badge/auth0-enabled-EB5424)

Privacy-first, pan-European web app for all your bank accounts. This repository contains the **frontend only**—you can inspect the code and self-host it.

- **Hosted app:** [https://eurodata.app](https://eurodata.app)
- **Backend:** Not included. Use the hosted API at eurodata.app or run your own backend (not in this repo).

## Build

```bash
npm ci && npm run build
```

Output is in `dist/`. The build runs `sync-public`, which copies `VERSION` and `CHANGELOG.md` from the repo root into `public/` (these files are kept at root when syncing from the main repo).

## Configuration

Copy `.env.example` to `.env` and set at least:

| Variable | Description |
|--------|-------------|
| `VITE_AUTH0_DOMAIN` | Your Auth0 tenant (e.g. `your-tenant.eu.auth0.com`) |
| `VITE_AUTH0_CLIENT_ID` | Auth0 application client ID |
| `VITE_AUTH0_AUDIENCE` | Auth0 API identifier (e.g. `https://eurodata.app/api`) – must allow your backend |
| `VITE_API_URL` | Backend base URL (e.g. `https://eurodata.app` or your own API; no trailing slash) |
| `VITE_APP_NAME` | Optional app name (e.g. `eurodata.app`) |
| `VITE_APP_DESCRIPTION` | Optional short description |

## Self-hosting

Serve the `dist/` output with any static host (Nginx, Apache, Netlify, Vercel, etc.) or use the included **Dockerfile** to build and run a container.

## Open source

The client code in this repository is open source so anyone can **inspect and verify** how the app behaves. No hidden tracking or closed binaries—what you see is what runs.

## License

MIT. See [LICENSE](LICENSE).
