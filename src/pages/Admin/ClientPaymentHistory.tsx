import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  History, 
  Search,
  Calendar,
  DollarSign,
  User,
  Download,
  Filter,
  Eye,
  Printer,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  payment_plan: {
    id: string;
    total_amount: number;
    amount_paid: number;
    weekly_payment: number;
    status: string;
    laptop: {
      name: string;
      brand: string;
      model: string;
    };
  };
}

const ClientPaymentHistory = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Fetch all clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch payments when client is selected
  useEffect(() => {
    if (selectedClientId) {
      fetchClientPayments(selectedClientId);
    } else {
      setPayments([]);
      setFilteredPayments([]);
      setSelectedClient(null);
    }
  }, [selectedClientId]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, dateFilter, methodFilter]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, phone')
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients.",
        variant: "destructive",
      });
    }
  };

  const fetchClientPayments = async (clientId: string) => {
    setIsLoading(true);
    try {
      // Get client details
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client || null);

      // Fetch all payments for this client
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_date,
          payment_method,
          reference_number,
          notes,
          payment_plan:payment_plans!inner(
            id,
            total_amount,
            amount_paid,
            weekly_payment,
            status,
            client_id,
            laptop:laptops(
              name,
              brand,
              model
            )
          )
        `)
        .eq('payment_plan.client_id', clientId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_plan.laptop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        
        if (dateFilter === 'this_month') {
          return paymentDate.getMonth() === now.getMonth() && 
                 paymentDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          return paymentDate.getMonth() === lastMonth.getMonth() && 
                 paymentDate.getFullYear() === lastMonth.getFullYear();
        } else if (dateFilter === 'this_year') {
          return paymentDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // Payment method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_method === methodFilter);
    }

    setFilteredPayments(filtered);
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

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No payments to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Date', 'Amount', 'Method', 'Reference', 'Laptop', 'Plan Status', 'Notes'];
    const rows = filteredPayments.map(payment => [
      format(new Date(payment.payment_date), 'yyyy-MM-dd'),
      payment.amount,
      payment.payment_method,
      payment.reference_number || 'N/A',
      `${payment.payment_plan.laptop.brand} ${payment.payment_plan.laptop.name}`,
      payment.payment_plan.status,
      payment.notes || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedClient?.first_name}_${selectedClient?.last_name}_payments_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Payment history has been exported to CSV.",
    });
  };

  const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paymentMethods = Array.from(new Set(payments.map(p => p.payment_method)));

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <History className="h-8 w-8 mr-3" />
            Client Payment History
          </h2>
          <p className="text-muted-foreground">View detailed payment records for any client</p>
        </div>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Select Client</span>
            </CardTitle>
            <CardDescription>Choose a client to view their payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Show content only when client is selected */}
        {selectedClient && (
          <>
            {/* Client Info & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Client Name</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{selectedClient.email}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-600">
                    ZMK {totalPaid.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{payments.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Payment</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">
                    ZMK {payments.length > 0 ? Math.round(totalPaid / payments.length).toLocaleString() : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by reference, laptop, method..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="this_year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Payment Transactions</span>
                    </CardTitle>
                    <CardDescription>
                      Showing {filteredPayments.length} of {payments.length} payments
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading payment history...</p>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {payments.length === 0 
                        ? "No payments found for this client" 
                        : "No payments match the current filters"}
                    </p>
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
                          <TableHead>Plan Status</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">
                                ZMK {payment.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPaymentMethodBadge(payment.payment_method)}>
                                {payment.payment_method.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{payment.payment_plan.laptop.name}</div>
                                <div className="text-muted-foreground">
                                  {payment.payment_plan.laptop.brand} {payment.payment_plan.laptop.model}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  payment.payment_plan.status === 'active' ? 'default' :
                                  payment.payment_plan.status === 'completed' ? 'outline' :
                                  'secondary'
                                }
                              >
                                {payment.payment_plan.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {payment.reference_number ? (
                                <span className="font-mono text-sm">{payment.reference_number}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/receipt/${payment.id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty state when no client selected */}
        {!selectedClient && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a Client</h3>
              <p className="text-muted-foreground">
                Choose a client from the dropdown above to view their payment history
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ClientPaymentHistory;
