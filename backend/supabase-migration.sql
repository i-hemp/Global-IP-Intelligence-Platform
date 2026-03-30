-- ============================================================
-- supabase-migration.sql
-- Run this once in the Supabase SQL Editor (or psql).
-- ============================================================

-- ── admin_logs ──────────────────────────────────────────────
-- Stores audit events for every significant system action.
-- No foreign keys — rows survive even if the referenced entity
-- is later deleted.

CREATE TABLE IF NOT EXISTS admin_logs (
    id           BIGSERIAL    PRIMARY KEY,
    timestamp    TIMESTAMP    NOT NULL DEFAULT NOW(),
    action       VARCHAR(100) NOT NULL,
    performed_by VARCHAR(255),
    entity_type  VARCHAR(100),
    entity_id    VARCHAR(255),
    details      TEXT,
    status       VARCHAR(20)  NOT NULL DEFAULT 'SUCCESS'
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action    ON admin_logs(action);
