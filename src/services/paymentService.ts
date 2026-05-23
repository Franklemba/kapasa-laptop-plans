import { supabase } from "@/integrations/supabase/client";

export interface PaymentData {
  payment_plan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  payment_plan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

/**
 * Record a payment for a payment plan
 * Updates the payment_plans.amount_paid and creates a payment record
 */
export const recordPayment = async (paymentData: PaymentData) => {
  try {
    // 1. Get current payment plan details
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('amount_paid, total_amount, status')
      .eq('id', paymentData.payment_plan_id)
      .single();

    if (planError) throw planError;
    if (!plan) throw new Error('Payment plan not found');

    // 2. Calculate new amount paid
    const newAmountPaid = Number(plan.amount_paid) + Number(paymentData.amount);
    const totalAmount = Number(plan.total_amount);

    // 3. Determine new status
    let newStatus = plan.status;
    if (newAmountPaid >= totalAmount) {
      newStatus = 'completed';
    } else if (plan.status === 'pending') {
      newStatus = 'active'; // Activate if first payment on pending plan
    }

    // 4. Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        payment_plan_id: paymentData.payment_plan_id,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number || null,
        notes: paymentData.notes || null
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 5. Update payment plan
    const { error: updateError } = await supabase
      .from('payment_plans')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus
      })
      .eq('id', paymentData.payment_plan_id);

    if (updateError) throw updateError;

    return {
      success: true,
      payment,
      newAmountPaid,
      newStatus,
      isCompleted: newStatus === 'completed'
    };
  } catch (error: any) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

/**
 * Fetch all payments for a payment plan
 */
export const fetchPaymentsByPlan = async (paymentPlanId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_plan_id', paymentPlanId)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }

  return data as PaymentRecord[];
};

/**
 * Fetch all payments for a client (across all their payment plans)
 */
export const fetchPaymentsByClient = async (clientId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      payment_plan:payment_plans(
        id,
        laptop:laptops(name, brand, model)
      )
    `)
    .eq('payment_plan.client_id', clientId)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching client payments:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch all active payment plans (for admin to record payments)
 */
export const fetchActivePaymentPlans = async () => {
  const { data, error } = await supabase
    .from('payment_plans')
    .select(`
      *,
      client:clients(id, first_name, last_name, email, phone),
      laptop:laptops(id, name, brand, model, price)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active payment plans:', error);
    throw error;
  }

  return data;
};

/**
 * Get payment summary for a payment plan
 */
export const getPaymentSummary = async (paymentPlanId: string) => {
  const { data: plan, error: planError } = await supabase
    .from('payment_plans')
    .select('total_amount, amount_paid, weekly_payment, plan_duration')
    .eq('id', paymentPlanId)
    .single();

  if (planError) throw planError;

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount, payment_date')
    .eq('payment_plan_id', paymentPlanId)
    .order('payment_date', { ascending: true });

  if (paymentsError) throw paymentsError;

  const totalAmount = Number(plan.total_amount);
  const amountPaid = Number(plan.amount_paid);
  const remainingAmount = totalAmount - amountPaid;
  const percentagePaid = (amountPaid / totalAmount) * 100;
  const paymentsCount = payments?.length || 0;
  const expectedPayments = plan.plan_duration;
  const paymentsRemaining = Math.ceil(remainingAmount / Number(plan.weekly_payment));

  return {
    totalAmount,
    amountPaid,
    remainingAmount,
    percentagePaid,
    paymentsCount,
    expectedPayments,
    paymentsRemaining,
    payments: payments || []
  };
};

/**
 * Delete a payment (admin only - for corrections)
 */
export const deletePayment = async (paymentId: string) => {
  try {
    // 1. Get payment details
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('payment_plan_id, amount')
      .eq('id', paymentId)
      .single();

    if (fetchError) throw fetchError;
    if (!payment) throw new Error('Payment not found');

    // 2. Get current payment plan
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('amount_paid, total_amount')
      .eq('id', payment.payment_plan_id)
      .single();

    if (planError) throw planError;

    // 3. Delete payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (deleteError) throw deleteError;

    // 4. Update payment plan amount_paid
    const newAmountPaid = Number(plan.amount_paid) - Number(payment.amount);
    const newStatus = newAmountPaid >= Number(plan.total_amount) ? 'completed' : 'active';

    const { error: updateError } = await supabase
      .from('payment_plans')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus
      })
      .eq('id', payment.payment_plan_id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};
