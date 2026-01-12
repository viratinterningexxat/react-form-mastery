import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  isCompleted && 'bg-success text-success-foreground',
                  isActive && 'bg-primary text-primary-foreground shadow-md ring-4 ring-accent',
                  !isCompleted && !isActive && 'bg-step-pending text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium transition-colors duration-300',
                  isActive && 'text-primary',
                  isCompleted && 'text-success',
                  !isCompleted && !isActive && 'text-muted-foreground'
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2 transition-colors duration-300',
                  index < currentStep ? 'bg-success' : 'bg-step-pending'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
