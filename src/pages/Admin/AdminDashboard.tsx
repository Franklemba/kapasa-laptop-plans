
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Laptop, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminDashboard = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    newClientsThisMonth: 0,
    laptopsSold: 0,
    laptopsSoldLastMonth: 0,
    outstandingPayments: 0,
    activePlansCount: 0,
    weeklyCollection: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        clientsResult,
        paymentPlansResult,
        lowStockResult
      ] = await Promise.all([
        fetchClientStats(),
        fetchPaymentPlanStats(),
        fetchLowStockItems()
      ]);

      setStats({
        totalClients: clientsResult.total,
        newClientsThisMonth: clientsResult.newThisMonth,
        laptopsSold: paymentPlansResult.totalSold,
        laptopsSoldLastMonth: paymentPlansResult.soldLastMonth,
        outstandingPayments: paymentPlansResult.outstanding,
        activePlansCount: paymentPlansResult.activePlans,
        weeklyCollection: paymentPlansResult.weeklyCollection,
      });

      setLowStockItems(lowStockResult);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async () => {
    try {
      // Get total clients
      const { count: totalClients, error: totalError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get clients created this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { count: newThisMonth, error: monthError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);

      if (monthError) throw monthError;

      return {
        total: totalClients || 0,
        newThisMonth: newThisMonth || 0,
      };
    } catch (error) {
      console.error('Error fetching client stats:', error);
      return { total: 0, newThisMonth: 0 };
    }
  };

  const fetchPaymentPlanStats = async () => {
    try {
      // Get all completed and active payment plans (laptops sold)
      const { data: soldPlans, error: soldError } = await supabase
        .from('payment_plans')
        .select('id, status, start_date, total_amount, amount_paid, weekly_payment')
        .in('status', ['active', 'completed']);

      if (soldError) throw soldError;

      const totalSold = soldPlans?.length || 0;

      // Get laptops sold last month
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      const { count: soldLastMonth, error: lastMonthError } = await supabase
        .from('payment_plans')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'completed'])
        .gte('start_date', startOfLastMonth)
        .lte('start_date', endOfLastMonth);

      if (lastMonthError) throw lastMonthError;

      // Calculate outstanding payments (total_amount - amount_paid for active plans)
      const activePlans = soldPlans?.filter(plan => plan.status === 'active') || [];
      const outstanding = activePlans.reduce((sum, plan) => {
        return sum + (plan.total_amount - plan.amount_paid);
      }, 0);

      // Calculate expected weekly collection (sum of weekly_payment for active plans)
      const weeklyCollection = activePlans.reduce((sum, plan) => {
        return sum + (plan.weekly_payment || 0);
      }, 0);

      return {
        totalSold,
        soldLastMonth: soldLastMonth || 0,
        outstanding: Math.round(outstanding),
        activePlans: activePlans.length,
        weeklyCollection: Math.round(weeklyCollection),
      };
    } catch (error) {
      console.error('Error fetching payment plan stats:', error);
      return {
        totalSold: 0,
        soldLastMonth: 0,
        outstanding: 0,
        activePlans: 0,
        weeklyCollection: 0,
      };
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const { data: allLaptops, error } = await supabase
        .from('laptops')
        .select('id, name, stock_quantity, min_stock_level');
      
      if (error) throw error;

      if (allLaptops) {
        const lowStock = allLaptops.filter(
          laptop => laptop.stock_quantity <= laptop.min_stock_level
        );
        return lowStock.slice(0, 5);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage your laptop payment business</p>
        </div>

        {/* Low Stock Alert */}
        {!loading && lowStockItems.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
              {lowStockItems.length} laptop{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock.
              <Link to="/inventory" className="ml-2 underline font-medium">
                View Inventory
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.newClientsThisMonth > 0 ? `+${stats.newClientsThisMonth}` : stats.newClientsThisMonth} from this month
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laptops Sold</CardTitle>
              <Laptop className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.laptopsSold}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.laptopsSoldLastMonth > 0 ? `+${stats.laptopsSoldLastMonth}` : stats.laptopsSoldLastMonth} from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">ZMK {stats.outstandingPayments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across {stats.activePlansCount} active plans</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Collection</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">ZMK {stats.weeklyCollection.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Expected this week</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Manage Clients</CardTitle>
              <CardDescription>View and manage all registered clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/manage-clients">View Clients</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700">Pending Applications</CardTitle>
              <CardDescription>Review and approve payment plan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                <Link to="/pending-applications">Review Applications</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Record Payment</CardTitle>
              <CardDescription>Record customer payments for active plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                <Link to="/record-payment">Record Payment</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Review all payments and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/client-payment-history">View Transactions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Laptop Inventory</CardTitle>
              <CardDescription>Manage your laptop stock and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/inventory">Manage Inventory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Stock Movements History</CardTitle>
              <CardDescription>View detailed inventory transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/stock-movements">View History</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Send Notifications</CardTitle>
              <CardDescription>Send reminders and custom messages</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Send Messages</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Payment Calendar</CardTitle>
              <CardDescription>View upcoming payment schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Calendar</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Add New Laptop</CardTitle>
              <CardDescription>Add new laptops to your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/add-laptop">Add Laptop</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
