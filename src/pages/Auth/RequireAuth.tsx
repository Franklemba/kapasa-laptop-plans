import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/login");
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  if (checking) {
    // You can return a spinner or null for a blank screen
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
