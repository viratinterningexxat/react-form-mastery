import { memo, ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileCheck,
  User,
  Bell,
  Shield,
  Menu,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
  alertCount?: number;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

const NavItem = memo(function NavItem({ to, icon, label, badge, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink to={to} onClick={onClick}>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          "w-full justify-start gap-3 transition-all duration-200",
          isActive && "bg-primary/10 text-primary shadow-sm"
        )}
      >
        {icon}
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">
            {badge}
          </Badge>
        )}
      </Button>
    </NavLink>
  );
});

const Navigation = memo(function Navigation({ 
  alertCount, 
  onItemClick 
}: { 
  alertCount?: number; 
  onItemClick?: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onItemClick?.();
  };

  if (user?.role === 'approver') {
    return (
      <nav className="space-y-1">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Review Portal"
          onClick={onItemClick}
        />
        <NavItem
          to="/students"
          icon={<Users className="w-5 h-5" />}
          label="All Students"
          onClick={onItemClick}
        />
        <NavItem
          to="/reports"
          icon={<BarChart3 className="w-5 h-5" />}
          label="Reports"
          onClick={onItemClick}
        />
        <NavItem
          to="/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          onClick={onItemClick}
        />
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>
    );
  }

  if (user?.role === 'clinical_site') {
    return (
      <nav className="space-y-1">
        <NavItem
          to="/clinical/home"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Clinical Dashboard"
          onClick={onItemClick}
        />
        <NavItem
          to="/credentials"
          icon={<FileCheck className="w-5 h-5" />}
          label="Student Credentials"
          onClick={onItemClick}
        />
        <NavItem
          to="/students"
          icon={<Users className="w-5 h-5" />}
          label="Manage Students"
          onClick={onItemClick}
        />
        <NavItem
          to="/reports"
          icon={<BarChart3 className="w-5 h-5" />}
          label="Clinical Reports"
          onClick={onItemClick}
        />
        <NavItem
          to="/clinical/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          onClick={onItemClick}
        />
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>
    );
  }

  // Student navigation
  return (
    <nav className="space-y-1">
      <NavItem
        to="/student/home"
        icon={<LayoutDashboard className="w-5 h-5" />}
        label="Dashboard"
        onClick={onItemClick}
      />
      <NavItem
        to="/credentials"
        icon={<FileCheck className="w-5 h-5" />}
        label="My Credentials"
        onClick={onItemClick}
      />
      <NavItem
        to="/checklist"
        icon={<ClipboardCheck className="w-5 h-5" />}
        label="Ready Checklist"
        onClick={onItemClick}
      />
      <NavItem
        to="/profile"
        icon={<User className="w-5 h-5" />}
        label="Profile"
        onClick={onItemClick}
      />
      <NavItem
        to="/alerts"
        icon={<Bell className="w-5 h-5" />}
        label="Alerts"
        badge={alertCount}
        onClick={onItemClick}
      />
      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  );
});

export const AppLayout = memo(function AppLayout({ children, alertCount }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMobileItemClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Blobs for Glassmorphism */}
      <div className="fixed top-0 -left-4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob dark:bg-pink-900 dark:mix-blend-screen pointer-events-none" />
      <div className="fixed top-0 -right-4 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 dark:bg-sky-900 dark:mix-blend-screen pointer-events-none" />
      <div className="fixed -bottom-8 left-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000 dark:bg-teal-900 dark:mix-blend-screen pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b-white/20">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold">ClinCred</span>
                </div>
                <Navigation alertCount={alertCount} onItemClick={handleMobileItemClick} />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                 <img 
                   src="https://exxat.com/wp-content/uploads/2024/02/Exxat_logo.svg" 
                   alt="Exxat Logo" 
                   className="h-8 dark:brightness-200 dark:contrast-200" 
                   onError={(e) => { 
                     const target = e.currentTarget;
                     target.onerror = null; // Prevent infinite loop
                     // Create a visually identical text fallback just in case the link breaks
                     target.outerHTML = '<span class="text-2xl font-bold tracking-tight text-[#E31C79] dark:text-pink-400 font-serif">exxat</span>';
                   }} 
                 />
              </div>
              <div className="h-8 w-px bg-border/60 mx-2 hidden sm:block" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight">ClinCred</h1>
                <p className="text-[10px] uppercase tracking-wider font-bold text-primary hidden sm:block">
                  Clinical Credentialing
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavLink to="/alerts">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {alertCount !== undefined && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
                    {alertCount}
                  </span>
                )}
              </Button>
            </NavLink>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{user?.name}</span>
              <Badge variant="outline" className="text-xs">
                {user?.role}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              <Navigation alertCount={alertCount} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
});
