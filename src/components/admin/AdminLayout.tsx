import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Laptop, 
  LayoutDashboard, 
  Package, 
  Users, 
  PlusCircle, 
  History,
  LogOut,
  Clock,
  DollarSign,
  Receipt
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/pending-applications", icon: Clock, label: "Pending Applications" },
    { path: "/record-payment", icon: DollarSign, label: "Record Payment" },
    { path: "/client-payment-history", icon: Receipt, label: "Payment History" },
    { path: "/inventory", icon: Package, label: "Inventory" },
    { path: "/add-laptop", icon: PlusCircle, label: "Add Laptop" },
    { path: "/stock-movements", icon: History, label: "Stock Movements" },
    { path: "/manage-clients", icon: Users, label: "Manage Clients" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r hidden lg:block">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Laptop className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-primary">fiTech</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Laptop className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-primary">fiTech</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
};
