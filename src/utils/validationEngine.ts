import { RequirementConfig, FieldConfig } from '@/types/RequirementConfig';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateFormData(
  requirement: RequirementConfig,
  formData: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [fieldKey, fieldConfig] of Object.entries(requirement.fields)) {
    // Skip validation for hidden fields
    if (!fieldConfig.visible) continue;

    const value = formData[fieldKey];

    // Check required fields
    if (fieldConfig.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldKey,
        message: `${fieldKey} is required`,
      });
      continue;
    }

    // Skip further validation if field is empty and not required
    if (!fieldConfig.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type-specific validation
    switch (fieldConfig.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push({
            field: fieldKey,
            message: `${fieldKey} must be a valid number`,
          });
        }
        break;
      case 'date':
        if (!isValidDate(value)) {
          errors.push({
            field: fieldKey,
            message: `${fieldKey} must be a valid date`,
          });
        }
        break;
      case 'select':
        if (fieldConfig.options && !fieldConfig.options.includes(value)) {
          errors.push({
            field: fieldKey,
            message: `${fieldKey} must be one of the allowed options`,
          });
        }
        break;
      case 'file':
        if (!(value instanceof File)) {
          errors.push({
            field: fieldKey,
            message: `${fieldKey} must be a valid file`,
          });
        }
        break;
    }
  }

  return errors;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function isFormValid(errors: ValidationError[]): boolean {
  return errors.length === 0;
}