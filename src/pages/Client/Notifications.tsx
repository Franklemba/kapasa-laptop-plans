import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { toast } from "@/hooks/use-toast";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useClientProfile } from "@/hooks/useClientProfile";
import {
  fetchNotifications,
  fetchNotificationPreferences,
  markNotificationRead,
  markAllNotificationsRead,
  updateNotificationPreferences,
  subscribeToNotifications,
  type NotificationRow,
  type NotificationPreferences,
} from "@/services/notificationService";

// Map DB notification type → display icon
const typeIcon = (type: NotificationRow['type']) => {
  switch (type) {
    case 'payment_due':     return Calendar;
    case 'payment_received': return CheckCircle;
    case 'plan_approved':   return CheckCircle;
    case 'plan_rejected':   return AlertCircle;
    case 'plan_completed':  return CreditCard;
    default:                return Info;
  }
};

// Map DB notification type → colour scheme
const typeColour = (type: NotificationRow['type']) => {
  switch (type) {
    case 'payment_due':     return { card: 'border-yellow-200 bg-yellow-50', icon: 'text-yellow-600' };
    case 'plan_rejected':   return { card: 'border-red-200 bg-red-50',    icon: 'text-red-600' };
    case 'payment_received':
    case 'plan_approved':
    case 'plan_completed':  return { card: 'border-green-200 bg-green-50', icon: 'text-green-600' };
    default:                return { card: 'border-blue-200 bg-blue-50',   icon: 'text-blue-600' };
  }
};

const formatTimestamp = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ─────────────────────────────────────────────
// Reusable notification card
// ─────────────────────────────────────────────
interface NotifCardProps {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
}

const NotifCard = ({ notification, onMarkRead }: NotifCardProps) => {
  const colours = typeColour(notification.type);
  const IconComponent = typeIcon(notification.type);

  return (
    <Card
      className={`transition-all duration-200 ${
        !notification.is_read
          ? `border-l-4 border-l-primary ${colours.card}`
          : 'hover:shadow-md'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-full ${colours.card}`}>
            <IconComponent className={`h-4 w-4 ${colours.icon}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatTimestamp(notification.created_at)}
                </p>
              </div>

              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkRead(notification.id)}
                  className="h-8 w-8 p-0"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const Notifications = () => {
  const { user } = useAuthCheck();
  const { profile } = useClientProfile(user?.id ?? null);

  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Load notifications + prefs ──────────────
  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const [notifs, preferences] = await Promise.all([
        fetchNotifications(profile.id),
        fetchNotificationPreferences(profile.id),
      ]);
      setNotifications(notifs);
      setPrefs(preferences);
    } catch {
      toast({ title: 'Error', description: 'Could not load notifications.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Real-time subscription ───────────────────
  useEffect(() => {
    if (!profile?.id) return;
    const unsubscribe = subscribeToNotifications(profile.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      toast({ title: newNotif.title, description: newNotif.message });
    });
    return unsubscribe;
  }, [profile?.id]);

  // ── Actions ──────────────────────────────────
  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch {
      toast({ title: 'Error', description: 'Could not mark notification as read.', variant: 'destructive' });
    }
  };

  const handleMarkAllRead = async () => {
    if (!profile?.id) return;
    try {
      await markAllNotificationsRead(profile.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      toast({ title: 'Success', description: 'All notifications marked as read.' });
    } catch {
      toast({ title: 'Error', description: 'Could not update notifications.', variant: 'destructive' });
    }
  };

  const handleSavePrefs = async () => {
    if (!profile?.id || !prefs) return;
    try {
      setSavingPrefs(true);
      await updateNotificationPreferences(profile.id, {
        payment_reminders:    prefs.payment_reminders,
        payment_confirmations: prefs.payment_confirmations,
        plan_updates:         prefs.plan_updates,
        system_updates:       prefs.system_updates,
        sms_enabled:          prefs.sms_enabled,
        reminder_days_before: prefs.reminder_days_before,
      });
      toast({ title: 'Settings Saved', description: 'Your notification preferences have been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Could not save preferences.', variant: 'destructive' });
    } finally {
      setSavingPrefs(false);
    }
  };

  // ── Filter helpers ───────────────────────────
  const byCategory = (category: string) =>
    notifications.filter((n) => {
      if (category === 'payment') {
        return ['payment_due', 'payment_received'].includes(n.type);
      }
      if (category === 'account') {
        return ['plan_approved', 'plan_rejected', 'plan_completed', 'system'].includes(n.type);
      }
      return true;
    });

  // ── Empty state ──────────────────────────────
  const EmptyState = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No notifications</h3>
        <p className="text-muted-foreground text-center">
          You're all caught up! Check back later for new updates.
        </p>
      </CardContent>
    </Card>
  );

  // ── Notification list ────────────────────────
  const NotifList = ({ items }: { items: NotificationRow[] }) => (
    items.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="space-y-3">
        {items.map((n) => (
          <NotifCard key={n.id} notification={n} onMarkRead={handleMarkRead} />
        ))}
      </div>
    )
  );

  return (
    <MobileLayout notifications={unreadCount}>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Notifications</h2>
              <p className="text-muted-foreground">
                Stay updated with your payment plan and account activities
              </p>
            </div>

            {unreadCount > 0 && (
              <Button onClick={handleMarkAllRead} variant="outline" className="self-start sm:self-auto">
                <Check className="h-4 w-4 mr-2" />
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="all">
                All
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <NotifList items={notifications} />
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <NotifList items={byCategory('payment')} />
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <NotifList items={byCategory('account')} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Manage how you receive notifications from fiTech
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {prefs ? (
                    <>
                      <div className="space-y-4">
                        {(
                          [
                            { key: 'payment_reminders',     label: 'Payment Reminders',    desc: 'Get notified before payments are due' },
                            { key: 'payment_confirmations', label: 'Payment Confirmations', desc: 'Get notified when payments are processed' },
                            { key: 'plan_updates',          label: 'Plan Updates',          desc: 'Approval, rejection, and completion alerts' },
                            { key: 'system_updates',        label: 'System Updates',        desc: 'Important account and security updates' },
                            { key: 'sms_enabled',           label: 'SMS Notifications',     desc: 'Receive notifications via text message' },
                          ] as const
                        ).map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium">{label}</label>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={prefs[key] as boolean}
                              onChange={(e) =>
                                setPrefs((prev) => prev ? { ...prev, [key]: e.target.checked } : prev)
                              }
                              className="h-4 w-4"
                            />
                          </div>
                        ))}

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Remind me (days before)</label>
                            <p className="text-xs text-muted-foreground">How many days before a due payment to notify you (1–14)</p>
                          </div>
                          <input
                            type="number"
                            min={1}
                            max={14}
                            value={prefs.reminder_days_before}
                            onChange={(e) =>
                              setPrefs((prev) =>
                                prev ? { ...prev, reminder_days_before: Math.min(14, Math.max(1, Number(e.target.value))) } : prev
                              )
                            }
                            className="h-8 w-16 rounded border px-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button onClick={handleSavePrefs} disabled={savingPrefs}>
                          {savingPrefs && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Save Preferences
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading preferences…</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileLayout>
  );
};

export default Notifications;
