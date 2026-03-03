export type Tier = 'free' | 'pro';

export type Env = {
  databaseUrl: string;
  jwtSecret: string;
  openAiApiKey: string;
  port: number;
  freeDailyLimit: number;
  proDailyLimit: number;
  maxInputChars: number;
  maxOutputTokens: number;
  requestTimeoutMs: number;
};

const toInt = (value: string | undefined, key: string): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${key}`);
  }
  return parsed;
};

export const env: Env = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  port: toInt(process.env.PORT ?? '3000', 'PORT'),
  freeDailyLimit: toInt(process.env.FREE_DAILY_LIMIT ?? '15', 'FREE_DAILY_LIMIT'),
  proDailyLimit: toInt(process.env.PRO_DAILY_LIMIT ?? '300', 'PRO_DAILY_LIMIT'),
  maxInputChars: toInt(process.env.MAX_INPUT_CHARS ?? '1200', 'MAX_INPUT_CHARS'),
  maxOutputTokens: toInt(process.env.MAX_OUTPUT_TOKENS ?? '300', 'MAX_OUTPUT_TOKENS'),
  requestTimeoutMs: toInt(process.env.REQUEST_TIMEOUT_MS ?? '8000', 'REQUEST_TIMEOUT_MS')
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}
if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}
if (!env.openAiApiKey) {
  throw new Error('OPENAI_API_KEY is required');
}
