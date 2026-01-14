import { Loader2, AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

// ============= Loading & Error State Components =============
// Reusable UI components for async operation states

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

/**
 * Accessible loading spinner with optional label
 */
export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center gap-2', className)} role="status" aria-busy="true">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {label && <span className="text-muted-foreground">{label}</span>}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

/**
 * Full-screen or container loading overlay
 */
export function LoadingOverlay({ message = 'Loading...', className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center',
        'bg-background/80 backdrop-blur-sm z-50',
        className
      )}
      role="status"
      aria-busy="true"
    >
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

/**
 * Skeleton loading card for content placeholders
 */
export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-3', className)}>
      {/* Header skeleton */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
        </div>
      </div>
      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-muted rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Skeleton loading table for data tables
 */
export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('rounded-lg border overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-muted/50 p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded animate-pulse flex-1"
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="p-4 flex gap-4 border-t"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse flex-1"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============= Error State Components =============

type ErrorType = 'generic' | 'network' | 'server' | 'notFound' | 'unauthorized';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const errorConfig: Record<ErrorType, { icon: typeof AlertCircle; defaultTitle: string; defaultMessage: string }> = {
  generic: {
    icon: AlertCircle,
    defaultTitle: 'Something went wrong',
    defaultMessage: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: WifiOff,
    defaultTitle: 'Connection Error',
    defaultMessage: 'Unable to connect. Please check your internet connection.',
  },
  server: {
    icon: ServerCrash,
    defaultTitle: 'Server Error',
    defaultMessage: 'Our servers are having issues. Please try again later.',
  },
  notFound: {
    icon: AlertCircle,
    defaultTitle: 'Not Found',
    defaultMessage: 'The requested resource could not be found.',
  },
  unauthorized: {
    icon: AlertCircle,
    defaultTitle: 'Unauthorized',
    defaultMessage: 'You do not have permission to access this resource.',
  },
};

/**
 * Comprehensive error state component with retry functionality
 */
export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="alert"
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {message || config.defaultMessage}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// ============= Empty State Components =============

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty state component for lists with no data
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ============= Status Indicator =============

interface StatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  className?: string;
}

/**
 * Visual status indicator dot
 */
export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const statusClasses = {
    idle: 'bg-muted',
    loading: 'bg-warning animate-pulse',
    success: 'bg-success',
    error: 'bg-destructive',
  };

  return (
    <span
      className={cn('w-2 h-2 rounded-full inline-block', statusClasses[status], className)}
      aria-label={`Status: ${status}`}
    />
  );
}
