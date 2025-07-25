
import { useState } from "react";
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
import { Link } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";

const Dashboard = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Payment due in 3 days", type: "warning" },
    { id: 2, message: "Payment received successfully", type: "success" }
  ]);

  // Mock user data - in real app this would come from API
  const userData = {
    name: "John Doe",
    email: "john.doe@email.com",
    currentPlan: {
      laptop: "MacBook Pro 13\"",
      totalPrice: 1200,
      amountPaid: 800,
      weeklyPayment: 100,
      nextPaymentDate: "Dec 15, 2024",
      paymentsRemaining: 4,
      status: "active"
    },
    paymentHistory: [
      { date: "Nov 15, 2024", amount: 100, status: "completed" },
      { date: "Nov 8, 2024", amount: 100, status: "completed" },
      { date: "Nov 1, 2024", amount: 100, status: "completed" },
      { date: "Oct 25, 2024", amount: 100, status: "completed" }
    ]
  };

  const progressPercentage = (userData.currentPlan.amountPaid / userData.currentPlan.totalPrice) * 100;
  const remainingAmount = userData.currentPlan.totalPrice - userData.currentPlan.amountPaid;

  return (
    <MobileLayout notifications={notifications.length}>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">Your Dashboard</h2>
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
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}
              >
                {notification.type === 'warning' ? (
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
                    <Badge variant={userData.currentPlan.status === 'active' ? 'default' : 'secondary'}>
                      {userData.currentPlan.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{userData.currentPlan.laptop}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>${userData.currentPlan.amountPaid.toLocaleString()} / ${userData.currentPlan.totalPrice.toLocaleString()}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(progressPercentage)}% completed
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-semibold text-green-600">${userData.currentPlan.amountPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-semibold">${remainingAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payments Left</p>
                        <p className="font-semibold">{userData.currentPlan.paymentsRemaining}</p>
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
                      ${userData.currentPlan.weeklyPayment.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {userData.currentPlan.nextPaymentDate}
                    </p>
                    <Button className="w-full mt-4">
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
                    <span className="text-sm text-muted-foreground">On-time payments</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Plan duration</span>
                    <span className="font-semibold">12 weeks</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Weekly amount</span>
                    <span className="font-semibold">${userData.currentPlan.weeklyPayment}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                <CardDescription>Your recent payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.paymentHistory.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Payment #{userData.paymentHistory.length - index}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <p className="font-medium">{userData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Status</label>
                    <Badge variant="default" className="mt-1">Active</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="font-medium">October 2024</p>
                  </div>
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
