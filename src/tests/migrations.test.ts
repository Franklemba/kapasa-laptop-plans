/**
 * Migration sanity tests
 *
 * These tests verify the *content* of the SQL migration files themselves —
 * checking that each file contains the expected SQL statements.
 * They catch regressions where a migration file is accidentally edited.
 *
 * No DB connection needed — just file reads.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const migrationsDir = resolve(__dirname, '../../supabase/migrations');

const sql = (filename: string) =>
  readFileSync(resolve(migrationsDir, filename), 'utf-8');

// ─── Phase 1: Security ───────────────────────────────────────────────────────

describe('Phase 1A — drop open INSERT policy', () => {
  it('drops the Allow insert for all policy', () => {
    const content = sql('20260529010000_phase1a_drop_open_insert_policy.sql');
    expect(content).toMatch(/DROP POLICY.*Allow insert for all/i);
    expect(content).toMatch(/public\.clients/i);
  });
});

describe('Phase 1B — fix clients SELECT policy', () => {
  it('creates scoped client SELECT policy using auth.uid()', () => {
    const content = sql('20260529010100_phase1b_fix_clients_select_policy.sql');
    expect(content).toMatch(/auth\.uid\(\)/);
    expect(content).toMatch(/user_id/);
    expect(content).toMatch(/CREATE POLICY/i);
  });
  it('drops the public read access policy', () => {
    const content = sql('20260529010100_phase1b_fix_clients_select_policy.sql');
    expect(content).toMatch(/DROP POLICY/i);
  });
});

describe('Phase 1D — stock_movements FK cascade → SET NULL', () => {
  it('drops the CASCADE FK and recreates with SET NULL', () => {
    const content = sql('20260529010300_phase1d_fix_stock_movements_fk_cascade.sql');
    expect(content).toMatch(/DROP CONSTRAINT/i);
    expect(content).toMatch(/ON DELETE SET NULL/i);
    expect(content).toMatch(/stock_movements/i);
    expect(content).toMatch(/laptop_id/i);
  });
});

// ─── Phase 2: Schema additions ───────────────────────────────────────────────

describe('Phase 2A — extend payment_plans', () => {
  it('adds down_payment, end_date, approved_by, approved_at, rejected_by, rejected_at', () => {
    const content = sql('20260529020000_phase2a_extend_payment_plans.sql');
    expect(content).toMatch(/down_payment/i);
    expect(content).toMatch(/end_date/i);
    expect(content).toMatch(/approved_by/i);
    expect(content).toMatch(/approved_at/i);
    expect(content).toMatch(/rejected_by/i);
    expect(content).toMatch(/rejected_at/i);
  });
});

describe('Phase 2B — payments.recorded_by', () => {
  it('adds recorded_by column with FK to auth.users', () => {
    const content = sql('20260529020100_phase2b_payments_recorded_by.sql');
    expect(content).toMatch(/recorded_by/i);
    expect(content).toMatch(/auth\.users/i);
  });
});

describe('Phase 2C — extend clients', () => {
  it('adds employer, job_title, date_of_birth, street_address, city, province', () => {
    const content = sql('20260529020200_phase2c_extend_clients.sql');
    ['employer', 'job_title', 'date_of_birth', 'street_address', 'city', 'province'].forEach(col => {
      expect(content).toMatch(new RegExp(col, 'i'));
    });
  });

  it('adds partial unique index on national_id', () => {
    const content = sql('20260529020200_phase2c_extend_clients.sql');
    expect(content).toMatch(/UNIQUE.*INDEX/i);
    expect(content).toMatch(/national_id.*IS NOT NULL/i);
  });
});

describe('Phase 2D — rename weekly_payment → default_weekly_payment', () => {
  it('renames the column', () => {
    const content = sql('20260529020300_phase2d_rename_laptop_weekly_payment.sql');
    expect(content).toMatch(/RENAME COLUMN.*weekly_payment.*TO.*default_weekly_payment/i);
  });
});

describe('Phase 2F — payment_schedule table', () => {
  it('creates the payment_schedule table with required columns', () => {
    const content = sql('20260529020500_phase2f_create_payment_schedule.sql');
    expect(content).toMatch(/CREATE TABLE.*payment_schedule/i);
    expect(content).toMatch(/week_number/i);
    expect(content).toMatch(/due_date/i);
    expect(content).toMatch(/amount_due/i);
    expect(content).toMatch(/status.*pending.*paid.*overdue/i);
  });

  it('has RLS enabled', () => {
    const content = sql('20260529020500_phase2f_create_payment_schedule.sql');
    expect(content).toMatch(/ENABLE ROW LEVEL SECURITY/i);
  });
});

describe('Phase 2G — notifications table', () => {
  it('creates notifications table with type CHECK constraint', () => {
    const content = sql('20260529020600_phase2g_create_notifications.sql');
    expect(content).toMatch(/CREATE TABLE.*notifications/i);
    expect(content).toMatch(/payment_due/i);
    expect(content).toMatch(/payment_received/i);
    expect(content).toMatch(/plan_approved/i);
    expect(content).toMatch(/plan_rejected/i);
    expect(content).toMatch(/is_read/i);
  });
});

describe('Phase 2H — notification_preferences table', () => {
  it('creates notification_preferences and has auto-create trigger', () => {
    const content = sql('20260529020700_phase2h_create_notification_preferences.sql');
    expect(content).toMatch(/CREATE TABLE.*notification_preferences/i);
    expect(content).toMatch(/CREATE.*TRIGGER/i);
    expect(content).toMatch(/AFTER INSERT ON.*clients/i);
    expect(content).toMatch(/reminder_days_before/i);
  });
});

describe('Phase 2I — audit_log table', () => {
  it('creates audit_log with append-only grant', () => {
    const content = sql('20260529020800_phase2i_create_audit_log.sql');
    expect(content).toMatch(/CREATE TABLE.*audit_log/i);
    expect(content).toMatch(/action_type/i);
    expect(content).toMatch(/old_values/i);
    expect(content).toMatch(/new_values/i);
    expect(content).toMatch(/GRANT.*INSERT.*service_role/i);
  });
});

describe('Phase 2J — record_payment_atomic function', () => {
  it('creates the function with FOR UPDATE locking', () => {
    const content = sql('20260529020900_phase2j_atomic_record_payment_function.sql');
    expect(content).toMatch(/CREATE.*FUNCTION.*record_payment_atomic/i);
    expect(content).toMatch(/FOR UPDATE/i);
    expect(content).toMatch(/SECURITY DEFINER/i);
    expect(content).toMatch(/RETURNS.*jsonb/i);
  });

  it('writes to audit_log and creates notification', () => {
    const content = sql('20260529020900_phase2j_atomic_record_payment_function.sql');
    expect(content).toMatch(/audit_log/i);
    expect(content).toMatch(/notifications/i);
    expect(content).toMatch(/payment_received/i);
  });
});

describe('Phase 2K — schedule generation trigger', () => {
  it('fires AFTER UPDATE on payment_plans for pending→active transition', () => {
    const content = sql('20260529021000_phase2k_schedule_generation_trigger.sql');
    expect(content).toMatch(/AFTER UPDATE ON.*payment_plans/i);
    expect(content).toMatch(/pending.*active/i);
    expect(content).toMatch(/payment_schedule/i);
  });
});

// ─── Phase 3: Data cleanup ───────────────────────────────────────────────────

describe('Phase 3A — orphaned admin cleanup', () => {
  it('deletes goat@gmail.com with safety checks', () => {
    const content = sql('20260529030000_phase3a_fix_orphaned_admin.sql');
    expect(content).toMatch(/goat@gmail\.com/i);
    expect(content).toMatch(/DELETE FROM public\.clients/i);
    expect(content).toMatch(/payment_plans/i); // safety check for linked plans
  });
});

describe('Phase 3B — laptop data fixes', () => {
  it('corrects the Mackbook typo', () => {
    const content = sql('20260529030100_phase3b_fix_laptop_data.sql');
    expect(content).toMatch(/Mackbook pro/);
    expect(content).toMatch(/MacBook Pro/);
  });

  it('updates default_weekly_payment values', () => {
    const content = sql('20260529030100_phase3b_fix_laptop_data.sql');
    expect(content).toMatch(/default_weekly_payment/i);
  });
});

describe('Phase 3E — enforce NOT NULL on clients.user_id', () => {
  it('has safety check abort block', () => {
    const content = sql('20260529030400_phase3e_enforce_user_id_not_null.sql');
    expect(content).toMatch(/RAISE EXCEPTION/i);
    expect(content).toMatch(/user_id IS NULL/i);
  });

  it('sets NOT NULL and adds FK constraint', () => {
    const content = sql('20260529030400_phase3e_enforce_user_id_not_null.sql');
    expect(content).toMatch(/SET NOT NULL/i);
    expect(content).toMatch(/FOREIGN KEY.*user_id/i);
    expect(content).toMatch(/auth\.users/i);
    expect(content).toMatch(/ON DELETE CASCADE/i);
  });

  it('adds unique index on user_id', () => {
    const content = sql('20260529030400_phase3e_enforce_user_id_not_null.sql');
    expect(content).toMatch(/CREATE UNIQUE INDEX/i);
    expect(content).toMatch(/idx_clients_user_id_unique/i);
  });
});
