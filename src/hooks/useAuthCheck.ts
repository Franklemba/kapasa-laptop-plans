
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuthCheck = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          setIsLoading(false);
          return;
        }

        if (!user) {
          console.log('No user found');
          setIsLoading(false);
          return;
        }

        console.log('Current user:', user);
        setUser(user);
      } catch (error) {
        console.error('Error in checkAuth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
};
