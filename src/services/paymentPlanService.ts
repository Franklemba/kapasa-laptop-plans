
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

  // For now, we'll simulate the application submission
  // In a real implementation, you'd save this to a payment_plan_applications table
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, applicationId: `app_${Date.now()}` });
    }, 2000);
  });
};
