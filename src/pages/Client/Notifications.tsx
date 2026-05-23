
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Check, 
  Trash2, 
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  CreditCard
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { toast } from "@/hooks/use-toast";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useClientProfile } from "@/hooks/useClientProfile";
import { fetchClientPaymentPlans } from "@/services/paymentPlanService";
import { fetchPaymentsByClient } from "@/services/paymentService";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  category: string;
  read: boolean;
  timestamp: string;
  icon: any;
}

const Notifications = () => {
  const { user } = useAuthCheck();
  const { profile } = useClientProfile(user?.id || null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [notificationSettings, setNotificationSettings] = useState({
    paymentReminders: true,
    paymentConfirmations: true,
    systemUpdates: true,
    marketingEmails: false,
    smsNotifications: true
  });

  useEffect(() => {
    if (profile?.id) {
      loadNotifications();
    }
  }, [profile?.id]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [plansData, paymentsData] = await Promise.all([
        fetchClientPaymentPlans(profile!.id),
        fetchPaymentsByClient(profile!.id)
      ]);

      const generatedNotifications = generateNotifications(plansData || [], paymentsData || []);
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (plans: any[], paymentsData: any[]): Notification[] => {
    const notifs: Notification[] = [];
    let notifId = 1;

    // Get active plans
    const activePlans = plans.filter(plan => plan.status === 'active');

    // Payment due notifications
    activePlans.forEach(plan => {
      const startDate = new Date(plan.start_date);
      const weeksPassed = Math.floor(plan.amount_paid / plan.weekly_payment);
      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setDate(startDate.getDate() + ((weeksPassed + 1) * 7));
      
      const today = new Date();
      const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Payment due soon (within 7 days)
      if (daysUntilPayment >= 0 && daysUntilPayment <= 7) {
        notifs.push({
          id: notifId++,
          title: "Payment Due Reminder",
          message: `Your weekly payment of ZMK ${plan.weekly_payment.toLocaleString()} is due in ${daysUntilPayment} day${daysUntilPayment !== 1 ? 's' : ''} (${nextPaymentDate.toLocaleDateString()})`,
          type: daysUntilPayment <= 3 ? "warning" : "info",
          category: "payment",
          read: false,
          timestamp: new Date().toISOString(),
          icon: Calendar
        });
      }

      // Payment overdue
      if (daysUntilPayment < 0) {
        notifs.push({
          id: notifId++,
          title: "Payment Overdue",
          message: `Your payment is overdue by ${Math.abs(daysUntilPayment)} day${Math.abs(daysUntilPayment) !== 1 ? 's' : ''}. Please make payment as soon as possible.`,
          type: "error",
          category: "payment",
          read: false,
          timestamp: new Date().toISOString(),
          icon: AlertCircle
        });
      }
    });

    // Recent payment confirmations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPayments = paymentsData
      .filter(payment => new Date(payment.payment_date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 5); // Show last 5 payments

    recentPayments.forEach(payment => {
      notifs.push({
        id: notifId++,
        title: "Payment Received",
        message: `Your payment of ZMK ${payment.amount.toLocaleString()} has been successfully processed on ${new Date(payment.payment_date).toLocaleDateString()}`,
        type: "success",
        category: "payment",
        read: false,
        timestamp: payment.payment_date,
        icon: CheckCircle
      });
    });

    // Pending application notifications
    const pendingPlans = plans.filter(plan => plan.status === 'pending');
    pendingPlans.forEach(plan => {
      notifs.push({
        id: notifId++,
        title: "Application Under Review",
        message: `Your payment plan application for ${plan.laptop?.name || 'laptop'} is being reviewed. We'll notify you once it's approved.`,
        type: "info",
        category: "system",
        read: false,
        timestamp: plan.created_at || new Date().toISOString(),
        icon: Info
      });
    });

    // Completed plan notifications
    const recentlyCompleted = plans.filter(plan => {
      if (plan.status !== 'completed') return false;
      const endDate = new Date(plan.end_date || plan.updated_at);
      return endDate >= thirtyDaysAgo;
    });

    recentlyCompleted.forEach(plan => {
      notifs.push({
        id: notifId++,
        title: "Payment Plan Completed!",
        message: `Congratulations! You've successfully completed your payment plan for ${plan.laptop?.name || 'your laptop'}. Thank you for your business!`,
        type: "success",
        category: "system",
        read: false,
        timestamp: plan.end_date || plan.updated_at || new Date().toISOString(),
        icon: CheckCircle
      });
    });

    // Welcome notification for new users (if no other notifications)
    if (notifs.length === 0 && plans.length === 0) {
      notifs.push({
        id: notifId++,
        title: "Welcome to fiTech",
        message: "Start browsing our laptop catalog and apply for a flexible payment plan today!",
        type: "info",
        category: "system",
        read: false,
        timestamp: new Date().toISOString(),
        icon: Info
      });
    }

    // Sort by timestamp (newest first)
    return notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "Success",
      description: "All notifications marked as read"
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: "Success",
      description: "Notification deleted"
    });
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredNotifications = (category?: string) => {
    if (!category || category === 'all') return notifications;
    return notifications.filter(n => n.category === category);
  };

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
              <Button onClick={markAllAsRead} variant="outline" className="self-start sm:self-auto">
                <Check className="h-4 w-4 mr-2" />
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>
        </div>

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
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground text-center">
                    You're all caught up! Check back later for new updates.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications().map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <Card 
                      key={notification.id} 
                      className={`transition-all duration-200 ${
                        !notification.read 
                          ? `border-l-4 border-l-primary ${getNotificationTypeColor(notification.type)}` 
                          : 'hover:shadow-md'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                            <IconComponent className={`h-4 w-4 ${getIconColor(notification.type)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="space-y-3">
              {filteredNotifications('payment').map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-all duration-200 ${
                      !notification.read 
                        ? `border-l-4 border-l-primary ${getNotificationTypeColor(notification.type)}` 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                          <IconComponent className={`h-4 w-4 ${getIconColor(notification.type)}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <div className="space-y-3">
              {filteredNotifications('account').concat(filteredNotifications('system')).map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-all duration-200 ${
                      !notification.read 
                        ? `border-l-4 border-l-primary ${getNotificationTypeColor(notification.type)}` 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                          <IconComponent className={`h-4 w-4 ${getIconColor(notification.type)}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Payment Reminders</label>
                      <p className="text-xs text-muted-foreground">Get notified before payments are due</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.paymentReminders}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        paymentReminders: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Payment Confirmations</label>
                      <p className="text-xs text-muted-foreground">Get notified when payments are processed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.paymentConfirmations}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        paymentConfirmations: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">System Updates</label>
                      <p className="text-xs text-muted-foreground">Important account and security updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemUpdates}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        systemUpdates: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">SMS Notifications</label>
                      <p className="text-xs text-muted-foreground">Receive notifications via text message</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        smsNotifications: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Marketing Emails</label>
                      <p className="text-xs text-muted-foreground">Promotions and special offers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        marketingEmails: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "Your notification preferences have been updated"
                    });
                  }}>
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Notifications;
