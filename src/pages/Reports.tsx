import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCredentials } from '@/hooks/useCredentials';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function Reports() {
  const { documents, requirements } = useCredentials();

  const stats = useMemo(() => {
    const totalDocuments = documents.length;
    const approved = documents.filter(doc => doc.status === 'approved' || doc.status === 'approved_with_exception').length;
    const pending = documents.filter(doc => doc.status === 'pending').length;
    const rejected = documents.filter(doc => doc.status === 'rejected').length;

    // Calculate approval rate
    const approvalRate = totalDocuments > 0 ? Math.round((approved / totalDocuments) * 100) : 0;

    // Calculate average processing time (mock data)
    const avgProcessingDays = 3.2;

    // Monthly trends (mock data for last 6 months)
    const monthlyData = [
      { month: 'Jan', approved: 45, pending: 12, rejected: 3 },
      { month: 'Feb', approved: 52, pending: 15, rejected: 5 },
      { month: 'Mar', approved: 48, pending: 18, rejected: 2 },
      { month: 'Apr', approved: 61, pending: 22, rejected: 4 },
      { month: 'May', approved: 55, pending: 14, rejected: 6 },
      { month: 'Jun', approved: 67, pending: 19, rejected: 3 },
    ];

    // Top credential types
    const credentialStats = requirements.map(req => {
      const reqDocs = documents.filter(doc => doc.requirementId === req.id);
      const approvedCount = reqDocs.filter(doc => doc.status === 'approved' || doc.status === 'approved_with_exception').length;
      return {
        name: req.name,
        total: reqDocs.length,
        approved: approvedCount,
        rate: reqDocs.length > 0 ? Math.round((approvedCount / reqDocs.length) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);

    // Students by readiness
    const studentsByReadiness = {
      complete: 23,
      almostComplete: 15,
      inProgress: 32,
      justStarted: 8,
    };

    return {
      totalDocuments,
      approved,
      pending,
      rejected,
      approvalRate,
      avgProcessingDays,
      monthlyData,
      credentialStats,
      studentsByReadiness,
    };
  }, [documents, requirements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track credentialing performance and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-3xl font-bold">{stats.totalDocuments}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12% from last month
                </p>
              </div>
              <FileCheck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvalRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +5% from last month
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. processing: {stats.avgProcessingDays} days
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejection Rate</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.totalDocuments > 0 ? Math.round((stats.rejected / stats.totalDocuments) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  -2% from last month
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyData.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{month.month} 2024</span>
                  <span className="text-muted-foreground">
                    {month.approved} approved, {month.pending} pending, {month.rejected} rejected
                  </span>
                </div>
                <div className="flex gap-1 h-2">
                  <div
                    className="bg-green-500 rounded-sm"
                    style={{ width: `${(month.approved / (month.approved + month.pending + month.rejected)) * 100}%` }}
                  />
                  <div
                    className="bg-yellow-500 rounded-sm"
                    style={{ width: `${(month.pending / (month.approved + month.pending + month.rejected)) * 100}%` }}
                  />
                  <div
                    className="bg-red-500 rounded-sm"
                    style={{ width: `${(month.rejected / (month.approved + month.pending + month.rejected)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Credential Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Credential Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.credentialStats.slice(0, 5).map((cred) => (
                <div key={cred.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cred.name}</span>
                    <span className="text-muted-foreground">
                      {cred.approved}/{cred.total} ({cred.rate}%)
                    </span>
                  </div>
                  <Progress value={cred.rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Readiness Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Readiness Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Complete</span>
                </div>
                <span className="font-medium">{stats.studentsByReadiness.complete}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Almost Complete</span>
                </div>
                <span className="font-medium">{stats.studentsByReadiness.almostComplete}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-medium">{stats.studentsByReadiness.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  <span className="text-sm">Just Started</span>
                </div>
                <span className="font-medium">{stats.studentsByReadiness.justStarted}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Performing Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Sarah Johnson', completed: 8, total: 8, rate: 100 },
              { name: 'Michael Chen', completed: 7, total: 8, rate: 88 },
              { name: 'Emily Davis', completed: 6, total: 8, rate: 75 },
              { name: 'James Wilson', completed: 6, total: 8, rate: 75 },
              { name: 'Lisa Brown', completed: 5, total: 8, rate: 63 },
            ].map((student, index) => (
              <div key={student.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.completed}/{student.total} credentials completed
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{student.rate}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}