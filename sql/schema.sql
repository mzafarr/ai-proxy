CREATE TABLE IF NOT EXISTS installations (
  app_id TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, installation_id)
);

CREATE TABLE IF NOT EXISTS daily_usage (
  app_id TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  date DATE NOT NULL,
  used INT NOT NULL DEFAULT 0,
  PRIMARY KEY (app_id, installation_id, date)
);
