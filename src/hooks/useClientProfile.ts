
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  national_id: string | null;
  employment_status: string | null;
  monthly_income: number | null;
  status: string | null;
  role: string | null;
  created_at: string | null;
}

export const useClientProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, address, national_id, employment_status, monthly_income, status, role, created_at")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows gracefully

      if (error) {
        console.error("Error fetching client profile:", error);
        setError("Failed to load profile data");
        return;
      }

      // If no profile exists, data will be null (not an error)
      setProfile(data);
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return { profile, isLoading, error, refetch: fetchProfile };
};
