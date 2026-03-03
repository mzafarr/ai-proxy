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

That script uses `dotenv` to load `.env` and executes `psql "$DATABASE_URL" -f sql/schema.sql`. It only logs status and errors so secrets stay local. If `psql` remains missing, either reload your shell (`source ~/.zshrc`), set `PSQL_PATH=/opt/homebrew/opt/libpq/bin/psql bun run init-db`, or run the SQL directly inside your hosted Postgres (Coolify, Cloud SQL, etc.).

### Platform notes
- **macOS**: install `psql` via `brew install libpq` and `export PATH="/opt/homebrew/opt/libpq/bin:$PATH"` before running `bun run init-db`.
- **Linux**: use your distro package manager (`apt install postgresql-client` on Debian/Ubuntu, `dnf install postgresql` on Fedora/RHEL, etc.).
- **Windows**: install the [PostgreSQL client tools](https://www.postgresql.org/download/windows/) and make sure `psql` is on `%PATH%`.
- **Alternative**: apply `sql/schema.sql` inside your hosted Postgres (Coolify, Cloud SQL, etc.)—export the file and run `psql` from that platform instead of locally.

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
