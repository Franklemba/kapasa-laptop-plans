
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/pages/Auth/RequireAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import CompleteProfile from "./pages/Client/CompleteProfile";
import Dashboard from "./pages/Client/Dashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Catalog from "./pages/Client/Catalog";
import LaptopDetails from "./pages/Client/LaptopDetails";
import ApplyForPlan from "./pages/Client/ApplyForPlan";
import AddLaptop from "./pages/Admin/AddLaptop";
import Notifications from "./pages/Client/Notifications";
import NotFound from "./pages/NotFound";
import InventoryManagement from "./pages/Admin/InventoryManagement";
import StockMovementsHistory from "./pages/Admin/StockMovementsHistory";
import ManageClients from "./pages/Admin/ManageClients";

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
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/dashboard" element={
              <RequireAuth>
                 <Dashboard />
              </RequireAuth>
            } />
          <Route path="/admin" element={
           <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
            } />
          <Route path="/add-laptop" element={
            <RequireAuth>
              <AddLaptop />
            </RequireAuth>
            } />
          <Route path="/inventory" element={
            <RequireAuth>
              <InventoryManagement />
             </RequireAuth>
            } />
          <Route path="/stock-movements" element={
            <RequireAuth>
              <StockMovementsHistory />
             </RequireAuth>
            } />
          <Route path="/manage-clients" element={
            <RequireAuth>
              <ManageClients />
             </RequireAuth>
            } />
          <Route path="/catalog" element={
            <RequireAuth>
              <Catalog />
             </RequireAuth>
            } />
          <Route path="/catalog/:id" element={
            <RequireAuth>
              <LaptopDetails />
             </RequireAuth>
            } />
          <Route path="/catalog/:id/apply" element={
            <RequireAuth>
              <ApplyForPlan />
             </RequireAuth>
            } />
          <Route path="/notifications" element={
            <RequireAuth>
              <Notifications />
             </RequireAuth>
            } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
