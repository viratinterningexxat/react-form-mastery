import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator } from './StepIndicator';
import { StepPersonal } from './StepPersonal';
import { StepJob } from './StepJob';
import { StepSkills } from './StepSkills';
import { StepReview } from './StepReview';
import { useForm, FormErrors } from '@/hooks/useForm';
import { EmployeeFormData, Employee, initialFormData } from '@/types/employee';
import { validateEmail, validatePhone, validateRequired, validateNumber, validateArrayMinLength } from '@/utils/validators';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['Personal', 'Job', 'Skills', 'Review'];

interface EmployeeFormProps {
  onSubmit: (employee: Employee) => void;
  onCancel: () => void;
}

export function EmployeeForm({ onSubmit, onCancel }: EmployeeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const validateStep = useCallback((values: EmployeeFormData, step: number): FormErrors => {
    const errors: FormErrors = {};

    if (step === 0) {
      if (!validateRequired(values.name)) {
        errors.name = 'Name is required';
      }
      if (!validateRequired(values.email)) {
        errors.email = 'Email is required';
      } else if (!validateEmail(values.email)) {
        errors.email = 'Invalid email format';
      }
      if (!validateRequired(values.phone)) {
        errors.phone = 'Phone is required';
      } else if (!validatePhone(values.phone)) {
        errors.phone = 'Invalid phone format';
      }
    }

    if (step === 1) {
      if (!validateRequired(values.department)) {
        errors.department = 'Department is required';
      }
      if (!validateRequired(values.role)) {
        errors.role = 'Role is required';
      }
      if (!validateNumber(values.experience, 0, 50)) {
        errors.experience = 'Experience must be between 0 and 50 years';
      }
    }

    if (step === 2) {
      if (!validateArrayMinLength(values.skills, 1)) {
        errors.skills = 'At least one skill is required';
      }
    }

    return errors;
  }, []);

  const { values, errors, handleChange, setErrors, resetForm } = useForm<EmployeeFormData>(
    initialFormData,
    (values) => validateStep(values, currentStep)
  );

  const validateCurrentStep = useCallback(() => {
    const stepErrors = validateStep(values, currentStep);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [values, currentStep, validateStep, setErrors]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(() => {
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      ...values,
      skills: values.skills.filter(s => s.trim().length > 0),
      createdAt: new Date().toISOString(),
    };
    onSubmit(newEmployee);
    resetForm();
    setCurrentStep(0);
    toast.success('Employee added successfully!');
  }, [values, onSubmit, resetForm]);

  const handleCancel = useCallback(() => {
    resetForm();
    setCurrentStep(0);
    onCancel();
  }, [resetForm, onCancel]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPersonal values={values} errors={errors} onChange={handleChange} />;
      case 1:
        return <StepJob values={values} errors={errors} onChange={handleChange} />;
      case 2:
        return <StepSkills values={values} errors={errors} onChange={handleChange} />;
      case 3:
        return <StepReview values={values} />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elevated border-0">
      <CardContent className="pt-8 pb-6">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
        
        <div className="min-h-[320px] px-2">
          {renderStep()}
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="gradient-primary border-0"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-success hover:bg-success/90 text-success-foreground border-0"
              >
                <Check className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
