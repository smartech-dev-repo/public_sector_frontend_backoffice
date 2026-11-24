# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Admin sign-in and deployment settings

Admins sign in through this app's own server, not straight from the browser
to the API. The routes under `app/api/session/` (login, two-factor
verification, invite acceptance, refresh, logout) call the API and keep the
refresh token in an httpOnly cookie on this domain. The page only ever holds
the 15-minute access token, in memory. These routes follow the proxy rules:
a fixed API address, a fixed list of API paths, request bodies rebuilt field
by field, and no redirects.

Set these as **runtime** environment variables on the container, never as
build args (build args are stored in the image):

| Setting | What it does |
|---|---|
| `BACKOFFICE_PROXY_SECRET` | At least 32 characters (`openssl rand -hex 32`), the same value as on the API. Lets the API trust the admin's IP this server sends. |
| `CLIENT_IP_HEADER` | Header the edge sets to the visitor's IP: `cf-connecting-ip` while Cloudflare is in front. |
| `TRUST_PROXY_HOPS` | Use instead of `CLIENT_IP_HEADER` without Cloudflare: `1` for Traefik alone. |
| `API_INTERNAL_URL` | Optional. The API address as this server reaches it. Defaults to `NEXT_PUBLIC_API_BASE_URL`. |

`NEXT_PUBLIC_API_BASE_URL` stays a build arg, since the browser still calls
the API directly for everything else.

Without a working visitor-IP setting, the API sees this server's address for
every sign-in, so all admins share one login rate limit (5 failed attempts
in 15 minutes locks everyone out). **Revisit these settings whenever the
proxy setup changes**, for example when Cloudflare is added or removed. The
server logs a `[session][client-ip]` warning when the configured header is
missing or a setting is wrong. See the backend README's "Visitor IP behind
proxies" section for the full guide.
