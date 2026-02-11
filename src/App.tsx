import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ApproverDashboard from "./pages/ApproverDashboard";
import Credentials from "./pages/Credentials";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Checklist from "./pages/Checklist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Students from "./pages/Students";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Role-based Dashboard Component
function RoleBasedDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'approver':
      return <Navigate to="/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/student/home" replace />;
  }
}

// Wrapper component to provide layout with alert count
function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:linkId" element={<Verify />} />
        <Route path="/share/:linkId" element={<SharedProfile />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<RoleBasedDashboard />} />
        <Route path="/student/home" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['approver']}>
            <ApproverDashboard />
          </ProtectedRoute>
        } />
        <Route path="/credentials" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Credentials />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Alerts />
          </ProtectedRoute>
        } />
        <Route path="/checklist" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Checklist />
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute allowedRoles={['approver']}>
            <Students />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['approver']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['approver']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/verify/:linkId" element={<Verify />} />
        <Route path="/share/:linkId" element={<SharedProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
