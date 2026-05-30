/**
 * Tests for notificationService.ts
 *
 * Covers:
 *   1. fetchNotifications         — loads from DB, newest first
 *   2. fetchUnreadCount           — count query
 *   3. markNotificationRead       — sets is_read + read_at
 *   4. markAllNotificationsRead   — bulk update scoped to client
 *   5. fetchNotificationPreferences — maybeSingle, returns null if none
 *   6. updateNotificationPreferences — merges partial prefs
 *   7. subscribeToNotifications   — sets up realtime channel, returns unsubscribe fn
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  subscribeToNotifications,
} from '@/services/notificationService';

const CLIENT_ID = 'client-abc';

// ─── 1. fetchNotifications ───────────────────────────────────────────────────

describe('fetchNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries notifications table filtered by client_id, ordered newest first', async () => {
    const mockNotifs = [
      { id: 'n-2', client_id: CLIENT_ID, title: 'Payment Received', is_read: false, created_at: '2026-05-29T10:00:00Z', type: 'payment_received', message: 'ok' },
      { id: 'n-1', client_id: CLIENT_ID, title: 'Plan Approved', is_read: true,  created_at: '2026-05-28T08:00:00Z', type: 'plan_approved', message: 'ok' },
    ];
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockNotifs, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchNotifications(CLIENT_ID);

    expect(supabase.from).toHaveBeenCalledWith('notifications');
    expect(chain.eq).toHaveBeenCalledWith('client_id', CLIENT_ID);
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('n-2');
  });
});

// ─── 2. fetchUnreadCount ─────────────────────────────────────────────────────

describe('fetchUnreadCount', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the correct unread count', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    // Second .eq call resolves with count
    const secondEq = vi.fn().mockResolvedValue({ count: 3, error: null });
    chain.eq
      .mockReturnValueOnce(chain)        // .eq('client_id', ...)
      .mockReturnValueOnce({ count: 3, error: null }); // .eq('is_read', false)

    // Simpler: just mock the whole chain terminal
    const countChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    countChain.eq
      .mockReturnValueOnce(countChain)
      .mockResolvedValueOnce({ count: 3, error: null });

    vi.mocked(supabase.from).mockReturnValueOnce(countChain as never);

    const count = await fetchUnreadCount(CLIENT_ID);

    expect(count).toBe(3);
  });

  it('returns 0 when query errors', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    chain.eq
      .mockReturnValueOnce(chain)
      .mockResolvedValueOnce({ count: null, error: { message: 'DB error' } });

    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const count = await fetchUnreadCount(CLIENT_ID);
    expect(count).toBe(0);
  });
});

// ─── 3. markNotificationRead ─────────────────────────────────────────────────

describe('markNotificationRead', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates is_read=true and sets read_at on the specific notification', async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await markNotificationRead('n-1');

    expect(supabase.from).toHaveBeenCalledWith('notifications');
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ is_read: true, read_at: expect.any(String) })
    );
    expect(chain.eq).toHaveBeenCalledWith('id', 'n-1');
  });

  it('throws if DB returns an error', async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'RLS denied' } }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await expect(markNotificationRead('n-bad')).rejects.toMatchObject({ message: 'RLS denied' });
  });
});

// ─── 4. markAllNotificationsRead ────────────────────────────────────────────

describe('markAllNotificationsRead', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bulk-updates only unread notifications for the client', async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    // Last eq call resolves
    const lastEq = vi.fn().mockResolvedValue({ data: null, error: null });
    chain.eq
      .mockReturnValueOnce(chain)       // .eq('client_id', ...)
      .mockImplementationOnce(lastEq);   // .eq('is_read', false)

    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await markAllNotificationsRead(CLIENT_ID);

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ is_read: true, read_at: expect.any(String) })
    );
    // Must filter by client AND unread
    expect(chain.eq).toHaveBeenCalledWith('client_id', CLIENT_ID);
    expect(chain.eq).toHaveBeenCalledWith('is_read', false);
  });
});

// ─── 5. fetchNotificationPreferences ────────────────────────────────────────

describe('fetchNotificationPreferences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns preferences when they exist', async () => {
    const mockPrefs = {
      id: 'pref-1',
      client_id: CLIENT_ID,
      payment_reminders: true,
      payment_confirmations: true,
      plan_updates: true,
      system_updates: true,
      sms_enabled: false,
      reminder_days_before: 3,
      updated_at: '2026-05-29T00:00:00Z',
    };
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockPrefs, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchNotificationPreferences(CLIENT_ID);

    expect(supabase.from).toHaveBeenCalledWith('notification_preferences');
    expect(result).not.toBeNull();
    expect(result!.sms_enabled).toBe(false);
    expect(result!.reminder_days_before).toBe(3);
  });

  it('returns null when no preferences row exists yet', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    const result = await fetchNotificationPreferences('client-new');
    expect(result).toBeNull();
  });
});

// ─── 6. updateNotificationPreferences ───────────────────────────────────────

describe('updateNotificationPreferences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates prefs for the correct client and merges updated_at', async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(chain as never);

    await updateNotificationPreferences(CLIENT_ID, { sms_enabled: false, reminder_days_before: 7 });

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        sms_enabled: false,
        reminder_days_before: 7,
        updated_at: expect.any(String),
      })
    );
    expect(chain.eq).toHaveBeenCalledWith('client_id', CLIENT_ID);
  });
});

// ─── 7. subscribeToNotifications ────────────────────────────────────────────

describe('subscribeToNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a realtime channel filtered to the client, returns unsubscribe fn', () => {
    const onFn = vi.fn().mockReturnThis();
    const subscribeFn = vi.fn().mockReturnThis();
    const mockChannel = { on: onFn, subscribe: subscribeFn };

    vi.mocked(supabase.channel).mockReturnValueOnce(mockChannel as never);

    const onNew = vi.fn();
    const unsubscribe = subscribeToNotifications(CLIENT_ID, onNew);

    // Channel named to scope to this client
    expect(supabase.channel).toHaveBeenCalledWith(`notifications:client:${CLIENT_ID}`);

    // Listens to INSERT on notifications table filtered by client_id
    expect(onFn).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `client_id=eq.${CLIENT_ID}`,
      }),
      expect.any(Function)
    );

    expect(subscribeFn).toHaveBeenCalled();

    // Calling unsubscribe removes the channel
    unsubscribe();
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
