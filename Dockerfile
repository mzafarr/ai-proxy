FROM oven/bun:1.3.9-alpine

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Expose app configuration keys so deployment platforms like Coolify list them
ENV DATABASE_URL=""
ENV JWT_SECRET=""
ENV OPENAI_API_KEY=""
ENV PORT=3000
ENV FREE_DAILY_LIMIT=15
ENV PRO_DAILY_LIMIT=300
ENV MAX_INPUT_CHARS=1200
ENV MAX_OUTPUT_TOKENS=300
ENV REQUEST_TIMEOUT_MS=8000

EXPOSE 3000
CMD ["bun", "run", "start"]
