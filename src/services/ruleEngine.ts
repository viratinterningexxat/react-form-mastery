// ============================================
// Rule Evaluation Engine Service
// Handles visibility, expiry, and validation
// ============================================

import {
  DynamicFormConfig,
  FieldConfig,
  FieldEntry,
  SectionConfig,
  ValidationResult,
  VisibilityRule,
  ExpiryRule,
  CredentialSubmission,
} from '../types/dynamicConfig';

/**
 * Evaluates if a field should be visible based on visibility rules
 */
export function evaluateFieldVisibility(
  field: FieldConfig,
  formData: Record<string, any>
): boolean {
  if (!field.visibilityRules || field.visibilityRules.length === 0) {
    return field.enabled;
  }

  // All rules must pass (AND logic)
  return field.visibilityRules.every((rule) => evaluateRule(rule, formData));
}

/**
 * Evaluates a single visibility rule
 */
function evaluateRule(rule: VisibilityRule, formData: Record<string, any>): boolean {
  const fieldValue = formData[rule.dependsOn];

  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;

    case 'notEquals':
      return fieldValue !== rule.value;

    case 'includes':
      if (Array.isArray(fieldValue)) {
        return Array.isArray(rule.value)
          ? rule.value.some((v) => fieldValue.includes(v))
          : fieldValue.includes(rule.value);
      }
      return false;

    case 'notIncludes':
      if (Array.isArray(fieldValue)) {
        return Array.isArray(rule.value)
          ? !rule.value.some((v) => fieldValue.includes(v))
          : !fieldValue.includes(rule.value);
      }
      return true;

    case 'greaterThan':
      return Number(fieldValue) > Number(rule.value);

    case 'lessThan':
      return Number(fieldValue) < Number(rule.value);

    default:
      return true;
  }
}

/**
 * Calculates expiry date based on expiry rule and form data
 */
export function calculateExpiryDate(
  expiryRule: ExpiryRule | undefined,
  formData: Record<string, any>
): string | undefined {
  if (!expiryRule || expiryRule.type === 'never') {
    return undefined;
  }

  const today = new Date();

  switch (expiryRule.type) {
    case 'fixedDate':
      if (expiryRule.fixedDate) {
        return new Date(
          expiryRule.fixedDate.year,
          expiryRule.fixedDate.month - 1,
          expiryRule.fixedDate.day
        ).toISOString().split('T')[0];
      }
      return undefined;

    case 'period':
      if (expiryRule.period) {
        const expiryDate = new Date(today);
        if (expiryRule.period.years) {
          expiryDate.setFullYear(expiryDate.getFullYear() + expiryRule.period.years);
        }
        if (expiryRule.period.months) {
          expiryDate.setMonth(expiryDate.getMonth() + expiryRule.period.months);
        }
        if (expiryRule.period.days) {
          expiryDate.setDate(expiryDate.getDate() + expiryRule.period.days);
        }
        return expiryDate.toISOString().split('T')[0];
      }
      return undefined;

    case 'basedOnField':
      if (expiryRule.baseField && formData[expiryRule.baseField]) {
        const baseDate = new Date(formData[expiryRule.baseField]);
        if (expiryRule.period) {
          if (expiryRule.period.years) {
            baseDate.setFullYear(baseDate.getFullYear() + expiryRule.period.years);
          }
          if (expiryRule.period.months) {
            baseDate.setMonth(baseDate.getMonth() + expiryRule.period.months);
          }
          if (expiryRule.period.days) {
            baseDate.setDate(baseDate.getDate() + expiryRule.period.days);
          }
          return baseDate.toISOString().split('T')[0];
        }
      }
      return undefined;

    default:
      return undefined;
  }
}

/**
 * Validates form data against field validation rules
 */
export function validateFormData(
  section: SectionConfig,
  formData: Record<string, any>
): ValidationResult {
  const errors: { fieldKey: string; message: string }[] = [];

  // Validate each field
  for (const field of section.fields) {
    // Check if field is visible before validating
    if (!evaluateFieldVisibility(field, formData)) {
      continue;
    }

    const fieldErrors = validateField(field, formData[field.key]);
    errors.push(...fieldErrors.map((msg) => ({ fieldKey: field.key, message: msg })));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a single field against its validation rules
 */
function validateField(field: FieldConfig, value: any): string[] {
  const errors: string[] = [];

  // Check if field is required and empty
  if (field.required && (value === undefined || value === null || value === '')) {
    errors.push(`${field.label} is required`);
    return errors;
  }

  // Skip validation if field is empty and not required
  if (!value) {
    return errors;
  }

  if (!field.validation || field.validation.length === 0) {
    return errors;
  }

  // Apply each validation rule
  for (const rule of field.validation) {
    const error = applyValidationRule(field.label, value, rule);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Applies a single validation rule to a value
 */
function applyValidationRule(fieldLabel: string, value: any, rule: any): string | undefined {
  switch (rule.type) {
    case 'required':
      if (!value) {
        return rule.message || `${fieldLabel} is required`;
      }
      return undefined;

    case 'minLength':
      if (String(value).length < rule.value) {
        return rule.message || `${fieldLabel} must be at least ${rule.value} characters`;
      }
      return undefined;

    case 'maxLength':
      if (String(value).length > rule.value) {
        return rule.message || `${fieldLabel} must not exceed ${rule.value} characters`;
      }
      return undefined;

    case 'pattern':
      if (!new RegExp(rule.value).test(String(value))) {
        return rule.message || `${fieldLabel} format is invalid`;
      }
      return undefined;

    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        return rule.message || `${fieldLabel} must be a valid email`;
      }
      return undefined;

    case 'date':
      if (isNaN(Date.parse(String(value)))) {
        return rule.message || `${fieldLabel} must be a valid date`;
      }
      return undefined;

    case 'custom':
      // Custom validation is handled by the caller
      return undefined;

    default:
      return undefined;
  }
}

/**
 * Gets visible fields from a section based on current form data
 */
export function getVisibleFields(
  section: SectionConfig,
  formData: Record<string, any>
): FieldConfig[] {
  return section.fields.filter((field) => evaluateFieldVisibility(field, formData));
}

/**
 * Validates an entire credential submission
 */
export function validateCredentialSubmission(
  config: DynamicFormConfig,
  submission: Partial<CredentialSubmission>
): ValidationResult {
  const errors: { fieldKey: string; message: string }[] = [];

  if (!config.sections || config.sections.length === 0) {
    return { valid: false, errors: [{ fieldKey: 'config', message: 'No sections in config' }] };
  }

  for (const section of config.sections) {
    if (!section.enabled || !section.required) {
      continue;
    }

    // Check if section has been submitted
    const sectionSubmission = submission.sections?.find((s) => s.sectionId === section.id);
    if (!sectionSubmission) {
      errors.push({
        fieldKey: section.id,
        message: `${section.label} is required`,
      });
      continue;
    }

    // Convert field entries to form data for validation
    const formData: Record<string, any> = {};
    for (const entry of sectionSubmission.fields) {
      formData[entry.key] = entry.value;
    }

    // Validate section
    const sectionValidation = validateFormData(section, formData);
    errors.push(...sectionValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Applies context-specific overrides to a section config
 */
export function applyContextOverride(
  section: SectionConfig,
  context: string
): SectionConfig {
  if (!section.contextOverrides) {
    return section;
  }

  const override = section.contextOverrides.find((o) => o.context === context);
  if (!override) {
    return section;
  }

  return {
    ...section,
    ...override.overrides,
  };
}

/**
 * Gets the effective configuration for a user context
 */
export function getContextualConfig(
  config: DynamicFormConfig,
  context: string
): DynamicFormConfig {
  return {
    ...config,
    sections: config.sections.map((section) => applyContextOverride(section, context)),
  };
}
