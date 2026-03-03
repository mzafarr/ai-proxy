# ai-proxy

Minimal production-safe Fastify + Postgres backend for KlarityAI keyboard and future apps.

## Stack
- Fastify (Node 20)
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
npm install
npm run build
npm run dev
```

## Schema
Run:

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

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
