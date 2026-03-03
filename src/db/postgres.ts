import { Pool } from 'pg';
import { env } from '../core/config.js';

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000
});
