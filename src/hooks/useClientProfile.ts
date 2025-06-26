
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
}

export const useClientProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, first_name, last_name, email, phone, address, national_id, employment_status, monthly_income")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching client profile:", error);
          setError("Failed to load profile data");
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error("Error in fetchProfile:", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, isLoading, error };
};
