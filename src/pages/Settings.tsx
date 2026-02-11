import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Save,
  Bell,
  Shield,
  Mail,
  Clock,
  Users,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoReminders, setAutoReminders] = useState(true);
  const [approvalWorkflow, setApprovalWorkflow] = useState('dual');
  const [expirationAlerts, setExpirationAlerts] = useState(30);

  const handleSave = () => {
    // Mock save functionality
    console.log('Settings saved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and workflows</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="University Health System" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@university.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Standard Time</SelectItem>
                      <SelectItem value="mst">Mountain Standard Time</SelectItem>
                      <SelectItem value="cst">Central Standard Time</SelectItem>
                      <SelectItem value="est">Eastern Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Organization Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your organization..."
                  defaultValue="A leading academic medical center dedicated to excellence in healthcare education and patient care."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save forms</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save form progress every 30 seconds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark mode by default</Label>
                  <p className="text-sm text-muted-foreground">
                    Set dark mode as the default theme for all users
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show progress indicators</Label>
                  <p className="text-sm text-muted-foreground">
                    Display completion progress on all pages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Credential submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when students submit new credentials
                  </p>
                </div>
                <Switch defaultChecked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Approval decisions</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify students when credentials are approved/rejected
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Expiration alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders for expiring credentials
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Send weekly summary reports to administrators
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alert Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiration-alerts">Expiration alert (days before)</Label>
                  <Input
                    id="expiration-alerts"
                    type="number"
                    value={expirationAlerts}
                    onChange={(e) => setExpirationAlerts(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pending-threshold">Pending review threshold</Label>
                  <Input id="pending-threshold" type="number" defaultValue="10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Settings */}
        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Approval Workflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Approval Process</Label>
                <Select value={approvalWorkflow} onValueChange={setApprovalWorkflow}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Approver</SelectItem>
                    <SelectItem value="dual">Dual Approval Required</SelectItem>
                    <SelectItem value="committee">Committee Review</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {approvalWorkflow === 'single' && 'One approver can make final decisions'}
                  {approvalWorkflow === 'dual' && 'Two approvers must review and agree'}
                  {approvalWorkflow === 'committee' && 'Requires committee approval for complex cases'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-reminders for pending reviews</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders to approvers for pending items
                  </p>
                </div>
                <Switch defaultChecked={autoReminders} onCheckedChange={setAutoReminders} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow approvers to edit student data</Label>
                  <p className="text-sm text-muted-foreground">
                    Permit approvers to modify student information
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require email verification</Label>
                  <p className="text-sm text-muted-foreground">
                    New users must verify their email before accessing the system
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-factor authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all administrative accounts
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out inactive users after 30 minutes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password requirements</Label>
                  <p className="text-sm text-muted-foreground">
                    Require strong passwords (8+ chars, mixed case, numbers, symbols)
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP restrictions</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit access to specific IP ranges
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all user actions for compliance
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Database: Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">API: Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Storage: Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}