import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";

// Auth Pages
import AuthLanding from "@/pages/auth/AuthLanding";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ResetPassword from "@/pages/auth/ResetPassword";
import Unauthorized from "@/pages/Unauthorized";

// App Pages
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import SKUs from "@/pages/SKUs";
import Inventory from "@/pages/Inventory";
import PurchaseOrders from "@/pages/PurchaseOrders";
import Suppliers from "@/pages/Suppliers";
import Warehouses from "@/pages/Warehouses";
import Approvals from "@/pages/Approvals";
import AccessApprovals from "@/pages/AccessApprovals";
import Reports from "@/pages/Reports";
import Billing from "@/pages/Billing";
import Settings from "@/pages/Settings";
import Shipments from "@/pages/Shipments";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthLanding />} />
      <Route path="/auth/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/auth/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes - All Users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/purchase-orders" element={
        <ProtectedRoute>
          <AppLayout><PurchaseOrders /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/shipments" element={
        <ProtectedRoute>
          <AppLayout><Shipments /></AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Protected Routes - Admin Only */}
      <Route path="/products" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Products /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/skus" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><SKUs /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Inventory /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/suppliers" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Suppliers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/warehouses" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Warehouses /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/approvals" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Approvals /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/access-approvals" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><AccessApprovals /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Reports /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Billing /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><Settings /></AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
