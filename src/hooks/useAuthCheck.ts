
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthCheck = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          navigate("/login");
          return;
        }

        if (!user) {
          console.log('No user found, redirecting to login');
          navigate("/login");
          return;
        }

        console.log('Current user:', user);
        setUser(user);

        // Check if profile already exists
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (clientError && clientError.code !== 'PGRST116') {
          console.error('Error checking client profile:', clientError);
        }

        if (clientData) {
          // Profile already exists, redirect to dashboard
          console.log('Profile exists, redirecting to dashboard');
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { user, isLoading };
};
