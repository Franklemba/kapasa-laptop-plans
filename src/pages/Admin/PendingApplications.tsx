import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Laptop,
  DollarSign,
  Calendar,
  Loader2
} from "lucide-react";

interface PaymentPlanApplication {
  id: string;
  client_id: string;
  laptop_id: string;
  plan_duration: number;
  weekly_payment: number;
  total_amount: number;
  amount_paid: number;
  start_date: string;
  status: string;
  created_at: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    employment_status: string;
    monthly_income: number;
  };
  laptop: {
    id: string;
    name: string;
    brand: string;
    model: string;
    price: number;
    stock_quantity: number;
  };
}

const PendingApplications = () => {
  const [applications, setApplications] = useState<PaymentPlanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PaymentPlanApplication | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_plans')
        .select(`
          *,
          client:clients(*),
          laptop:laptops(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      toast({
        title: "Error",
        description: "Failed to load pending applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      setProcessing(true);

      // Check if laptop is in stock
      if (selectedApp.laptop.stock_quantity <= 0) {
        toast({
          title: "Cannot Approve",
          description: "This laptop is out of stock. Please restock before approving.",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }

      // 1. Update payment plan status to 'active'
      const { error: planError } = await supabase
        .from('payment_plans')
        .update({ status: 'active' })
        .eq('id', selectedApp.id);

      if (planError) throw planError;

      // 2. Reduce laptop stock by 1
      const newStockQuantity = selectedApp.laptop.stock_quantity - 1;
      const previousStockQuantity = selectedApp.laptop.stock_quantity;
      
      const { error: stockError } = await supabase
        .from('laptops')
        .update({ 
          stock_quantity: newStockQuantity,
          status: newStockQuantity === 0 ? 'inactive' : 'active'
        })
        .eq('id', selectedApp.laptop_id);

      if (stockError) throw stockError;

      // 3. Create stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          laptop_id: selectedApp.laptop_id,
          movement_type: 'sold',
          quantity: 1,
          previous_quantity: previousStockQuantity,
          new_quantity: newStockQuantity,
          reason: `Payment plan approved for ${selectedApp.client.first_name} ${selectedApp.client.last_name}`,
          notes: `Plan ID: ${selectedApp.id}, Weekly Payment: ZMK ${selectedApp.weekly_payment}`
        });

      if (movementError) throw movementError;

      toast({
        title: "Payment Plan Approved",
        description: `${selectedApp.client.first_name}'s payment plan has been approved successfully.`,
      });

      // Refresh the list
      fetchPendingApplications();
      setSelectedApp(null);
      setActionType(null);
    } catch (error: any) {
      console.error('Error approving payment plan:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve payment plan",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    try {
      setProcessing(true);

      // Update payment plan status to 'cancelled'
      const { error } = await supabase
        .from('payment_plans')
        .update({ 
          status: 'cancelled',
          notes: rejectionReason || 'Application rejected by admin'
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      toast({
        title: "Payment Plan Rejected",
        description: `${selectedApp.client.first_name}'s payment plan has been rejected.`,
      });

      // Refresh the list
      fetchPendingApplications();
      setSelectedApp(null);
      setActionType(null);
      setRejectionReason("");
    } catch (error: any) {
      console.error('Error rejecting payment plan:', error);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject payment plan",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const openDialog = (app: PaymentPlanApplication, type: 'approve' | 'reject') => {
    setSelectedApp(app);
    setActionType(type);
  };

  const closeDialog = () => {
    setSelectedApp(null);
    setActionType(null);
    setRejectionReason("");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading pending applications...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Pending Applications</h1>
          </div>
          <p className="text-muted-foreground">
            Review and approve payment plan applications
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-3xl font-bold">{applications.length}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Awaiting Review</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No pending applications at the moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Laptop</TableHead>
                      <TableHead>Weekly Payment</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">
                                {app.client.first_name} {app.client.last_name}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.client.email}</p>
                            {app.client.phone && (
                              <p className="text-sm text-muted-foreground">{app.client.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Laptop className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{app.laptop.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {app.laptop.brand} {app.laptop.model}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">ZMK {app.weekly_payment.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">ZMK {app.total_amount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{app.plan_duration} weeks</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openDialog(app, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDialog(app, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={!!actionType} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve Payment Plan' : 'Reject Payment Plan'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' ? (
                  <>
                    Are you sure you want to approve this payment plan for{' '}
                    <strong>{selectedApp?.client.first_name} {selectedApp?.client.last_name}</strong>?
                    <br /><br />
                    This will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Activate the payment plan</li>
                      <li>Reduce laptop stock by 1</li>
                      <li>Create a stock movement record</li>
                      <li>Allow the client to start making payments</li>
                    </ul>
                  </>
                ) : (
                  <>
                    Are you sure you want to reject this payment plan for{' '}
                    <strong>{selectedApp?.client.first_name} {selectedApp?.client.last_name}</strong>?
                    <br /><br />
                    <div className="mt-4">
                      <Label htmlFor="reason">Rejection Reason (Optional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={processing}>
                Cancel
              </Button>
              <Button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={processing}
                variant={actionType === 'approve' ? 'default' : 'destructive'}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {actionType === 'approve' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default PendingApplications;
