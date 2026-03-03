import path from 'node:path';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const schemaPath = path.resolve(process.cwd(), 'sql', 'schema.sql');
const run = async (): Promise<void> => {
  const sql = await readFile(schemaPath, 'utf8');
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(sql);
    console.log('Database schema applied successfully.');
  } finally {
    await pool.end();
  }
};

run().catch((error) => {
  console.error('Failed to apply schema:', error instanceof Error ? error.message : error);
  process.exit(1);
});
