
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/pages/Auth/RequireAuth";
import { RequireAdmin } from "@/pages/Auth/RequireAdmin";
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
import PaymentHistory from "./pages/Client/PaymentHistory";
import NotFound from "./pages/NotFound";
import InventoryManagement from "./pages/Admin/InventoryManagement";
import StockMovementsHistory from "./pages/Admin/StockMovementsHistory";
import ManageClients from "./pages/Admin/ManageClients";
import PendingApplications from "./pages/Admin/PendingApplications";
import RecordPayment from "./pages/Admin/RecordPayment";
import ViewReceipt from "./pages/Client/ViewReceipt";
import Profile from "./pages/Client/Profile";
import Settings from "./pages/Client/Settings";
import ClientPaymentHistory from "./pages/Admin/ClientPaymentHistory";

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
          {/* Admin routes - require both auth and admin role */}
          <Route path="/admin" element={
           <RequireAuth>
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          </RequireAuth>
            } />
          <Route path="/add-laptop" element={
            <RequireAuth>
              <RequireAdmin>
                <AddLaptop />
              </RequireAdmin>
            </RequireAuth>
            } />
          <Route path="/inventory" element={
            <RequireAuth>
              <RequireAdmin>
                <InventoryManagement />
              </RequireAdmin>
             </RequireAuth>
            } />
          <Route path="/stock-movements" element={
            <RequireAuth>
              <RequireAdmin>
                <StockMovementsHistory />
              </RequireAdmin>
             </RequireAuth>
            } />
          <Route path="/manage-clients" element={
            <RequireAuth>
              <RequireAdmin>
                <ManageClients />
              </RequireAdmin>
             </RequireAuth>
            } />
          <Route path="/pending-applications" element={
            <RequireAuth>
              <RequireAdmin>
                <PendingApplications />
              </RequireAdmin>
             </RequireAuth>
            } />
          <Route path="/record-payment" element={
            <RequireAuth>
              <RequireAdmin>
                <RecordPayment />
              </RequireAdmin>
             </RequireAuth>
            } />
          <Route path="/client-payment-history" element={
            <RequireAuth>
              <RequireAdmin>
                <ClientPaymentHistory />
              </RequireAdmin>
             </RequireAuth>
            } />
          {/* Public routes - no auth required */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<LaptopDetails />} />
          
          {/* Protected route - auth required to apply */}
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
           <Route path="/payment-history" element={
             <RequireAuth>
               <PaymentHistory />
             </RequireAuth>
             } />
           <Route path="/receipt/:paymentId" element={
             <RequireAuth>
               <ViewReceipt />
             </RequireAuth>
             } />
           <Route path="/profile" element={
             <RequireAuth>
               <Profile />
             </RequireAuth>
             } />
           <Route path="/settings" element={
             <RequireAuth>
               <Settings />
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
