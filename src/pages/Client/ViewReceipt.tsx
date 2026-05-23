import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentReceipt } from "@/components/PaymentReceipt";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const ViewReceipt = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    if (paymentId) {
      fetchReceiptData();
    }
  }, [paymentId]);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);

      // Fetch payment with related data
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          payment_plan:payment_plans(
            id,
            total_amount,
            amount_paid,
            weekly_payment,
            client:clients(
              first_name,
              last_name,
              email,
              phone,
              address
            ),
            laptop:laptops(
              name,
              brand,
              model
            )
          )
        `)
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      if (!payment) throw new Error('Payment not found');

      setReceiptData({
        payment: {
          id: payment.id,
          amount: payment.amount,
          payment_date: payment.payment_date,
          payment_method: payment.payment_method,
          reference_number: payment.reference_number,
          notes: payment.notes
        },
        client: payment.payment_plan.client,
        laptop: payment.payment_plan.laptop,
        paymentPlan: {
          id: payment.payment_plan.id,
          total_amount: payment.payment_plan.total_amount,
          amount_paid: payment.payment_plan.amount_paid,
          weekly_payment: payment.payment_plan.weekly_payment
        }
      });
    } catch (error: any) {
      console.error('Error fetching receipt data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load receipt",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Receipt not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button - Hidden when printing */}
        <div className="mb-6 print:hidden">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Receipt */}
        <PaymentReceipt {...receiptData} />
      </div>
    </div>
  );
};

export default ViewReceipt;
