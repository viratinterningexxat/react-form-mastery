import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCredentials } from "@/hooks/useCredentials";
import Dashboard from "./pages/Dashboard";
import Credentials from "./pages/Credentials";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component to provide layout with alert count
function AppRoutes() {
  const { unreadAlertsCount } = useCredentials();

  return (
    <AppLayout alertCount={unreadAlertsCount}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
