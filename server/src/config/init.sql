-- ============================================================
-- Task Entity — PostgreSQL Migration
-- Run once: psql -d <your_db> -f src/config/init.sql
-- ============================================================

-- Enable uuid generation if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tasks (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(255)    NOT NULL,
    description   TEXT,
    status        VARCHAR(50)     NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Auto-update `updated_at` on every row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON tasks;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
