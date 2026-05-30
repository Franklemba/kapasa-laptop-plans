import { supabase } from "@/integrations/supabase/client";

export interface NotificationRow {
  id: string;
  client_id: string;
  title: string;
  message: string;
  type: 'payment_due' | 'payment_received' | 'plan_approved' | 'plan_rejected' | 'plan_completed' | 'system';
  category: string | null;
  is_read: boolean;
  read_at: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  client_id: string;
  payment_reminders: boolean;
  payment_confirmations: boolean;
  plan_updates: boolean;
  system_updates: boolean;
  sms_enabled: boolean;
  reminder_days_before: number;
  updated_at: string;
}

/**
 * Fetch all notifications for a client, newest first.
 */
export const fetchNotifications = async (clientId: string): Promise<NotificationRow[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data as NotificationRow[];
};

/**
 * Count unread notifications for a client.
 */
export const fetchUnreadCount = async (clientId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count ?? 0;
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a client.
 */
export const markAllNotificationsRead = async (clientId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('client_id', clientId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Fetch notification preferences for a client.
 */
export const fetchNotificationPreferences = async (
  clientId: string
): Promise<NotificationPreferences | null> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }

  return data as NotificationPreferences | null;
};

/**
 * Update notification preferences for a client.
 */
export const updateNotificationPreferences = async (
  clientId: string,
  prefs: Partial<Omit<NotificationPreferences, 'id' | 'client_id' | 'updated_at'>>
): Promise<void> => {
  const { error } = await supabase
    .from('notification_preferences')
    .update({ ...prefs, updated_at: new Date().toISOString() })
    .eq('client_id', clientId);

  if (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time new notifications for a client.
 * Returns an unsubscribe function — call it on component unmount.
 */
export const subscribeToNotifications = (
  clientId: string,
  onNewNotification: (notification: NotificationRow) => void
) => {
  const channel = supabase
    .channel(`notifications:client:${clientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `client_id=eq.${clientId}`,
      },
      (payload) => {
        onNewNotification(payload.new as NotificationRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
