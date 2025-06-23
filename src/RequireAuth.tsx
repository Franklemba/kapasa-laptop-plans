import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const useAuthGuard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate("/login");
    });
  }, [navigate]);
};

export function RequireAuth({ children }) {
  useAuthGuard();
  return children;
}
