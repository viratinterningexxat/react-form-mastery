import { Button } from '@/components/ui/button';
import { ValidationError, isFormValid } from '@/utils/validationEngine';

interface FormFooterProps {
  errors: ValidationError[];
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function FormFooter({ errors, onSubmit, isSubmitting = false }: FormFooterProps) {
  const canSubmit = isFormValid(errors) && !isSubmitting;

  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
  );
}