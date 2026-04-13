import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCredentials } from '@/hooks/useCredentials';
import { 
  Users, 
  FileCheck, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Building2,
  Stethoscope
} from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

const ClinicalDashboard = memo(function ClinicalDashboard() {
  const { documents, requirements } = useCredentials();

  const defaultStats = {
    totalStudents: 142,
    pendingReviews: 23,
    completedToday: 12,
    expiringSoon: 8,
  };

  const stats = useMemo(() => {
    if (!documents.length) return defaultStats;

    const uniqueStudents = new Set(documents.map((doc) => doc.studentId || doc.id));
    const pendingReviews = documents.filter((doc) => doc.status === 'pending_review').length;
    const completedToday = documents.filter((doc) => {
      if (!doc.reviewedAt) return false;
      return differenceInDays(new Date(), parseISO(doc.reviewedAt)) === 0;
    }).length;
    const expiringSoon = documents.filter((doc) => {
      if (!doc.expiresAt) return false;
      const daysLeft = differenceInDays(parseISO(doc.expiresAt), new Date());
      return daysLeft > 0 && daysLeft <= 30;
    }).length;

    return {
      totalStudents: Math.max(uniqueStudents.size, defaultStats.totalStudents),
      pendingReviews,
      completedToday,
      expiringSoon,
    };
  }, [documents]);

  const recentActivities = useMemo(() => {
    if (!documents.length) {
      return [
        {
          id: 1,
          student: 'John Smith',
          credential: 'Hepatitis B Vaccination',
          status: 'pending',
          timestamp: '2 hours ago'
        },
        {
          id: 2,
          student: 'Sarah Johnson',
          credential: 'CPR Certification',
          status: 'approved',
          timestamp: '4 hours ago'
        },
        {
          id: 3,
          student: 'Mike Davis',
          credential: 'TB Test',
          status: 'expired',
          timestamp: '1 day ago'
        }
      ];
    }

    return documents
      .slice()
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 3)
      .map((doc) => ({
        id: doc.id,
        student: doc.studentName || doc.studentId || 'Student',
        credential: requirements.find((r) => r.id === doc.requirementId)?.name || 'Credential',
        status:
          doc.status === 'approved'
            ? 'approved'
            : doc.status === 'approved_with_exception'
            ? 'approved'
            : doc.status === 'pending_review'
            ? 'pending'
            : doc.status === 'rejected'
            ? 'rejected'
            : 'pending',
        timestamp: doc.reviewedAt
          ? format(parseISO(doc.reviewedAt), 'MMM d, h:mm a')
          : `${Math.max(1, differenceInDays(new Date(), parseISO(doc.uploadedAt)))} days ago`,
      }));
  }, [documents, requirements]);

  const upcomingDeadlines = useMemo(() => {
    if (!documents.length) {
      return [
        {
          id: 1,
          student: 'Emma Wilson',
          credential: 'Flu Vaccination',
          deadline: '2024-02-15',
          daysLeft: 15
        },
        {
          id: 2,
          student: 'Alex Brown',
          credential: 'Physical Exam',
          deadline: '2024-02-20',
          daysLeft: 20
        }
      ];
    }

    return documents
      .filter((doc) => doc.expiresAt)
      .map((doc) => ({
        id: doc.id,
        student: doc.studentName || doc.studentId || 'Student',
        credential: requirements.find((r) => r.id === doc.requirementId)?.name || 'Credential',
        deadline: doc.expiresAt!,
        daysLeft: differenceInDays(parseISO(doc.expiresAt!), new Date()),
      }))
      .filter((item) => item.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [documents, requirements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clinical Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage student credentials and clinical requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <FileCheck className="w-4 h-4 mr-2" />
            New Review
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Reviews processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{activity.student}</p>
                    <p className="text-sm text-muted-foreground">{activity.credential}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge 
                    variant={
                      activity.status === 'approved' ? 'success' :
                      activity.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{deadline.student}</p>
                    <p className="text-sm text-muted-foreground">{deadline.credential}</p>
                    <p className="text-xs text-muted-foreground">Due: {deadline.deadline}</p>
                  </div>
                  <Badge variant="outline">
                    {deadline.daysLeft} days
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Clinical Site Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileCheck className="w-6 h-6" />
              <span>Review Credentials</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ClinicalDashboard;