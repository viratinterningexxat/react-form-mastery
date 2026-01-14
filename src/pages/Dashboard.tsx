import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCredentials } from '@/hooks/useCredentials';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { ReadinessCard } from '@/components/credentials/ReadinessCard';
import { AlertsPanel } from '@/components/credentials/AlertsPanel';
import {
  FileCheck,
  User,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Upload,
  TrendingUp,
} from 'lucide-react';

const QuickStatCard = memo(function QuickStatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}/10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const Dashboard = memo(function Dashboard() {
  const { clinicalReadiness, alerts, markAlertAsRead, documentsByCategory, requirements } = useCredentials();
  const { profile, getProfileCompleteness } = useStudentProfile();

  const profileCompleteness = getProfileCompleteness();

  // Calculate quick actions needed
  const pendingUploads = requirements.filter(
    (req) => !documentsByCategory[req.category]?.find((item) => item.requirement.id === req.id)?.document
  ).length;

  const handleMarkAlertRead = useCallback((alertId: string) => {
    markAlertAsRead(alertId);
  }, [markAlertAsRead]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{profile.firstName ? `, ${profile.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Track your clinical readiness and manage your credentials
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/credentials">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </Link>
          <Link to="/profile">
            <Button className="gradient-primary">
              <User className="w-4 h-4 mr-2" />
              Complete Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Clinical Readiness Status */}
      <ReadinessCard readiness={clinicalReadiness} />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickStatCard
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
          label="Approved"
          value={clinicalReadiness.totalCompleted}
          trend={`of ${clinicalReadiness.totalRequired} required`}
          color="success"
        />
        <QuickStatCard
          icon={<Clock className="w-5 h-5 text-primary" />}
          label="Pending Review"
          value={clinicalReadiness.totalPending}
          color="primary"
        />
        <QuickStatCard
          icon={<AlertTriangle className="w-5 h-5 text-warning" />}
          label="Expiring Soon"
          value={clinicalReadiness.totalExpiring}
          color="warning"
        />
        <QuickStatCard
          icon={<FileCheck className="w-5 h-5 text-muted-foreground" />}
          label="Need Upload"
          value={pendingUploads}
          color="muted"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <AlertsPanel alerts={alerts} onMarkAsRead={handleMarkAlertRead} />

        {/* Profile Completion */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Status
              </CardTitle>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Completeness</span>
                <span className="font-medium">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2" />
            </div>

            {profileCompleteness < 100 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Complete your profile to:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Stand out to clinical sites
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Generate a shareable profile link
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Build your professional identity
                  </li>
                </ul>
              </div>
            )}

            <Link to="/profile">
              <Button variant="outline" className="w-full">
                {profileCompleteness < 100 ? 'Complete Profile' : 'View Profile'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/credentials" className="block">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Upload Documents</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingUploads} documents needed
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/profile" className="block">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <User className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Update Profile</p>
                    <p className="text-sm text-muted-foreground">
                      {profileCompleteness}% complete
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/alerts" className="block">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Review Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      {alerts.filter(a => !a.isRead).length} unread alerts
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default Dashboard;
