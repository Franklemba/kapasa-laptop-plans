import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ─── Global Supabase mock ────────────────────────────────────────────────────
// All tests import the mock via vi.mock('@/integrations/supabase/client')
// and shape it per-test with mockReturnValue / mockResolvedValue.

vi.mock('@/integrations/supabase/client', () => {
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };

  const supabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    rpc: vi.fn(),
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
  };

  return { supabase };
});
