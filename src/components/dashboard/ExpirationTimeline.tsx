import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  name: string;
  expiresAt: string;
  status: 'expired' | 'expiring_soon' | 'upcoming' | 'safe';
}

interface ExpirationTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const ExpirationTimeline = memo(function ExpirationTimeline({
  items,
  className,
}: ExpirationTimelineProps) {
  const sortedItems = [...items].sort((a, b) => 
    new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
  );

  const getStatusConfig = (status: TimelineItem['status']) => {
    switch (status) {
      case 'expired':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'bg-destructive',
          textColor: 'text-destructive',
          badge: 'destructive' as const,
          label: 'Expired',
        };
      case 'expiring_soon':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-warning',
          textColor: 'text-warning',
          badge: 'warning' as const,
          label: 'Expiring Soon',
        };
      case 'upcoming':
        return {
          icon: <Calendar className="w-4 h-4" />,
          color: 'bg-primary',
          textColor: 'text-primary',
          badge: 'default' as const,
          label: 'Upcoming',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: 'bg-success',
          textColor: 'text-success',
          badge: 'success' as const,
          label: 'Valid',
        };
    }
  };

  if (sortedItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5" />
            Expiration Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming expirations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="w-5 h-5" />
          Expiration Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {sortedItems.slice(0, 5).map((item) => {
              const config = getStatusConfig(item.status);
              const daysUntil = differenceInDays(parseISO(item.expiresAt), new Date());
              
              return (
                <div key={item.id} className="relative flex items-start gap-4 pl-8">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-1.5 w-3 h-3 rounded-full ring-4 ring-background",
                    config.color
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{item.name}</p>
                      <Badge variant={config.badge} className="shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {daysUntil < 0 
                        ? `Expired ${Math.abs(daysUntil)} days ago`
                        : daysUntil === 0
                        ? 'Expires today'
                        : `Expires in ${daysUntil} days`}
                      {' • '}
                      {format(parseISO(item.expiresAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
