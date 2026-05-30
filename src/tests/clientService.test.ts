/**
 * Tests for clientService.ts
 *
 * Covers:
 *   1. createClientProfile — inserts a client row linked to auth user
 *      - maps form fields to DB columns correctly
 *      - converts string numbers (monthlyIncome, creditScore) to numeric
 *      - passes null for empty optional fields
 *      - throws on DB error (e.g. duplicate email, RLS)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { createClientProfile } from '@/services/clientService';

// ── fixtures ────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'auth-user-123',
  email: 'fitech@gmail.com',
};

const fullFormData = {
  firstName: 'Frank',
  lastName: 'Lemba',
  phone: '+260971234567',
  address: '12 Cairo Road',
  nationalId: '123456/78/1',
  employmentStatus: 'employed',
  monthlyIncome: '5000',
  creditScore: '720',
  notes: 'Good standing',
};

const minimalFormData = {
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '',
  address: '',
  nationalId: '',
  employmentStatus: '',
  monthlyIncome: '',
  creditScore: '',
  notes: '',
};

// ── helper ──────────────────────────────────────────────────────────────────

const makeInsertChain = (data: unknown, error: unknown = null) => {
  const chain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue({ data, error }),
  };
  return chain;
};

// ─── createClientProfile ────────────────────────────────────────────────────

describe('createClientProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inserts a client row with all mapped fields', async () => {
    const createdClient = [{ id: 'client-1', email: mockUser.email }];
    const chain = makeInsertChain(createdClient);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await createClientProfile(mockUser, fullFormData);

    expect(supabase.from).toHaveBeenCalledWith('clients');
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'auth-user-123',
        email: 'fitech@gmail.com',
        first_name: 'Frank',
        last_name: 'Lemba',
        phone: '+260971234567',
        address: '12 Cairo Road',
        national_id: '123456/78/1',
        employment_status: 'employed',
        status: 'active',
      })
    );
    expect(result).toEqual(createdClient);
  });

  it('converts monthlyIncome and creditScore strings to numbers', async () => {
    const chain = makeInsertChain([{ id: 'client-1' }]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await createClientProfile(mockUser, fullFormData);

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.monthly_income).toBe(5000);
    expect(typeof insertedPayload.monthly_income).toBe('number');
    expect(insertedPayload.credit_score).toBe(720);
    expect(typeof insertedPayload.credit_score).toBe('number');
  });

  it('passes null for all empty optional fields', async () => {
    const chain = makeInsertChain([{ id: 'client-2' }]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await createClientProfile(mockUser, minimalFormData);

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.phone).toBeNull();
    expect(insertedPayload.address).toBeNull();
    expect(insertedPayload.national_id).toBeNull();
    expect(insertedPayload.employment_status).toBeNull();
    expect(insertedPayload.monthly_income).toBeNull();
    expect(insertedPayload.credit_score).toBeNull();
    expect(insertedPayload.notes).toBeNull();
  });

  it('always sets status to "active"', async () => {
    const chain = makeInsertChain([{ id: 'client-3' }]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await createClientProfile(mockUser, minimalFormData);

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.status).toBe('active');
  });

  it('always sets user_id from the auth user, not from formData', async () => {
    const chain = makeInsertChain([{ id: 'client-4' }]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await createClientProfile(mockUser, fullFormData);

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.user_id).toBe('auth-user-123');
  });

  it('uses empty string for email when user has no email', async () => {
    const userNoEmail = { id: 'auth-456', email: undefined };
    const chain = makeInsertChain([{ id: 'client-5' }]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await createClientProfile(userNoEmail, minimalFormData);

    const insertedPayload = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertedPayload.email).toBe('');
  });

  it('throws when DB returns an error (e.g. duplicate national_id)', async () => {
    const chain = makeInsertChain(null, {
      code: '23505',
      message: 'duplicate key value violates unique constraint',
    });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(createClientProfile(mockUser, fullFormData)).rejects.toMatchObject({
      message: 'duplicate key value violates unique constraint',
    });
  });

  it('throws when DB returns an RLS violation', async () => {
    const chain = makeInsertChain(null, {
      code: '42501',
      message: 'new row violates row-level security policy',
    });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(createClientProfile(mockUser, fullFormData)).rejects.toMatchObject({
      code: '42501',
    });
  });
});
