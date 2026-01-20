import { memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCredentials } from '@/hooks/useCredentials';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { CircularProgress } from '@/components/dashboard/CircularProgress';
import { ExpirationTimeline } from '@/components/dashboard/ExpirationTimeline';
import { CategoryProgress } from '@/components/dashboard/CategoryProgress';
import { AlertsPanel } from '@/components/credentials/AlertsPanel';
import {
  FileCheck,
  User,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  ClipboardCheck,
  Shield,
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

const QuickStatCard = memo(function QuickStatCard({
  icon,
  label,
  value,
  trend,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  colorClass: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const Dashboard = memo(function Dashboard() {
  const { clinicalReadiness, alerts, markAlertAsRead, documents, requirements, documentsByCategory } = useCredentials();
  const { profile, getProfileCompleteness } = useStudentProfile();

  const profileCompleteness = getProfileCompleteness();

  // Calculate quick actions needed
  const pendingUploads = requirements.filter(
    (req) => !documents.find((d) => d.requirementId === req.id)
  ).length;

  // Prepare timeline items
  const timelineItems = useMemo(() => {
    return documents
      .filter((doc) => doc.expiresAt)
      .map((doc) => {
        const requirement = requirements.find((r) => r.id === doc.requirementId);
        const daysUntil = differenceInDays(parseISO(doc.expiresAt!), new Date());
        
        let status: 'expired' | 'expiring_soon' | 'upcoming' | 'safe' = 'safe';
        if (daysUntil < 0) status = 'expired';
        else if (daysUntil <= 30) status = 'expiring_soon';
        else if (daysUntil <= 90) status = 'upcoming';

        return {
          id: doc.id,
          name: requirement?.name || doc.fileName,
          expiresAt: doc.expiresAt!,
          status,
        };
      })
      .filter((item) => item.status !== 'safe');
  }, [documents, requirements]);

  // Prepare category progress data
  const categoryProgress = useMemo(() => {
    const categories: { category: string; completed: number; total: number }[] = [];
    
    Object.entries(documentsByCategory).forEach(([category, items]) => {
      const completed = items.filter(
        (item) => item.document && (item.document.status === 'approved' || item.document.status === 'approved_with_exception')
      ).length;
      categories.push({
        category,
        completed,
        total: items.length,
      });
    });

    return categories;
  }, [documentsByCategory]);

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
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Documents
            </Button>
          </Link>
          <Link to="/checklist">
            <Button className="gradient-primary gap-2 shadow-md hover:shadow-lg transition-shadow">
              <ClipboardCheck className="w-4 h-4" />
              View Checklist
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Readiness Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <CircularProgress
                value={clinicalReadiness.percentComplete}
                size={160}
                strokeWidth={12}
                label="Clinical Ready"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Clinical Readiness Status</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  {clinicalReadiness.isReady
                    ? 'Congratulations! You are ready for your clinical rotation.'
                    : `Complete ${clinicalReadiness.totalRequired - clinicalReadiness.totalCompleted} more requirements to become clinical-ready.`}
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>{clinicalReadiness.totalCompleted} Approved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{clinicalReadiness.totalPending} Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span>{clinicalReadiness.totalExpiring} Expiring</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickStatCard
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
          label="Approved"
          value={clinicalReadiness.totalCompleted}
          trend={`of ${clinicalReadiness.totalRequired} required`}
          colorClass="bg-success/10"
        />
        <QuickStatCard
          icon={<Clock className="w-5 h-5 text-primary" />}
          label="Pending Review"
          value={clinicalReadiness.totalPending}
          colorClass="bg-primary/10"
        />
        <QuickStatCard
          icon={<AlertTriangle className="w-5 h-5 text-warning" />}
          label="Expiring Soon"
          value={clinicalReadiness.totalExpiring}
          colorClass="bg-warning/10"
        />
        <QuickStatCard
          icon={<FileCheck className="w-5 h-5 text-muted-foreground" />}
          label="Need Upload"
          value={pendingUploads}
          colorClass="bg-muted"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <ExpirationTimeline items={timelineItems} />

        {/* Category Progress */}
        <CategoryProgress categories={categoryProgress} />
      </div>

      {/* Alerts & Profile Row */}
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
              <div className="p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
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

            <Link to="/checklist" className="block">
              <div className="p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                    <ClipboardCheck className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Ready Checklist</p>
                    <p className="text-sm text-muted-foreground">
                      Verify clinical readiness
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/alerts" className="block">
              <div className="p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
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
