import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  History, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Filter,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  payment_plan: {
    laptop: {
      name: string;
      model: string;
    }[];
  }[];
}

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'this_month' | 'last_month'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Error",
          description: "Please log in to view payment history",
          variant: "destructive",
        });
        return;
      }

      // Get client profile
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (clientError || !clientData) {
        toast({
          title: "Error",
          description: "Client profile not found",
          variant: "destructive",
        });
        return;
      }

      // Build date filter
      let dateFilter: { gte?: string; lte?: string } = {};
      const now = new Date();
      
      if (filter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { gte: startOfMonth.toISOString().split('T')[0] };
      } else if (filter === 'last_month') {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        dateFilter = { 
          gte: startOfLastMonth.toISOString().split('T')[0],
          lte: endOfLastMonth.toISOString().split('T')[0]
        };
      }

      // Fetch payments with payment plan and laptop details
      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          payment_date,
          payment_method,
          reference_number,
          notes,
          payment_plan:payment_plans!inner(
            laptop:laptops(
              name,
              model
            )
          )
        `)
        .eq("payment_plan.client_id", clientData.id)
        .order("payment_date", { ascending: false });

      if (filter !== 'all') {
        if (filter === 'this_month') {
          query = query.gte("payment_date", dateFilter.gte);
        } else if (filter === 'last_month') {
          query = query.gte("payment_date", dateFilter.gte).lte("payment_date", dateFilter.lte);
        }
      }

      const { data: paymentsData, error: paymentsError } = await query;

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        toast({
          title: "Error",
          description: "Failed to load payment history",
          variant: "destructive",
        });
        return;
      }

      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error in fetchPayments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return `ZMK ${amount.toLocaleString()}`;
  };

  const getPaymentMethodBadge = (method: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      cash: 'default',
      bank_transfer: 'secondary',
      mobile_money: 'outline',
      card: 'destructive'
    };
    return variants[method] || 'default';
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
            <History className="h-6 w-6 lg:h-8 lg:w-8 mr-3" />
            Payment History
          </h2>
          <p className="text-muted-foreground">Track all your payment transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-600">{formatAmount(totalPaid)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge variant="default" className="text-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Payments Complete
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Payments
              </Button>
              <Button
                variant={filter === 'this_month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('this_month')}
              >
                This Month
              </Button>
              <Button
                variant={filter === 'last_month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('last_month')}
              >
                Last Month
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Transactions
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
            <CardDescription>
              {filter === 'all' && "All your payment transactions"}
              {filter === 'this_month' && "Payments made this month"}
              {filter === 'last_month' && "Payments made last month"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Loading payment history...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No payments found for the selected period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Laptop</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(payment.payment_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatAmount(payment.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentMethodBadge(payment.payment_method)}>
                            {payment.payment_method.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{payment.payment_plan[0]?.laptop[0]?.name || 'N/A'}</div>
                            <div className="text-muted-foreground">{payment.payment_plan[0]?.laptop[0]?.model || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.reference_number ? (
                            <span className="font-mono text-sm">{payment.reference_number}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default PaymentHistory;