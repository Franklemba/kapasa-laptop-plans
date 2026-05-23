
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Laptop, 
  Calendar, 
  CreditCard, 
  History, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useClientProfile } from "@/hooks/useClientProfile";
import { fetchClientPaymentPlans } from "@/services/paymentPlanService";
import { fetchPaymentsByClient } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthCheck();
  const { profile } = useClientProfile(user?.id || null);
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: string}>>([]);
  
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real payment plans and payments
  useEffect(() => {
    const loadData = async () => {
      if (!profile?.id) return;
      
      try {
        setLoading(true);
        const [plansData, paymentsData] = await Promise.all([
          fetchClientPaymentPlans(profile.id),
          fetchPaymentsByClient(profile.id)
        ]);
        setPaymentPlans(plansData || []);
        setPayments(paymentsData || []);
        
        // Generate notifications based on real data
        generateNotifications(plansData || [], paymentsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.id]);

  // Generate real notifications based on payment plans and payments
  const generateNotifications = (plans: any[], paymentsData: any[]) => {
    const notifs: Array<{id: number, message: string, type: string}> = [];
    let notifId = 1;

    // Get active plans
    const activePlans = plans.filter(plan => plan.status === 'active');

    activePlans.forEach(plan => {
      // Calculate next payment date (assuming weekly payments)
      const startDate = new Date(plan.start_date);
      const weeksPassed = Math.floor(plan.amount_paid / plan.weekly_payment);
      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setDate(startDate.getDate() + ((weeksPassed + 1) * 7));
      
      const today = new Date();
      const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Payment due soon (within 3 days)
      if (daysUntilPayment >= 0 && daysUntilPayment <= 3) {
        notifs.push({
          id: notifId++,
          message: `Payment of ZMK ${plan.weekly_payment.toLocaleString()} due in ${daysUntilPayment} day${daysUntilPayment !== 1 ? 's' : ''}`,
          type: "warning"
        });
      }

      // Payment overdue
      if (daysUntilPayment < 0) {
        notifs.push({
          id: notifId++,
          message: `Payment overdue by ${Math.abs(daysUntilPayment)} day${Math.abs(daysUntilPayment) !== 1 ? 's' : ''}`,
          type: "error"
        });
      }
    });

    // Check for recent payments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentPayments = paymentsData.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate >= sevenDaysAgo;
    });

    if (recentPayments.length > 0) {
      const latestPayment = recentPayments[0];
      notifs.push({
        id: notifId++,
        message: `Payment of ZMK ${latestPayment.amount.toLocaleString()} received successfully`,
        type: "success"
      });
    }

    // Check for pending applications
    const pendingPlans = plans.filter(plan => plan.status === 'pending');
    if (pendingPlans.length > 0) {
      notifs.push({
        id: notifId++,
        message: `You have ${pendingPlans.length} pending payment plan application${pendingPlans.length !== 1 ? 's' : ''}`,
        type: "info"
      });
    }

    // Check for completed plans
    const completedPlans = plans.filter(plan => plan.status === 'completed');
    if (completedPlans.length > 0) {
      const recentlyCompleted = completedPlans.filter(plan => {
        const endDate = new Date(plan.end_date || plan.updated_at);
        return endDate >= sevenDaysAgo;
      });
      
      if (recentlyCompleted.length > 0) {
        notifs.push({
          id: notifId++,
          message: `Congratulations! You've completed your payment plan`,
          type: "success"
        });
      }
    }

    setNotifications(notifs);
  };

  // Get active payment plan (most recent active one)
  const activePlan = paymentPlans.find(plan => plan.status === 'active') || paymentPlans[0];
  
  // Calculate stats
  const progressPercentage = activePlan 
    ? (activePlan.amount_paid / activePlan.total_amount) * 100 
    : 0;
  const remainingAmount = activePlan 
    ? activePlan.total_amount - activePlan.amount_paid 
    : 0;
  const paymentsRemaining = activePlan
    ? Math.ceil(remainingAmount / activePlan.weekly_payment)
    : 0;

  // Calculate next payment date (assuming weekly payments)
  const getNextPaymentDate = () => {
    if (!activePlan) return "N/A";
    const startDate = new Date(activePlan.start_date);
    const weeksPassed = Math.floor(activePlan.amount_paid / activePlan.weekly_payment);
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setDate(startDate.getDate() + ((weeksPassed + 1) * 7));
    return nextPaymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <MobileLayout notifications={notifications.length}>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // If no profile exists, redirect to complete profile
  if (!profile) {
    return (
      <MobileLayout notifications={0}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-muted-foreground mb-6">
                Please complete your profile to access your dashboard and apply for payment plans.
              </p>
              <Button size="lg" onClick={() => navigate('/complete-profile')}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout notifications={notifications.length}>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome back, {profile?.first_name || 'User'}!
          </h2>
          <p className="text-muted-foreground">Track your laptop payment plan and manage your account</p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-4 lg:mb-6 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  notification.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                    : notification.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : notification.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}
              >
                {notification.type === 'warning' || notification.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 lg:space-y-6">
            {/* Show empty state if no payment plans */}
            {paymentPlans.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Laptop className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Payment Plans</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't applied for any payment plans yet. Browse our catalog to get started!
                  </p>
                  <Link to="/catalog">
                    <Button size="lg">
                      <Laptop className="mr-2 h-5 w-5" />
                      Browse Laptops
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* Main Stats Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              {/* Payment Progress Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Progress</span>
                    </div>
                    <Badge variant={activePlan?.status === 'active' ? 'default' : activePlan?.status === 'pending' ? 'secondary' : 'outline'}>
                      {activePlan?.status || 'N/A'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{activePlan?.laptop?.name || 'No laptop'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>ZMK {activePlan?.amount_paid?.toLocaleString() || 0} / ZMK {activePlan?.total_amount?.toLocaleString() || 0}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(progressPercentage)}% completed
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-semibold text-green-600">ZMK {activePlan?.amount_paid?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-semibold">ZMK {remainingAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payments Left</p>
                        <p className="font-semibold">{paymentsRemaining}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Next Payment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-2">
                    <p className="text-2xl lg:text-3xl font-bold text-primary">
                      ZMK {activePlan?.weekly_payment?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {getNextPaymentDate()}
                    </p>
                    <Button className="w-full mt-4" disabled={activePlan?.status !== 'active'}>
                      Make Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Plan status</span>
                    <span className="font-semibold capitalize">{activePlan?.status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Plan duration</span>
                    <span className="font-semibold">{activePlan?.plan_duration || 0} weeks</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Weekly amount</span>
                    <span className="font-semibold">ZMK {activePlan?.weekly_payment || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
              </>
            )}

            {/* Quick Actions - Mobile Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow group">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="mb-3 inline-flex p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm lg:text-base">Make Payment</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">Pay your next installment</p>
                </CardContent>
              </Card>

              <Link to="/payment-history">
                <Card className="cursor-pointer hover:shadow-md transition-shadow group h-full">
                  <CardContent className="p-4 lg:p-6 text-center">
                    <div className="mb-3 inline-flex p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                      <History className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1 text-sm lg:text-base">Payment History</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">View all transactions</p>
                  </CardContent>
                </Card>
              </Link>

              <Card className="cursor-pointer hover:shadow-md transition-shadow group">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="mb-3 inline-flex p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm lg:text-base">Payment Schedule</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">See upcoming payments</p>
                </CardContent>
              </Card>

              <Link to="/catalog">
                <Card className="cursor-pointer hover:shadow-md transition-shadow group h-full">
                  <CardContent className="p-4 lg:p-6 text-center">
                    <div className="mb-3 inline-flex p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                      <Laptop className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1 text-sm lg:text-base">Browse Laptops</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">Start a new plan</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Payment History</span>
                </CardTitle>
                <CardDescription>View all your payments and download receipts</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No payments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded-full">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">ZMK {Number(payment.amount).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method.replace('_', ' ')}
                            </p>
                            {payment.payment_plan?.laptop && (
                              <p className="text-xs text-muted-foreground">
                                {payment.payment_plan.laptop.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/receipt/${payment.id}`)}
                        >
                          View Receipt
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Plans Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Laptop className="h-5 w-5" />
                  <span>Payment Plans</span>
                </CardTitle>
                <CardDescription>Your active and completed payment plans</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No payment plans yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Laptop className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{plan.laptop?.name || 'Laptop'}</p>
                            <p className="text-sm text-muted-foreground">
                              Started: {new Date(plan.start_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">ZMK {plan.amount_paid.toLocaleString()} / ZMK {plan.total_amount.toLocaleString()}</p>
                          <Badge variant={
                            plan.status === 'active' ? 'default' : 
                            plan.status === 'pending' ? 'secondary' :
                            plan.status === 'completed' ? 'outline' : 'destructive'
                          } className="text-xs mt-1">
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                    <Badge variant="default" className="mt-1 capitalize">{profile?.status || 'Active'}</Badge>
                  </div>
                  {profile?.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="font-medium">{profile.address}</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" className="mr-2">Edit Profile</Button>
                  <Button variant="outline">Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
