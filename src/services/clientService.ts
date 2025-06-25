
import { supabase } from "@/integrations/supabase/client";

interface CreateClientData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  nationalId: string;
  employmentStatus: string;
  monthlyIncome: string;
  creditScore: string;
  notes: string;
}

export const createClientProfile = async (user: any, formData: CreateClientData) => {
  console.log('Attempting to create client profile for user:', user.id);
  console.log('User email:', user.email);

  const { data, error } = await supabase.from("clients").insert({
    user_id: user.id,
    email: user.email || "",
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone: formData.phone || null,
    address: formData.address || null,
    national_id: formData.nationalId || null,
    employment_status: formData.employmentStatus || null,
    monthly_income: formData.monthlyIncome ? Number(formData.monthlyIncome) : null,
    credit_score: formData.creditScore ? Number(formData.creditScore) : null,
    status: "active",
    notes: formData.notes || null,
  }).select();

  if (error) {
    console.error('Insert error:', error);
    throw error;
  }

  console.log('Client profile created successfully:', data);
  return data;
};
