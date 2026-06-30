# API Proxy

A lightweight HTTP reverse proxy that forwards every incoming request to a configured upstream API. Use it to expose a backend API through your own domain, add a stable front door in front of a changing backend URL, or run a simple pass-through layer during local development.

## How it works

All requests are forwarded to `PROXY_BASE_URL` with the same path and query string:

```
GET https://your-proxy.com/v1/users?page=2
  → GET https://api.example.com/v1/users?page=2
```

The proxy:

- Supports all HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, etc.)
- Forwards request headers and body (for methods that carry a body)
- Returns the upstream status code, headers, and response body
- Strips hop-by-hop headers (`Host`, `Connection`, `Transfer-Encoding`, etc.) that should not be relayed between clients and upstream servers
- Does not follow redirects automatically — redirect responses are passed through to the client

## Configuration

Copy `.env.example` to `.env` and set the target API:

```env
PROXY_BASE_URL=https://api.example.com
PORT=3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PROXY_BASE_URL` | Yes | Base URL of the upstream API (no trailing slash) |
| `PORT` | No | Local server port (default: `3000`). Ignored on Vercel |

## Local development

```bash
pnpm install
pnpm dev
```

The server starts at `http://localhost:3000` and logs the upstream URL it forwards to.

To run without file watching:

```bash
pnpm start
```

## Deploy to Vercel

This project can run on Vercel as [Routing Middleware](https://vercel.com/docs/routing-middleware). The `middleware.ts` entry point reuses the same proxy logic as the local server.

1. Push the repository to GitHub and import it in Vercel
2. Set `PROXY_BASE_URL` in the Vercel project environment variables
3. Deploy

For local Vercel emulation:

```bash
pnpm dev:vercel
```

Function timeout is configured to 60 seconds in `vercel.json`.

## Project structure

```
src/
  index.ts    # Local Hono server (Node.js)
  proxy.ts    # Shared proxy logic
middleware.ts # Vercel middleware entry point
```

## License

Apache License 2.0 — see [LICENSE](LICENSE).
