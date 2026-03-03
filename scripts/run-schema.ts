import { spawn } from 'node:child_process';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const schemaPath = path.resolve(process.cwd(), 'sql', 'schema.sql');

const psqlCommand = process.env.PSQL_PATH ?? 'psql';
const runner = spawn(psqlCommand, [databaseUrl, '-f', schemaPath], {
  stdio: 'inherit'
});

runner.on('exit', (code) => {
  if (code === 0) {
    console.log('Database schema applied successfully.');
    return;
  }
  console.error(`psql exited with code ${code}`);
  process.exit(code ?? 1);
});

runner.on('error', (error) => {
  console.error('Failed to run psql:', error.message);
  process.exit(1);
});
