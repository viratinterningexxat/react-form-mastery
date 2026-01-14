import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExpirationAlert } from '@/types/credential';
import { Bell, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: ExpirationAlert[];
  onMarkAsRead: (alertId: string) => void;
}

export const AlertsPanel = memo(function AlertsPanel({ alerts, onMarkAsRead }: AlertsPanelProps) {
  const sortedAlerts = [...alerts].sort((a, b) => {
    // Sort by severity first (critical > warning > info), then by days until expiry
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.daysUntilExpiry - b.daysUntilExpiry;
  });

  const getSeverityIcon = (severity: ExpirationAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getSeverityColor = (severity: ExpirationAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Expiration Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Check className="w-12 h-12 mx-auto mb-3 text-success" />
            <p>No expiration alerts</p>
            <p className="text-sm">All credentials are up to date</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-warning" />
            <CardTitle className="text-lg">Expiration Alerts</CardTitle>
          </div>
          <Badge variant="secondary">{alerts.filter(a => !a.isRead).length} new</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  alert.isRead ? "bg-muted/50" : "bg-card",
                  alert.severity === 'critical' && !alert.isRead && "border-destructive/50",
                  alert.severity === 'warning' && !alert.isRead && "border-warning/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className={cn(
                        "font-medium text-sm",
                        alert.isRead && "text-muted-foreground"
                      )}>
                        {alert.credentialName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.daysUntilExpiry <= 0 
                          ? 'Expired' 
                          : `Expires in ${alert.daysUntilExpiry} days`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(alert.expiresAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                      {alert.severity}
                    </Badge>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onMarkAsRead(alert.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
