# Public Sector back office

The admin web app for the public sector lending platform: client and agent onboarding, loan
products and requests, IPPIS uploads, repayments, reports, roles and configuration. It talks to
the API in `public-sector-backend`.

Built with Next.js 16 (App Router), React 19 and Tailwind CSS. This Next.js has breaking changes
from older versions; read `AGENTS.md` before changing framework code.

## Run it locally

Needs Node 22 and the API running.

```sh
npm install          # also installs the pre-commit hook (see "What not to commit")
cp .env.example .env # then fill in the values
npm run dev          # http://localhost:4005
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server on port 4005 |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build, reading `.env` if present |
| `npm run lint` | Lint |
| `npm run check:files` | Check the repository for files that must not be committed |

## Settings

Values baked into the browser bundle at build time (in Dokploy: **Build-time Arguments**):

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API address the browser calls |
| `NEXT_PUBLIC_IMAGE_UPLOAD_BASE_URL` | Base address for uploaded images |

Server-only values, read at runtime (in Dokploy: **Environment**). Never prefix these with
`NEXT_PUBLIC_`.

| Name | Purpose |
|---|---|
| `API_INTERNAL_URL` | API address as this server reaches it, for sign-in and session refresh. Falls back to `NEXT_PUBLIC_API_BASE_URL`. |
| `BACKOFFICE_PROXY_SECRET` | Same value as the API's setting. Lets the API trust the admin IP this server sends. |
| `CLIENT_IP_HEADER` | Header the edge sets to the visitor's IP, e.g. `cf-connecting-ip` behind Cloudflare. |
| `TRUST_PROXY_HOPS` | If there is no such header: how many proxies in front of this server append to `X-Forwarded-For`. |
| `PORT`, `HOSTNAME` | Where the server listens (the Docker image defaults to `3000` and `0.0.0.0`). |

Sign-in goes through this server (`app/api/session/*`): the refresh token is kept in an httpOnly
cookie and never reaches browser JavaScript.

## Deploy

`Dockerfile` builds a standalone image. Dokploy builds it from the branch; pass the
`NEXT_PUBLIC_*` values as build arguments and the server-only values as environment.

## Layout

| Path | Contents |
|---|---|
| `app/` | Routes (`app/dashboard/...`), the API client (`app/api_factory/`), hooks (`app/composables/`), shared UI (`app/components/`) |
| `app/api/session/` | Server routes for sign-in, refresh, 2FA and logout |
| `components/` | Theme provider, dialog, modal and toaster |
| `lib/` | Small helpers |
| `public/` | Logos and favicon |
| `scripts/` | Repository tooling |

## What not to commit

`scripts/check-repo-files.mjs` blocks build output (`.next/`), caches, env files, keys, Postman
exports, data dumps, scratch scripts and files over 1 MB. It runs as a pre-commit hook (installed
by `npm install`) and in CI on every push and pull request, so `--no-verify` doesn't get past it.

The top level of the repo is an allowlist. A new top-level file or folder fails the check until
it's added to `ROOT_ALLOWED` in that script, in the same change.

The API's Postman collection lives in the backend repo (`postman/`), not here.
