# ai-proxy

Minimal production-safe Fastify + Postgres backend for KlarityAI keyboard and future apps.

## Stack

- Fastify (Node API runtime via Bun)
- Postgres 15
- AI SDK (`ai` + `@ai-sdk/openai`)
- JWT session auth (15 min)

## Endpoints

- `POST /session/bootstrap`
- `POST /ai/execute`

## Env vars

Use `.env.example`:

- `DATABASE_URL`
- `JWT_SECRET`
- `APP_SECRET`
- `OPENAI_API_KEY`
- `PORT`
- `FREE_DAILY_LIMIT`
- `PRO_DAILY_LIMIT`
- `BOOTSTRAP_RATE_LIMIT_PER_HOUR`
- `MAX_INPUT_CHARS`
- `MAX_OUTPUT_TOKENS`
- `REQUEST_TIMEOUT_MS`

## Local run

```bash
bun install
bun run build
bun run dev
```

## Schema

The repo ships the SQL in `sql/schema.sql`. To reuse the `.env` file you already created, run:

```bash
bun run init-db
```

That script uses `dotenv` to load `.env` and applies `sql/schema.sql` through the `pg` driver directly. No `psql` binary is required.

### Platform notes

- **macOS / Linux / Windows**: only Bun and network access to your Postgres are required.
- **If your `DATABASE_URL` host is internal-only** (like Coolify service DNS): run `bun run init-db` from inside the VPS/Coolify terminal where that host resolves.
- **Alternative**: apply `sql/schema.sql` directly inside your hosted Postgres tools if you prefer manual execution.

## API examples

Bootstrap:

```bash
curl -X POST http://localhost:3000/session/bootstrap \
  -H "Content-Type: application/json" \
  -H "X-App-Key: <APP_SECRET>" \
  -d '{"app_id":"klarity-ios","installation_id":"device-uuid"}'
```

Execute:

```bash
curl -X POST http://localhost:3000/ai/execute \
  -H "Content-Type: application/json" \
  -H "X-App-Key: <APP_SECRET>" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"app_id":"klarity-ios","installation_id":"device-uuid","feature":"text_improve","text":"your input","request_id":"req-1"}'
```

## Security guards

- `X-App-Key` is required on both API endpoints and must match `APP_SECRET`.
- `POST /session/bootstrap` has a fixed-window IP rate limit controlled by `BOOTSTRAP_RATE_LIMIT_PER_HOUR` (default `20` requests per hour per IP).

## App integration

Use your app's normal `fetch` client and include `X-App-Key` on all requests.

```ts
const API_BASE = "https://aiproxy.yourdomain.com";
const APP_KEY = "<same value as APP_SECRET in backend>";

const bootstrap = await fetch(`${API_BASE}/session/bootstrap`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-App-Key": APP_KEY,
  },
  body: JSON.stringify({
    app_id: "klarity-ios", // your app name/identifier
    installation_id: installationId,
  }),
});

const { access_token } = await bootstrap.json();

const execute = await fetch(`${API_BASE}/ai/execute`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-App-Key": APP_KEY,
    Authorization: `Bearer ${access_token}`,
  },
  body: JSON.stringify({
    app_id: "klarity-ios", // your app name/identifier
    installation_id: installationId,
    feature: "text_improve",
    text: userText,
    request_id: crypto.randomUUID(),
  }),
});
```
