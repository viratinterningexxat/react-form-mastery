import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequirementConfig, FieldConfig } from '@/types/RequirementConfig';
import { MappedFieldData } from '@/types/formConfig';
import { validateFormData, ValidationError } from '@/utils/validationEngine';
import { FormFooter } from './FormFooter';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { useDocumentProcessor } from '@/hooks/useDocumentProcessor';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VaccinationFormProps {
  requirement: RequirementConfig;
  onSubmit: (data: Record<string, string | number | boolean | File | string[]>) => void;
}

export function VaccinationForm({ requirement, onSubmit }: VaccinationFormProps) {
  const [formData, setFormData] = useState<Record<string, string | number | boolean | File | string[]>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDataExtracted = useCallback((data: MappedFieldData) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleOcrError = useCallback((error: string) => {
    // OCR failure handled in hook
  }, []);

  const handleInputChange = useCallback((field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => prev.filter(e => e.field !== field));
  }, []);

  const handleFileChange = useCallback((field: string, file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => prev.filter(e => e.field !== field));
  }, []);

  const handleSubmit = useCallback(() => {
    const validationErrors = validateFormData(requirement, formData);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      onSubmit(formData);
      setIsSubmitting(false);
    }
  }, [formData, requirement, onSubmit]);

  const getFieldError = (field: string) => {
    return errors.find(e => e.field === field)?.message;
  };

  const renderField = (fieldKey: string, fieldConfig: FieldConfig) => {
    if (!fieldConfig.visible) return null;

    const isRequired = fieldConfig.required;
    const error = getFieldError(fieldKey);

    const fieldClass = cn(
      "space-y-2",
      error && "border-red-500"
    );

    switch (fieldConfig.type) {
      case 'text':
        return (
          <div key={fieldKey} className={fieldClass}>
            <Label htmlFor={fieldKey}>
              {fieldKey} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fieldKey}
              value={formData[fieldKey] || ''}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              required={isRequired}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      case 'number':
        return (
          <div key={fieldKey} className={fieldClass}>
            <Label htmlFor={fieldKey}>
              {fieldKey} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fieldKey}
              type="number"
              value={formData[fieldKey] || ''}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              required={isRequired}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      case 'date':
        return (
          <div key={fieldKey} className={fieldClass}>
            <Label htmlFor={fieldKey}>
              {fieldKey} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fieldKey}
              type="date"
              value={formData[fieldKey] || ''}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              required={isRequired}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      case 'select':
        return (
          <div key={fieldKey} className={fieldClass}>
            <Label htmlFor={fieldKey}>
              {fieldKey} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select onValueChange={(value) => handleInputChange(fieldKey, value)}>
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={`Select ${fieldKey}`} />
              </SelectTrigger>
              <SelectContent>
                {fieldConfig.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      case 'textarea':
        return (
          <div key={fieldKey} className={fieldClass}>
            <Label htmlFor={fieldKey}>
              {fieldKey} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={fieldKey}
              value={formData[fieldKey] || ''}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              required={isRequired}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      case 'file':
        return (
          <div key={fieldKey} className={fieldClass}>
            <Label htmlFor={fieldKey}>
              {fieldKey} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <DocumentUploader
              onDataExtracted={handleDataExtracted}
              onError={handleOcrError}
              label={`Upload ${fieldKey}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{requirement.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors:
              <ul className="list-disc list-inside mt-2">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {Object.entries(requirement.fields).map(([key, config]) => renderField(key, config))}
        <FormFooter errors={errors} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </CardContent>
    </Card>
  );
}