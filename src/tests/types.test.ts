/**
 * TypeScript type-shape tests
 *
 * These tests don't run DB calls — they use TypeScript's type system to
 * assert that the generated types include every column/table we added.
 * A compile error here means a migration added a column that types.ts missed.
 *
 * Run: npm test (or tsc --noEmit for a type-only check)
 */

import { describe, it, expectTypeOf } from 'vitest';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

// ─── clients ─────────────────────────────────────────────────────────────────

describe('clients table types', () => {
  it('has role column (was missing)', () => {
    type ClientRow = Tables<'clients'>;
    expectTypeOf<ClientRow['role']>().toEqualTypeOf<string>();
  });

  it('user_id is non-nullable string (after Phase 3E)', () => {
    type ClientRow = Tables<'clients'>;
    // user_id must be string, NOT string | null
    expectTypeOf<ClientRow['user_id']>().toEqualTypeOf<string>();
  });

  it('has extended profile columns from Phase 2C', () => {
    type ClientRow = Tables<'clients'>;
    expectTypeOf<ClientRow['employer']>().toEqualTypeOf<string | null>();
    expectTypeOf<ClientRow['job_title']>().toEqualTypeOf<string | null>();
    expectTypeOf<ClientRow['date_of_birth']>().toEqualTypeOf<string | null>();
    expectTypeOf<ClientRow['street_address']>().toEqualTypeOf<string | null>();
    expectTypeOf<ClientRow['city']>().toEqualTypeOf<string | null>();
    expectTypeOf<ClientRow['province']>().toEqualTypeOf<string | null>();
  });
});

// ─── laptops ─────────────────────────────────────────────────────────────────

describe('laptops table types', () => {
  it('has default_weekly_payment (renamed from weekly_payment)', () => {
    type LaptopRow = Tables<'laptops'>;
    expectTypeOf<LaptopRow['default_weekly_payment']>().toEqualTypeOf<number>();
  });

  it('no longer has weekly_payment', () => {
    type LaptopRow = Tables<'laptops'>;
    // @ts-expect-error — weekly_payment was renamed; accessing it should be a TS error
    const _: LaptopRow['weekly_payment'] = 0;
  });
});

// ─── payment_plans ───────────────────────────────────────────────────────────

describe('payment_plans table types', () => {
  it('has new Phase 2A columns', () => {
    type PlanRow = Tables<'payment_plans'>;
    expectTypeOf<PlanRow['down_payment']>().toEqualTypeOf<number>();
    expectTypeOf<PlanRow['end_date']>().toEqualTypeOf<string | null>();
    expectTypeOf<PlanRow['approved_by']>().toEqualTypeOf<string | null>();
    expectTypeOf<PlanRow['approved_at']>().toEqualTypeOf<string | null>();
    expectTypeOf<PlanRow['rejected_by']>().toEqualTypeOf<string | null>();
    expectTypeOf<PlanRow['rejected_at']>().toEqualTypeOf<string | null>();
  });
});

// ─── payments ────────────────────────────────────────────────────────────────

describe('payments table types', () => {
  it('has recorded_by from Phase 2B', () => {
    type PaymentRow = Tables<'payments'>;
    expectTypeOf<PaymentRow['recorded_by']>().toEqualTypeOf<string | null>();
  });
});

// ─── stock_movements ─────────────────────────────────────────────────────────

describe('stock_movements table types', () => {
  it('laptop_id is nullable (Phase 1D — SET NULL on delete)', () => {
    type StockRow = Tables<'stock_movements'>;
    expectTypeOf<StockRow['laptop_id']>().toEqualTypeOf<string | null>();
  });

  it('has payment_plan_id from Phase 2E', () => {
    type StockRow = Tables<'stock_movements'>;
    expectTypeOf<StockRow['payment_plan_id']>().toEqualTypeOf<string | null>();
  });
});

// ─── payment_schedule ────────────────────────────────────────────────────────

describe('payment_schedule table types (new — Phase 2F)', () => {
  it('has all required columns', () => {
    type ScheduleRow = Tables<'payment_schedule'>;
    expectTypeOf<ScheduleRow['id']>().toEqualTypeOf<string>();
    expectTypeOf<ScheduleRow['payment_plan_id']>().toEqualTypeOf<string>();
    expectTypeOf<ScheduleRow['week_number']>().toEqualTypeOf<number>();
    expectTypeOf<ScheduleRow['due_date']>().toEqualTypeOf<string>();
    expectTypeOf<ScheduleRow['amount_due']>().toEqualTypeOf<number>();
    expectTypeOf<ScheduleRow['status']>().toEqualTypeOf<string>();
    expectTypeOf<ScheduleRow['payment_id']>().toEqualTypeOf<string | null>();
    expectTypeOf<ScheduleRow['paid_at']>().toEqualTypeOf<string | null>();
  });

  it('Insert type has sensible defaults (status optional)', () => {
    type ScheduleInsert = TablesInsert<'payment_schedule'>;
    // status has a DB default, so it should be optional in Insert
    expectTypeOf<ScheduleInsert['status']>().toEqualTypeOf<string | undefined>();
  });
});

// ─── notifications ───────────────────────────────────────────────────────────

describe('notifications table types (new — Phase 2G)', () => {
  it('has all required columns', () => {
    type NotifRow = Tables<'notifications'>;
    expectTypeOf<NotifRow['id']>().toEqualTypeOf<string>();
    expectTypeOf<NotifRow['client_id']>().toEqualTypeOf<string>();
    expectTypeOf<NotifRow['title']>().toEqualTypeOf<string>();
    expectTypeOf<NotifRow['message']>().toEqualTypeOf<string>();
    expectTypeOf<NotifRow['type']>().toEqualTypeOf<string>();
    expectTypeOf<NotifRow['is_read']>().toEqualTypeOf<boolean>();
    expectTypeOf<NotifRow['read_at']>().toEqualTypeOf<string | null>();
    expectTypeOf<NotifRow['category']>().toEqualTypeOf<string | null>();
  });
});

// ─── notification_preferences ────────────────────────────────────────────────

describe('notification_preferences table types (new — Phase 2H)', () => {
  it('has all preference flags', () => {
    type PrefRow = Tables<'notification_preferences'>;
    expectTypeOf<PrefRow['payment_reminders']>().toEqualTypeOf<boolean>();
    expectTypeOf<PrefRow['payment_confirmations']>().toEqualTypeOf<boolean>();
    expectTypeOf<PrefRow['plan_updates']>().toEqualTypeOf<boolean>();
    expectTypeOf<PrefRow['system_updates']>().toEqualTypeOf<boolean>();
    expectTypeOf<PrefRow['sms_enabled']>().toEqualTypeOf<boolean>();
    expectTypeOf<PrefRow['reminder_days_before']>().toEqualTypeOf<number>();
  });
});

// ─── audit_log ───────────────────────────────────────────────────────────────

describe('audit_log table types (new — Phase 2I)', () => {
  it('has core audit columns', () => {
    type AuditRow = Tables<'audit_log'>;
    expectTypeOf<AuditRow['id']>().toEqualTypeOf<string>();
    expectTypeOf<AuditRow['action_type']>().toEqualTypeOf<string>();
    expectTypeOf<AuditRow['entity_type']>().toEqualTypeOf<string | null>();
    expectTypeOf<AuditRow['entity_id']>().toEqualTypeOf<string | null>();
    expectTypeOf<AuditRow['performed_by']>().toEqualTypeOf<string | null>();
  });
});
