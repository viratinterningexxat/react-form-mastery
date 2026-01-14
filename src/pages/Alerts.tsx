import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCredentials } from '@/hooks/useCredentials';
import { ExpirationAlert } from '@/types/credential';
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  ArrowRight,
  CheckCheck,
  Calendar,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const Alerts = memo(function Alerts() {
  const { alerts, markAlertAsRead } = useCredentials();

  const handleMarkAsRead = useCallback(
    (alertId: string) => {
      markAlertAsRead(alertId);
    },
    [markAlertAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    alerts.forEach((alert) => {
      if (!alert.isRead) {
        markAlertAsRead(alert.id);
      }
    });
  }, [alerts, markAlertAsRead]);

  const getSeverityIcon = (severity: ExpirationAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getSeverityBg = (severity: ExpirationAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/5';
      case 'warning':
        return 'border-warning/50 bg-warning/5';
      default:
        return 'border-primary/50 bg-primary/5';
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.daysUntilExpiry - b.daysUntilExpiry;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Expiration Alerts</h1>
          </div>
          <p className="text-muted-foreground">
            Stay on top of expiring credentials to maintain clinical readiness.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter((a) => a.severity === 'critical').length}
                </p>
                <p className="text-sm text-muted-foreground">Critical (Expired)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter((a) => a.severity === 'warning').length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon (30 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Info className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter((a) => a.severity === 'info').length}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming (90 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Check className="w-16 h-16 mx-auto mb-4 text-success" />
              <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground mb-4">
                No credentials are expiring within the next 90 days.
              </p>
              <Link to="/credentials">
                <Button>
                  View All Credentials
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Alerts ({alerts.length})</span>
              <Badge variant="secondary">{unreadCount} unread</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    getSeverityBg(alert.severity),
                    alert.isRead && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <h4 className="font-medium">{alert.credentialName}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {alert.daysUntilExpiry <= 0
                              ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                              : `Expires in ${alert.daysUntilExpiry} days`}
                          </span>
                          <span>•</span>
                          <span>{format(parseISO(alert.expiresAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          alert.severity === 'critical'
                            ? 'destructive'
                            : alert.severity === 'warning'
                            ? 'outline'
                            : 'secondary'
                        }
                        className={cn(
                          alert.severity === 'warning' && 'border-warning text-warning'
                        )}
                      >
                        {alert.severity}
                      </Badge>
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Link to="/credentials">
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default Alerts;
