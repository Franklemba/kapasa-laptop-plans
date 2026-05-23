import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { recordPayment, fetchActivePaymentPlans } from "@/services/paymentService";
import { 
  DollarSign, 
  Calendar, 
  CreditCard, 
  FileText,
  Loader2,
  CheckCircle,
  User,
  Laptop
} from "lucide-react";

interface ActivePlan {
  id: string;
  total_amount: number;
  amount_paid: number;
  weekly_payment: number;
  plan_duration: number;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  laptop: {
    id: string;
    name: string;
    brand: string;
    model: string;
  };
}

const RecordPayment = () => {
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "cash",
    reference_number: "",
    notes: ""
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadActivePlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      const plan = activePlans.find(p => p.id === selectedPlanId);
      setSelectedPlan(plan || null);
      if (plan) {
        // Pre-fill with weekly payment amount
        setFormData(prev => ({
          ...prev,
          amount: plan.weekly_payment.toString()
        }));
      }
    } else {
      setSelectedPlan(null);
    }
  }, [selectedPlanId, activePlans]);

  const loadActivePlans = async () => {
    try {
      setLoading(true);
      const plans = await fetchActivePaymentPlans();
      setActivePlans(plans as ActivePlan[]);
    } catch (error) {
      console.error('Error loading active plans:', error);
      toast({
        title: "Error",
        description: "Failed to load active payment plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlanId) {
      toast({
        title: "Error",
        description: "Please select a payment plan",
        variant: "destructive"
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const result = await recordPayment({
        payment_plan_id: selectedPlanId,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined
      });

      toast({
        title: result.isCompleted ? "Payment Plan Completed!" : "Payment Recorded",
        description: result.isCompleted 
          ? `${selectedPlan?.client.first_name}'s payment plan is now fully paid!`
          : `Payment of ZMK ${formData.amount} recorded successfully.`,
      });

      // Reset form
      setSelectedPlanId("");
      setFormData({
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "cash",
        reference_number: "",
        notes: ""
      });

      // Reload active plans
      loadActivePlans();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const remainingAmount = selectedPlan 
    ? Number(selectedPlan.total_amount) - Number(selectedPlan.amount_paid)
    : 0;

  const percentagePaid = selectedPlan
    ? (Number(selectedPlan.amount_paid) / Number(selectedPlan.total_amount)) * 100
    : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading payment plans...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Record Payment</h1>
          </div>
          <p className="text-muted-foreground">
            Record customer payments for active payment plans
          </p>
        </div>

        {activePlans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Payment Plans</h3>
              <p className="text-muted-foreground mb-6">
                There are no active payment plans at the moment.
              </p>
              <Button onClick={() => navigate('/pending-applications')}>
                View Pending Applications
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Payment Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Plan</CardTitle>
                <CardDescription>Choose the client and payment plan to record payment for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="plan">Payment Plan</Label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="Select a payment plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activePlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.client.first_name} {plan.client.last_name} - {plan.laptop.name} 
                          (K{plan.weekly_payment}/week)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Plan Details */}
                {selectedPlan && (
                  <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Client Information</p>
                        </div>
                        <p className="text-sm">{selectedPlan.client.first_name} {selectedPlan.client.last_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedPlan.client.email}</p>
                        {selectedPlan.client.phone && (
                          <p className="text-sm text-muted-foreground">{selectedPlan.client.phone}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Laptop className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Laptop</p>
                        </div>
                        <p className="text-sm">{selectedPlan.laptop.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPlan.laptop.brand} {selectedPlan.laptop.model}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">ZMK {selectedPlan.total_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount Paid</p>
                        <p className="text-lg font-semibold text-green-600">
                          ZMK {selectedPlan.amount_paid.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="text-lg font-semibold text-orange-600">
                          ZMK {remainingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{percentagePaid.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentagePaid}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Enter the payment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          max={remainingAmount}
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          className="pl-10"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Weekly payment: K{selectedPlan.weekly_payment} | Max: K{remainingAmount}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_date">
                        Payment Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="payment_date"
                          type="date"
                          value={formData.payment_date}
                          onChange={(e) => handleInputChange('payment_date', e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select 
                        value={formData.payment_method} 
                        onValueChange={(value) => handleInputChange('payment_method', value)}
                      >
                        <SelectTrigger id="payment_method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference_number">Reference Number</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reference_number"
                          value={formData.reference_number}
                          onChange={(e) => handleInputChange('reference_number', e.target.value)}
                          className="pl-10"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Optional notes about this payment..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            {selectedPlan && (
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record Payment
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default RecordPayment;
