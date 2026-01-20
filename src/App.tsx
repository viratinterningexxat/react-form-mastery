import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCredentials } from "@/hooks/useCredentials";
import Dashboard from "./pages/Dashboard";
import Credentials from "./pages/Credentials";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Checklist from "./pages/Checklist";
import SharedProfile from "./pages/SharedProfile";
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
        <Route path="/checklist" element={<Checklist />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Shared profile has its own layout */}
            <Route path="/share/:linkId" element={<SharedProfile />} />
            {/* All other routes use AppLayout */}
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
