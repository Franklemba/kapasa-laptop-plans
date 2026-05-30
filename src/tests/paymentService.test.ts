/**
 * Tests for paymentService.ts
 *
 * Covers:
 *   1. recordPayment  — uses record_payment_atomic RPC (atomic, no race conditions)
 *   2. fetchPaymentsByClient — fixed PostgREST join (was broken embedded filter)
 *   3. fetchPaymentsByPlan  — basic plan-scoped query
 *   4. fetchPaymentSchedule — new payment_schedule table
 *   5. getPaymentSummary    — computes correct derived values
 *   6. deletePayment        — re-derives amount_paid after delete
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

import {
  recordPayment,
  fetchPaymentsByClient,
  fetchPaymentsByPlan,
  fetchPaymentSchedule,
  getPaymentSummary,
  deletePayment,
} from '@/services/paymentService';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Makes the fluent Supabase chain return `data` / `error` at the end. */
const mockChain = (data: unknown, error: unknown = null) => {
  const terminal = { data, error };
  const chain: Record<string, unknown> = {};
  const chainMethods = ['select','insert','update','delete','eq','in','order','single','maybeSingle'];
  chainMethods.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain); });
  // The last method called (single / order / eq …) resolves with terminal
  chainMethods.forEach(m => {
    (chain[m] as ReturnType<typeof vi.fn>).mockReturnValue({ ...chain, ...terminal });
  });
  return chain;
};

// ─── 1. recordPayment ────────────────────────────────────────────────────────

describe('recordPayment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls record_payment_atomic RPC with correct args', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: {
        success: true,
        payment_id: 'pay-1',
        new_amount_paid: 92,
        new_status: 'active',
        is_completed: false,
      },
      error: null,
    } as never);

    const result = await recordPayment({
      payment_plan_id: 'plan-1',
      amount: 46,
      payment_method: 'cash',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('record_payment_atomic', {
      p_payment_plan_id: 'plan-1',
      p_amount: 46,
      p_payment_method: 'cash',
    });

    expect(result.success).toBe(true);
    expect(result.newAmountPaid).toBe(92);
    expect(result.newStatus).toBe('active');
    expect(result.isCompleted).toBe(false);
  });

  it('marks plan as completed when fully paid', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: {
        success: true,
        payment_id: 'pay-2',
        new_amount_paid: 2392,
        new_status: 'completed',
        is_completed: true,
      },
      error: null,
    } as never);

    const result = await recordPayment({ payment_plan_id: 'plan-1', amount: 2392 });

    expect(result.isCompleted).toBe(true);
    expect(result.newStatus).toBe('completed');
  });

  it('throws when RPC returns an error', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: 'Payment plan is already completed' },
    } as never);

    await expect(recordPayment({ payment_plan_id: 'plan-1', amount: 46 }))
      .rejects.toMatchObject({ message: 'Payment plan is already completed' });
  });

  it('does NOT make 3 separate DB calls (old non-atomic pattern)', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: { success: true, payment_id: 'p', new_amount_paid: 46, new_status: 'active', is_completed: false },
      error: null,
    } as never);

    await recordPayment({ payment_plan_id: 'plan-1', amount: 46 });

    // Only one DB call total — the RPC
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});

// ─── 2. fetchPaymentsByClient ────────────────────────────────────────────────

describe('fetchPaymentsByClient', () => {
  beforeEach(() => vi.clearAllMocks());

  it('first fetches plan IDs, then queries payments with .in()', async () => {
    // Step 1: payment_plans query returns plan IDs
    const plansChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [{ id: 'plan-1' }, { id: 'plan-2' }], error: null }),
    };
    // Step 2: payments query with .in()
    const paymentsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'pay-1', payment_plan_id: 'plan-1', amount: 46 },
          { id: 'pay-2', payment_plan_id: 'plan-2', amount: 46 },
        ],
        error: null,
      }),
    };

    vi.mocked(supabase.from)
      .mockReturnValueOnce(plansChain as never)
      .mockReturnValueOnce(paymentsChain as never);

    const result = await fetchPaymentsByClient('client-1');

    // Verify the fixed approach: plans first, then .in() on payment_plan_id
    expect(supabase.from).toHaveBeenNthCalledWith(1, 'payment_plans');
    expect(plansChain.eq).toHaveBeenCalledWith('client_id', 'client-1');

    expect(supabase.from).toHaveBeenNthCalledWith(2, 'payments');
    expect(paymentsChain.in).toHaveBeenCalledWith('payment_plan_id', ['plan-1', 'plan-2']);

    expect(result).toHaveLength(2);
  });

  it('returns empty array when client has no plans', async () => {
    const plansChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(plansChain as never);

    const result = await fetchPaymentsByClient('client-no-plans');

    expect(result).toEqual([]);
    // Should NOT make a second query to payments
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});

// ─── 3. fetchPaymentsByPlan ──────────────────────────────────────────────────

describe('fetchPaymentsByPlan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries payments filtered by payment_plan_id', async () => {
    const mockPayments = [
      { id: 'pay-1', payment_plan_id: 'plan-1', amount: 46, payment_date: '2026-01-01' },
    ];
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockPayments, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchPaymentsByPlan('plan-1');

    expect(supabase.from).toHaveBeenCalledWith('payments');
    expect(chain.eq).toHaveBeenCalledWith('payment_plan_id', 'plan-1');
    expect(result).toEqual(mockPayments);
  });
});

// ─── 4. fetchPaymentSchedule ─────────────────────────────────────────────────

describe('fetchPaymentSchedule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries payment_schedule ordered by week_number', async () => {
    const mockSchedule = [
      { id: 's-1', payment_plan_id: 'plan-1', week_number: 1, due_date: '2026-01-01', amount_due: 46, status: 'paid' },
      { id: 's-2', payment_plan_id: 'plan-1', week_number: 2, due_date: '2026-01-08', amount_due: 46, status: 'overdue' },
      { id: 's-3', payment_plan_id: 'plan-1', week_number: 3, due_date: '2026-01-15', amount_due: 46, status: 'pending' },
    ];
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockSchedule, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchPaymentSchedule('plan-1');

    expect(supabase.from).toHaveBeenCalledWith('payment_schedule');
    expect(chain.eq).toHaveBeenCalledWith('payment_plan_id', 'plan-1');
    expect(chain.order).toHaveBeenCalledWith('week_number', { ascending: true });
    expect(result).toHaveLength(3);
    expect(result[0].status).toBe('paid');
    expect(result[1].status).toBe('overdue');
  });

  it('returns empty array when no schedule rows exist', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchPaymentSchedule('plan-new');
    expect(result).toEqual([]);
  });
});

// ─── 5. getPaymentSummary ────────────────────────────────────────────────────

describe('getPaymentSummary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('computes derived values correctly for a partially paid plan', async () => {
    const planChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { total_amount: 2392, amount_paid: 46, weekly_payment: 46, plan_duration: 52, end_date: null },
        error: null,
      }),
    };
    const paymentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ amount: 46, payment_date: '2026-01-01' }],
        error: null,
      }),
    };

    vi.mocked(supabase.from)
      .mockReturnValueOnce(planChain as never)
      .mockReturnValueOnce(paymentsChain as never);

    const summary = await getPaymentSummary('plan-1');

    expect(summary.totalAmount).toBe(2392);
    expect(summary.amountPaid).toBe(46);
    expect(summary.remainingAmount).toBe(2346);
    expect(summary.percentagePaid).toBeCloseTo(1.92, 1);
    expect(summary.paymentsCount).toBe(1);
    expect(summary.paymentsRemaining).toBe(51); // ceil(2346/46)
    expect(summary.expectedPayments).toBe(52);
  });
});

// ─── 6. deletePayment ────────────────────────────────────────────────────────

describe('deletePayment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches payment, deletes it, then updates plan amount_paid', async () => {
    // fetch payment
    const fetchChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { payment_plan_id: 'plan-1', amount: 46 },
        error: null,
      }),
    };
    // fetch plan
    const planChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { amount_paid: 92, total_amount: 2392 },
        error: null,
      }),
    };
    // delete
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    // update plan
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    vi.mocked(supabase.from)
      .mockReturnValueOnce(fetchChain as never)  // payments select
      .mockReturnValueOnce(planChain as never)   // payment_plans select
      .mockReturnValueOnce(deleteChain as never) // payments delete
      .mockReturnValueOnce(updateChain as never); // payment_plans update

    const result = await deletePayment('pay-1');

    expect(result.success).toBe(true);
    // Verify plan update: 92 - 46 = 46 paid, still active
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount_paid: 46, status: 'active' })
    );
  });

  it('clamps amount_paid at 0 if somehow goes negative', async () => {
    const fetchChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { payment_plan_id: 'plan-1', amount: 9999 }, error: null }),
    };
    const planChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { amount_paid: 46, total_amount: 2392 }, error: null }),
    };
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(supabase.from)
      .mockReturnValueOnce(fetchChain as never)
      .mockReturnValueOnce(planChain as never)
      .mockReturnValueOnce(deleteChain as never)
      .mockReturnValueOnce(updateChain as never);

    await deletePayment('pay-bad');

    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount_paid: 0 })
    );
  });
});
