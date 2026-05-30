/**
 * Tests for paymentPlanService.ts
 *
 * Covers:
 *   1. submitPaymentPlanApplication — creates plan with correct calculated values
 *   2. fetchClientPaymentPlans      — fetches plans with laptop join for a client
 *   3. fetchPendingPaymentPlans     — admin fetch with client + laptop joins
 *   4. approvePaymentPlan           — sets status to 'active'
 *   5. rejectPaymentPlan            — sets status to 'cancelled'
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import {
  submitPaymentPlanApplication,
  fetchClientPaymentPlans,
  fetchPendingPaymentPlans,
  approvePaymentPlan,
  rejectPaymentPlan,
} from '@/services/paymentPlanService';

// ── fixture ──────────────────────────────────────────────────────────────────

const applicationData = {
  bankName: 'Zanaco',
  accountType: 'savings',
  monthlyExpenses: '2000',
  employer: 'fiTech Ltd',
  jobTitle: 'Engineer',
  employmentLength: '3 years',
  dateOfBirth: '1990-05-15',
  reasonForPurchase: 'Work',
  hasAppliedBefore: false,
  agreeToTerms: true,
  agreeToCredit: true,
  firstName: 'Frank',
  lastName: 'Lemba',
  email: 'fitech@gmail.com',
  phone: '+260971234567',
  street: '12 Cairo Road',
  city: 'Lusaka',
  state: 'Lusaka Province',
  zipCode: '10101',
};

const paymentDetails = {
  weeklyPayment: '46',
  downPayment: '100',
  loanTerm: '52',
};

// ── helper: fluent chain builder ─────────────────────────────────────────────

const makeChain = (data: unknown, error: unknown = null) => {
  const resolved = Promise.resolve({ data, error });
  const chain: Record<string, unknown> = {};
  ['select','insert','update','eq','order','single','maybeSingle'].forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  (chain['single'] as ReturnType<typeof vi.fn>).mockReturnValue(resolved);
  (chain['order'] as ReturnType<typeof vi.fn>).mockReturnValue(resolved);
  return chain;
};

// ─── 1. submitPaymentPlanApplication ────────────────────────────────────────

describe('submitPaymentPlanApplication', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calculates totalAmount = (weeklyPayment × loanTerm) + downPayment', async () => {
    const newPlan = { id: 'plan-new', status: 'pending' };
    const chain = makeChain(newPlan);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await submitPaymentPlanApplication(
      'client-1', 'lap-1', applicationData, paymentDetails
    );

    // 46 × 52 + 100 = 2492
    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.total_amount).toBe(2492);
    expect(insertedPayload.weekly_payment).toBe(46);
    expect(insertedPayload.plan_duration).toBe(52);
  });

  it('sets down_payment as amount_paid immediately', async () => {
    const chain = makeChain({ id: 'plan-1', status: 'pending' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await submitPaymentPlanApplication(
      'client-1', 'lap-1', applicationData, paymentDetails
    );

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.amount_paid).toBe(100); // down payment = already paid
  });

  it('sets status to "pending" (awaits admin approval)', async () => {
    const chain = makeChain({ id: 'plan-1', status: 'pending' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await submitPaymentPlanApplication(
      'client-1', 'lap-1', applicationData, paymentDetails
    );

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.status).toBe('pending');
    expect(insertedPayload.client_id).toBe('client-1');
    expect(insertedPayload.laptop_id).toBe('lap-1');
  });

  it('treats missing downPayment as 0', async () => {
    const chain = makeChain({ id: 'plan-1' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await submitPaymentPlanApplication('client-1', 'lap-1', applicationData, {
      weeklyPayment: '46',
      downPayment: '',    // no down payment
      loanTerm: '52',
    });

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.amount_paid).toBe(0);
    expect(insertedPayload.total_amount).toBe(2392); // 46 × 52 + 0
  });

  it('returns success: true with the applicationId', async () => {
    const chain = makeChain({ id: 'plan-abc', status: 'pending' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await submitPaymentPlanApplication(
      'client-1', 'lap-1', applicationData, paymentDetails
    );

    expect(result.success).toBe(true);
    expect(result.applicationId).toBe('plan-abc');
  });

  it('throws when DB insert fails', async () => {
    const chain = makeChain(null, { message: 'foreign key violation' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(
      submitPaymentPlanApplication('client-1', 'lap-1', applicationData, paymentDetails)
    ).rejects.toThrow('foreign key violation');
  });
});

// ─── 2. fetchClientPaymentPlans ──────────────────────────────────────────────

describe('fetchClientPaymentPlans', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches plans with laptop join for the given client', async () => {
    const plans = [
      { id: 'plan-1', client_id: 'client-1', status: 'active', laptop: { name: 'Dell XPS 15' } },
      { id: 'plan-2', client_id: 'client-1', status: 'pending', laptop: { name: 'MacBook Pro' } },
    ];
    const chain = makeChain(plans);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchClientPaymentPlans('client-1');

    expect(supabase.from).toHaveBeenCalledWith('payment_plans');
    expect(chain.select).toHaveBeenCalledWith(expect.stringContaining('laptop:laptops(*)'));
    expect(chain.eq).toHaveBeenCalledWith('client_id', 'client-1');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(2);
  });

  it('returns empty array when client has no plans', async () => {
    const chain = makeChain([]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchClientPaymentPlans('client-new');
    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    const chain = makeChain(null, { message: 'permission denied' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(fetchClientPaymentPlans('client-1')).rejects.toMatchObject({
      message: 'permission denied',
    });
  });
});

// ─── 3. fetchPendingPaymentPlans ─────────────────────────────────────────────

describe('fetchPendingPaymentPlans', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches only pending plans with client and laptop joins', async () => {
    const pending = [
      {
        id: 'plan-p1',
        status: 'pending',
        client: { first_name: 'Frank', email: 'fitech@gmail.com' },
        laptop: { name: 'Dell XPS 15' },
      },
    ];
    const chain = makeChain(pending);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchPendingPaymentPlans();

    expect(supabase.from).toHaveBeenCalledWith('payment_plans');
    expect(chain.select).toHaveBeenCalledWith(
      expect.stringContaining('client:clients(*)')
    );
    expect(chain.select).toHaveBeenCalledWith(
      expect.stringContaining('laptop:laptops(*)')
    );
    expect(chain.eq).toHaveBeenCalledWith('status', 'pending');
    expect(result).toHaveLength(1);
  });

  it('returns empty array when no pending plans exist', async () => {
    const chain = makeChain([]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchPendingPaymentPlans();
    expect(result).toEqual([]);
  });
});

// ─── 4. approvePaymentPlan ───────────────────────────────────────────────────

describe('approvePaymentPlan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates status to "active" for the given plan id', async () => {
    const approvedPlan = { id: 'plan-1', status: 'active' };
    const chain = makeChain(approvedPlan);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await approvePaymentPlan('plan-1');

    expect(supabase.from).toHaveBeenCalledWith('payment_plans');
    expect(chain.update).toHaveBeenCalledWith({ status: 'active' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'plan-1');
    expect(result).toEqual(approvedPlan);
  });

  it('throws when plan is not found or DB errors', async () => {
    const chain = makeChain(null, { message: 'no rows returned' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(approvePaymentPlan('plan-missing')).rejects.toMatchObject({
      message: 'no rows returned',
    });
  });
});

// ─── 5. rejectPaymentPlan ────────────────────────────────────────────────────

describe('rejectPaymentPlan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates status to "cancelled" for the given plan id', async () => {
    const rejectedPlan = { id: 'plan-1', status: 'cancelled' };
    const chain = makeChain(rejectedPlan);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await rejectPaymentPlan('plan-1');

    expect(supabase.from).toHaveBeenCalledWith('payment_plans');
    expect(chain.update).toHaveBeenCalledWith({ status: 'cancelled' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'plan-1');
    expect(result).toEqual(rejectedPlan);
  });

  it('throws on DB error', async () => {
    const chain = makeChain(null, { message: 'connection timeout' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(rejectPaymentPlan('plan-1')).rejects.toMatchObject({
      message: 'connection timeout',
    });
  });

  it('approve and reject set different statuses', async () => {
    const approveChain = makeChain({ id: 'plan-1', status: 'active' });
    const rejectChain = makeChain({ id: 'plan-2', status: 'cancelled' });
    vi.mocked(supabase.from)
      .mockReturnValueOnce(approveChain as never)
      .mockReturnValueOnce(rejectChain as never);

    const approved = await approvePaymentPlan('plan-1');
    const rejected = await rejectPaymentPlan('plan-2');

    expect(approved.status).toBe('active');
    expect(rejected.status).toBe('cancelled');
  });
});
