import { memo, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
  return (
    <nav className="space-y-1">
      <NavItem
        to="/"
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
    </nav>
  );
});

export const AppLayout = memo(function AppLayout({ children, alertCount }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileItemClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">ClinCred</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
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
