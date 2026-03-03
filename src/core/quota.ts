import { pool } from '../db/postgres.js';

export const ensureUsageRow = async (appId: string, installationId: string): Promise<void> => {
  await pool.query(
    `INSERT INTO daily_usage (app_id, installation_id, date, used)
     VALUES ($1, $2, CURRENT_DATE, 0)
     ON CONFLICT (app_id, installation_id, date) DO NOTHING`,
    [appId, installationId]
  );
};

export const consumeDailyQuota = async (
  appId: string,
  installationId: string,
  dailyLimit: number
): Promise<number | null> => {
  const result = await pool.query<{ used: number }>(
    `UPDATE daily_usage
     SET used = used + 1
     WHERE app_id = $1
       AND installation_id = $2
       AND date = CURRENT_DATE
       AND used < $3
     RETURNING used`,
    [appId, installationId, dailyLimit]
  );

  return result.rowCount ? result.rows[0].used : null;
};
