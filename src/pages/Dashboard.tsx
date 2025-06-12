
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Laptop, Calendar, CreditCard, History } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Laptop className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Uncle Kapasa's</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome back, John!</span>
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Dashboard</h2>
          <p className="text-muted-foreground">Track your laptop payment plan and manage your account</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Payment Progress */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Progress</span>
              </CardTitle>
              <CardDescription>MacBook Pro 13" - Payment Plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>$800 / $1,200</span>
                  </div>
                  <Progress value={67} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold">$800.00</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className="font-semibold">$400.00</p>
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
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">$100.00</p>
                <p className="text-sm text-muted-foreground">Due: Dec 15, 2024</p>
                <Button className="w-full mt-4">Make Payment</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Make Payment</h3>
              <p className="text-sm text-muted-foreground">Pay your next installment</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <History className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Payment History</h3>
              <p className="text-sm text-muted-foreground">View all transactions</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Payment Schedule</h3>
              <p className="text-sm text-muted-foreground">See upcoming payments</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Laptop className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Browse Laptops</h3>
              <p className="text-sm text-muted-foreground">Start a new plan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
