import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Catalog from "./pages/Catalog";
import LaptopDetails from "./pages/LaptopDetails";
import ApplyForPlan from "./pages/ApplyForPlan";
import AddLaptop from "./pages/AddLaptop";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import InventoryManagement from "./pages/InventoryManagement";
import StockMovementsHistory from "./pages/StockMovementsHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-laptop" element={<AddLaptop />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/stock-movements" element={<StockMovementsHistory />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<LaptopDetails />} />
          <Route path="/catalog/:id/apply" element={<ApplyForPlan />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
