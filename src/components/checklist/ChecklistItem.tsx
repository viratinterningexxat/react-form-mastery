import { memo } from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChecklistItemStatus = 'complete' | 'incomplete' | 'warning' | 'loading';

interface ChecklistItemProps {
  title: string;
  description: string;
  status: ChecklistItemStatus;
  className?: string;
}

export const ChecklistItem = memo(function ChecklistItem({
  title,
  description,
  status,
  className,
}: ChecklistItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      case 'incomplete':
        return <Circle className="w-6 h-6 text-muted-foreground" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-warning" />;
      case 'loading':
        return <Loader2 className="w-6 h-6 text-primary animate-spin" />;
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'complete':
        return 'border-success/30 bg-success/5';
      case 'incomplete':
        return 'border-border';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      case 'loading':
        return 'border-primary/30 bg-primary/5';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-all duration-200',
        getStatusStyles(),
        className
      )}
    >
      <div className="shrink-0 mt-0.5">{getStatusIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'font-medium',
          status === 'complete' && 'text-success'
        )}>
          {title}
        </h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
});
