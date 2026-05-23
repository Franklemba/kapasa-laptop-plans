
import { supabase } from "@/integrations/supabase/client";

export interface PaymentPlanApplicationData {
  // Financial Information
  bankName: string;
  accountType: string;
  monthlyExpenses: string;
  
  // Employment Information (additional details)
  employer: string;
  jobTitle: string;
  employmentLength: string;
  
  // Additional Information
  dateOfBirth: string;
  reasonForPurchase: string;
  hasAppliedBefore: boolean;
  
  // Agreement checkboxes
  agreeToTerms: boolean;
  agreeToCredit: boolean;
  
  // User can edit their basic info if needed
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export const submitPaymentPlanApplication = async (
  clientId: string,
  laptopId: string,
  applicationData: PaymentPlanApplicationData,
  paymentDetails: {
    weeklyPayment: string;
    downPayment: string;
    loanTerm: string;
  }
) => {
  console.log("Submitting payment plan application:", {
    clientId,
    laptopId,
    applicationData,
    paymentDetails
  });

  try {
    // Calculate total amount
    const weeklyPayment = parseFloat(paymentDetails.weeklyPayment);
    const downPayment = parseFloat(paymentDetails.downPayment) || 0;
    const loanTerm = parseInt(paymentDetails.loanTerm);
    const totalAmount = (weeklyPayment * loanTerm) + downPayment;

    // Create payment plan in database
    const { data: paymentPlan, error } = await supabase
      .from('payment_plans')
      .insert({
        client_id: clientId,
        laptop_id: laptopId,
        plan_duration: loanTerm,
        weekly_payment: weeklyPayment,
        total_amount: totalAmount,
        amount_paid: downPayment, // If there's a down payment, it's already paid
        start_date: new Date().toISOString().split('T')[0], // Today's date
        status: 'pending' // Pending admin approval
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment plan:', error);
      throw new Error(error.message);
    }

    console.log('Payment plan created successfully:', paymentPlan);
    return { 
      success: true, 
      applicationId: paymentPlan.id,
      paymentPlan 
    };
  } catch (error) {
    console.error('Error in submitPaymentPlanApplication:', error);
    throw error;
  }
};

// Fetch payment plans for a client
export const fetchClientPaymentPlans = async (clientId: string) => {
  const { data, error } = await supabase
    .from('payment_plans')
    .select(`
      *,
      laptop:laptops(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment plans:', error);
    throw error;
  }

  return data;
};

// Fetch all pending payment plans (for admin)
export const fetchPendingPaymentPlans = async () => {
  const { data, error } = await supabase
    .from('payment_plans')
    .select(`
      *,
      client:clients(*),
      laptop:laptops(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending payment plans:', error);
    throw error;
  }

  return data;
};

// Approve payment plan (admin)
export const approvePaymentPlan = async (planId: string) => {
  const { data, error } = await supabase
    .from('payment_plans')
    .update({ status: 'active' })
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error approving payment plan:', error);
    throw error;
  }

  return data;
};

// Reject payment plan (admin)
export const rejectPaymentPlan = async (planId: string) => {
  const { data, error } = await supabase
    .from('payment_plans')
    .update({ status: 'cancelled' })
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting payment plan:', error);
    throw error;
  }

  return data;
};
