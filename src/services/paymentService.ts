import { supabase } from "@/integrations/supabase/client";

export interface PaymentData {
  payment_plan_id: string;
  amount: number;
  payment_date?: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  payment_plan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface RecordPaymentResult {
  success: boolean;
  payment_id: string;
  newAmountPaid: number;
  newStatus: string;
  isCompleted: boolean;
}

export interface PaymentScheduleRow {
  id: string;
  payment_plan_id: string;
  payment_id: string | null;
  week_number: number;
  due_date: string;
  amount_due: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_at: string | null;
  created_at: string;
}

/**
 * Record a payment atomically using the DB function.
 * Handles locking, plan status update, schedule marking, notification,
 * and audit log in a single transaction — no race conditions.
 */
export const recordPayment = async (paymentData: PaymentData): Promise<RecordPaymentResult> => {
  const { data, error } = await supabase.rpc('record_payment_atomic', {
    p_payment_plan_id: paymentData.payment_plan_id,
    p_amount: paymentData.amount,
    ...(paymentData.payment_date && { p_payment_date: paymentData.payment_date }),
    ...(paymentData.payment_method && { p_payment_method: paymentData.payment_method }),
    ...(paymentData.reference_number && { p_reference_number: paymentData.reference_number }),
    ...(paymentData.notes && { p_notes: paymentData.notes }),
  });

  if (error) {
    console.error('Error recording payment:', error);
    throw error;
  }

  const result = data as {
    success: boolean;
    payment_id: string;
    new_amount_paid: number;
    new_status: string;
    is_completed: boolean;
  };

  return {
    success: result.success,
    payment_id: result.payment_id,
    newAmountPaid: result.new_amount_paid,
    newStatus: result.new_status,
    isCompleted: result.is_completed,
  };
};

/**
 * Fetch all payments for a payment plan, newest first.
 */
export const fetchPaymentsByPlan = async (paymentPlanId: string): Promise<PaymentRecord[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_plan_id', paymentPlanId)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching payments by plan:', error);
    throw error;
  }

  return data as PaymentRecord[];
};

/**
 * Fetch all payments for a client across all their payment plans.
 * Fixed: joins through payment_plans instead of broken PostgREST embedded filter.
 */
export const fetchPaymentsByClient = async (clientId: string) => {
  // First get all plan IDs for this client
  const { data: plans, error: plansError } = await supabase
    .from('payment_plans')
    .select('id')
    .eq('client_id', clientId);

  if (plansError) {
    console.error('Error fetching plans for client:', plansError);
    throw plansError;
  }

  if (!plans || plans.length === 0) return [];

  const planIds = plans.map((p) => p.id);

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      payment_plan:payment_plans(
        id,
        laptop:laptops(name, brand, model)
      )
    `)
    .in('payment_plan_id', planIds)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching client payments:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch all active payment plans (for admin to record payments against).
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
 * Fetch the payment schedule for a plan, ordered by week number.
 */
export const fetchPaymentSchedule = async (paymentPlanId: string): Promise<PaymentScheduleRow[]> => {
  const { data, error } = await supabase
    .from('payment_schedule')
    .select('*')
    .eq('payment_plan_id', paymentPlanId)
    .order('week_number', { ascending: true });

  if (error) {
    console.error('Error fetching payment schedule:', error);
    throw error;
  }

  return data as PaymentScheduleRow[];
};

/**
 * Get payment summary for a payment plan.
 */
export const getPaymentSummary = async (paymentPlanId: string) => {
  const { data: plan, error: planError } = await supabase
    .from('payment_plans')
    .select('total_amount, amount_paid, weekly_payment, plan_duration, end_date')
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
  const percentagePaid = totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0;
  const paymentsCount = payments?.length ?? 0;
  const paymentsRemaining = Math.ceil(remainingAmount / Number(plan.weekly_payment));

  return {
    totalAmount,
    amountPaid,
    remainingAmount,
    percentagePaid,
    paymentsCount,
    expectedPayments: plan.plan_duration,
    paymentsRemaining,
    endDate: plan.end_date,
    payments: payments ?? [],
  };
};

/**
 * Delete a payment (admin only — for corrections).
 * Note: the DB trigger does not auto-reverse the plan amount_paid,
 * so we manually recompute it here.
 */
export const deletePayment = async (paymentId: string) => {
  // 1. Get payment details
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('payment_plan_id, amount')
    .eq('id', paymentId)
    .single();

  if (fetchError) throw fetchError;
  if (!payment) throw new Error('Payment not found');

  // 2. Get current plan state
  const { data: plan, error: planError } = await supabase
    .from('payment_plans')
    .select('amount_paid, total_amount')
    .eq('id', payment.payment_plan_id)
    .single();

  if (planError) throw planError;

  // 3. Delete the payment row
  const { error: deleteError } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId);

  if (deleteError) throw deleteError;

  // 4. Re-derive plan amount_paid and status
  const newAmountPaid = Math.max(0, Number(plan.amount_paid) - Number(payment.amount));
  const newStatus = newAmountPaid >= Number(plan.total_amount) ? 'completed' : 'active';

  const { error: updateError } = await supabase
    .from('payment_plans')
    .update({ amount_paid: newAmountPaid, status: newStatus })
    .eq('id', payment.payment_plan_id);

  if (updateError) throw updateError;

  return { success: true };
};
