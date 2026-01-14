import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ClinicalReadiness } from '@/types/credential';
import { CheckCircle2, AlertTriangle, Clock, XCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadinessCardProps {
  readiness: ClinicalReadiness;
}

export const ReadinessCard = memo(function ReadinessCard({ readiness }: ReadinessCardProps) {
  const {
    isReady,
    totalRequired,
    totalCompleted,
    totalPending,
    totalExpiring,
    totalRejected,
    percentComplete,
    missingRequirements,
    expiringRequirements,
  } = readiness;

  return (
    <Card className={cn(
      "border-2 transition-all",
      isReady ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={cn("w-5 h-5", isReady ? "text-success" : "text-warning")} />
            <CardTitle className="text-lg">Clinical Readiness Status</CardTitle>
          </div>
          <Badge 
            variant={isReady ? "default" : "secondary"}
            className={cn(
              "text-sm font-semibold",
              isReady && "bg-success text-success-foreground"
            )}
          >
            {isReady ? 'Clinical Ready' : 'Not Ready'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Compliance</span>
            <span className="font-medium">{percentComplete}%</span>
          </div>
          <Progress value={percentComplete} className="h-3" />
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="text-2xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalPending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div>
              <p className="text-2xl font-bold">{totalExpiring}</p>
              <p className="text-xs text-muted-foreground">Expiring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
            <XCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{totalRejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>

        {/* Missing Requirements */}
        {missingRequirements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">Missing Requirements:</p>
            <div className="flex flex-wrap gap-2">
              {missingRequirements.map((req) => (
                <Badge key={req} variant="destructive" className="text-xs">
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expiring Soon */}
        {expiringRequirements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-warning">Expiring Soon:</p>
            <div className="flex flex-wrap gap-2">
              {expiringRequirements.map((req) => (
                <Badge key={req} variant="outline" className="text-xs border-warning text-warning">
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Requirements Progress */}
        <div className="text-center pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {totalCompleted} of {totalRequired} requirements completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
