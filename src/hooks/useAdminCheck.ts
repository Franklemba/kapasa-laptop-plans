import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setUserId(session.user.id);

        // Check if user is admin
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (clientError) {
          console.error('Error checking admin status:', clientError);
          setIsAdmin(false);
        } else {
          setIsAdmin(client?.role === 'admin');
        }
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading, userId };
}
