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
- `OPENAI_API_KEY`
- `PORT`
- `FREE_DAILY_LIMIT`
- `PRO_DAILY_LIMIT`
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
  -d '{"app_id":"klarity-ios","installation_id":"device-uuid"}'
```

Execute:

```bash
curl -X POST http://localhost:3000/ai/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"app_id":"klarity-ios","installation_id":"device-uuid","feature":"text_improve","text":"your input","request_id":"req-1"}'
```
