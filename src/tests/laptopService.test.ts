/**
 * Tests for laptopService.ts
 *
 * Covers:
 *   1. fetchLaptops       — queries active laptops, ordered by created_at desc
 *   2. fetchLaptopById    — finds active laptop by id, returns null if not found
 *   3. searchLaptops      — filters by search term and/or price band
 *                           price bands: budget (≤4000), mid (4000–6500), premium (>6500)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { fetchLaptops, fetchLaptopById, searchLaptops } from '@/services/laptopService';

// ── shared fixture ──────────────────────────────────────────────────────────
const makeLaptop = (overrides = {}) => ({
  id: 'lap-1',
  name: 'Dell XPS 15',
  brand: 'Dell',
  model: 'XPS 15',
  price: 12000,
  default_weekly_payment: 400,
  status: 'active',
  stock_quantity: 5,
  processor: 'Intel i7',
  ram: '16GB',
  storage: '512GB SSD',
  display: '15.6"',
  condition: 'new',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

// ── helper: build a fluent Supabase mock chain ───────────────────────────────
// Each method returns the same chain object; the last method called
// resolves with { data, error }.
const makeChain = (data: unknown, error: unknown = null) => {
  const resolved = Promise.resolve({ data, error });
  const chain: Record<string, unknown> = {};
  const methods = ['select','eq','or','lte','gte','gt','order','maybeSingle','single'];
  methods.forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  // terminal methods return the resolved promise
  (chain['order'] as ReturnType<typeof vi.fn>).mockReturnValue(resolved);
  (chain['maybeSingle'] as ReturnType<typeof vi.fn>).mockReturnValue(resolved);
  (chain['single'] as ReturnType<typeof vi.fn>).mockReturnValue(resolved);
  return chain;
};

// ─── 1. fetchLaptops ────────────────────────────────────────────────────────

describe('fetchLaptops', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries active laptops ordered by created_at descending', async () => {
    const laptops = [makeLaptop(), makeLaptop({ id: 'lap-2', name: 'MacBook Pro' })];
    const chain = makeChain(laptops);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchLaptops();

    expect(supabase.from).toHaveBeenCalledWith('laptops');
    expect(chain.eq).toHaveBeenCalledWith('status', 'active');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Dell XPS 15');
  });

  it('returns empty array when there are no active laptops', async () => {
    const chain = makeChain(null);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchLaptops();
    expect(result).toEqual([]);
  });

  it('throws with a readable message on DB error', async () => {
    const chain = makeChain(null, { message: 'connection refused' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(fetchLaptops()).rejects.toThrow('Failed to fetch laptops');
  });
});

// ─── 2. fetchLaptopById ──────────────────────────────────────────────────────

describe('fetchLaptopById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a laptop when found', async () => {
    const laptop = makeLaptop({ id: 'lap-abc' });
    const chain = makeChain(laptop);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchLaptopById('lap-abc');

    expect(supabase.from).toHaveBeenCalledWith('laptops');
    expect(chain.eq).toHaveBeenCalledWith('id', 'lap-abc');
    expect(chain.eq).toHaveBeenCalledWith('status', 'active');
    expect(chain.maybeSingle).toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result!.id).toBe('lap-abc');
  });

  it('returns null when laptop does not exist or is not active', async () => {
    const chain = makeChain(null);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchLaptopById('lap-missing');
    expect(result).toBeNull();
  });

  it('throws on DB error', async () => {
    const chain = makeChain(null, { message: 'row level security' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(fetchLaptopById('lap-x')).rejects.toThrow('Failed to fetch laptop');
  });
});

// ─── 3. searchLaptops ────────────────────────────────────────────────────────

describe('searchLaptops', () => {
  beforeEach(() => vi.clearAllMocks());

  it('applies ilike OR filter when searchTerm is provided', async () => {
    const chain = makeChain([makeLaptop()]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await searchLaptops('dell');

    expect(chain.or).toHaveBeenCalledWith(
      expect.stringContaining('%dell%')
    );
    // Should include name, brand, model
    const orArg = (chain.or as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(orArg).toContain('name.ilike');
    expect(orArg).toContain('brand.ilike');
    expect(orArg).toContain('model.ilike');
  });

  it('does NOT apply or() filter when searchTerm is empty', async () => {
    const chain = makeChain([makeLaptop()]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await searchLaptops('');

    expect(chain.or).not.toHaveBeenCalled();
  });

  it('applies lte(4000) for budget price filter', async () => {
    const chain = makeChain([]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await searchLaptops('', 'budget');

    expect(chain.lte).toHaveBeenCalledWith('price', 4000);
    expect(chain.gte).not.toHaveBeenCalled();
    expect(chain.gt).not.toHaveBeenCalled();
  });

  it('applies gte(4000) and lte(6500) for mid price filter', async () => {
    const chain = makeChain([]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await searchLaptops('', 'mid');

    expect(chain.gte).toHaveBeenCalledWith('price', 4000);
    expect(chain.lte).toHaveBeenCalledWith('price', 6500);
  });

  it('applies gt(6500) for premium price filter', async () => {
    const chain = makeChain([]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await searchLaptops('', 'premium');

    expect(chain.gt).toHaveBeenCalledWith('price', 6500);
  });

  it('applies no price filter when priceFilter is "all"', async () => {
    const chain = makeChain([]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await searchLaptops('', 'all');

    expect(chain.lte).not.toHaveBeenCalled();
    expect(chain.gte).not.toHaveBeenCalled();
    expect(chain.gt).not.toHaveBeenCalled();
  });

  it('can combine searchTerm with price filter', async () => {
    const chain = makeChain([makeLaptop({ price: 12000 })]);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await searchLaptops('dell', 'premium');

    expect(chain.or).toHaveBeenCalled();
    expect(chain.gt).toHaveBeenCalledWith('price', 6500);
    expect(result).toHaveLength(1);
  });

  it('returns empty array on null data', async () => {
    const chain = makeChain(null);
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await searchLaptops('nothing');
    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    const chain = makeChain(null, { message: 'timeout' });
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(searchLaptops('dell')).rejects.toThrow('Failed to search laptops');
  });
});
