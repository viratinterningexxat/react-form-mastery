import { memo, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCredentials } from '@/hooks/useCredentials';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { useShareableLink } from '@/hooks/useShareableLink';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  User,
  Edit,
  Link as LinkIcon,
  Copy,
  Share2,
  Eye,
  Trash2,
  Calendar,
  Shield,
} from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

const Dashboard = memo(function Dashboard() {
  const { clinicalReadiness, documents, requirements } = useCredentials();
  const { profile, updateProfile } = useStudentProfile();
  const { generateLink, shareableLink } = useShareableLink();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    program: profile.program || '',
    school: profile.school || '',
  });

  // Filter documents by status
  const approvedCredentials = documents.filter(doc =>
    doc.status === 'approved' || doc.status === 'approved_with_exception'
  );
  const pendingCredentials = documents.filter(doc => doc.status === 'pending');
  const expiringCredentials = documents.filter(doc => {
    if (!doc.expiresAt) return false;
    const daysUntil = differenceInDays(parseISO(doc.expiresAt), new Date());
    return daysUntil <= 30 && daysUntil > 0;
  });

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setEditForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      program: profile.program || '',
      school: profile.school || '',
    });
  };

  const handleProfileSave = () => {
    updateProfile(editForm);
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
  };

  const handleGenerateLink = () => {
    generateLink();
  };

  const handleCopyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'approved_with_exception':
        return <Badge className="bg-orange-500">Approved with Exception</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'approved_with_exception':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Credential Dashboard</h1>
          <p className="text-muted-foreground">Manage credentials and generate links</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">
            Clinical Ready: {clinicalReadiness.isReady ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            {!isEditingProfile && (
              <Button variant="outline" size="sm" onClick={handleProfileEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingProfile ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={editForm.program}
                  onChange={(e) => setEditForm(prev => ({ ...prev, program: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Select value={editForm.school} onValueChange={(value) => setEditForm(prev => ({ ...prev, school: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university-of-california">University of California</SelectItem>
                    <SelectItem value="stanford-university">Stanford University</SelectItem>
                    <SelectItem value="uc-berkeley">UC Berkeley</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button onClick={handleProfileSave}>Save Changes</Button>
                <Button variant="outline" onClick={handleProfileCancel}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Legal Name</Label>
                <p className="text-sm text-muted-foreground">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm text-muted-foreground">{profile.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Program</Label>
                <p className="text-sm text-muted-foreground">{profile.program || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">School</Label>
                <p className="text-sm text-muted-foreground">{profile.school || 'Not provided'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Approved Credentials
            </span>
            <Badge variant="secondary">{approvedCredentials.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedCredentials.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No approved credentials yet</p>
          ) : (
            <div className="space-y-4">
              {approvedCredentials.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h3 className="font-medium">{doc.requirementName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Approved {doc.approvedAt ? format(parseISO(doc.approvedAt), 'MMM dd, yyyy') : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Credentials
            </span>
            <Badge variant="secondary">{pendingCredentials.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCredentials.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending credentials</p>
          ) : (
            <div className="space-y-4">
              {pendingCredentials.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h3 className="font-medium">{doc.requirementName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted {format(parseISO(doc.submittedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiring Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Expiring Credentials
            </span>
            <Badge variant="secondary">{expiringCredentials.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringCredentials.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No credentials expiring soon</p>
          ) : (
            <div className="space-y-4">
              {expiringCredentials.map((doc) => {
                const daysUntil = differenceInDays(parseISO(doc.expiresAt!), new Date());
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <div>
                        <h3 className="font-medium">{doc.requirementName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Expires in {daysUntil} days ({format(parseISO(doc.expiresAt!), 'MMM dd, yyyy')})
                        </p>
                      </div>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Renew Now
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Credential Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/credentials?type=immunization">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Plus className="w-6 h-6" />
                <span>Add Immunization</span>
              </Button>
            </Link>
            <Link to="/credentials?type=cpr">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Plus className="w-6 h-6" />
                <span>Add CPR/BLS</span>
              </Button>
            </Link>
            <Link to="/credentials?type=labs">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Plus className="w-6 h-6" />
                <span>Add Lab Titer</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Verification Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Verification Link for Clinical Sites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a secure link to share your approved credentials with clinical sites and preceptors.
          </p>
          {!shareableLink ? (
            <Button onClick={handleGenerateLink}>
              <LinkIcon className="w-4 h-4 mr-2" />
              Generate Verification Link
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Your verification link:</p>
                <p className="text-xs text-muted-foreground break-all">{shareableLink}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default Dashboard;
