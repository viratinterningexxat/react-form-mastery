// ============================================
// Central Rule Evaluation Service
// Implements Blueprint #10 - Business Logic Layer
// ============================================

import { SectionConfig, FieldConfig, ExpiryRule, VisibilityRule, SectionSubmission } from '@/types/enhancedConfig';

export const ruleEngine = {
  // ============================================
  // 1. Visibility Evaluation (Blueprint #4)
  // ============================================
  
  /**
   * Evaluate if a field should be visible based on form data
   */
  evaluateVisibility: (config: FieldConfig, formData: any): boolean => {
    if (!config.visibilityRules || config.visibilityRules.length === 0) {
      return true; // No rules = always visible
    }

    // All rules must pass (AND logic)
    return config.visibilityRules.every((rule: VisibilityRule) => {
      const fieldValue = formData[rule.field];
      
      switch (rule.operator) {
        case 'equals':
          return fieldValue === rule.value;
        case 'notEquals':
          return fieldValue !== rule.value;
        case 'includes':
          return Array.isArray(fieldValue) && fieldValue.includes(rule.value);
        default:
          return true;
      }
    });
  },

  /**
   * Evaluate section visibility based on nested field conditions
   */
  evaluateSectionVisibility: (section: SectionConfig, formData: any): boolean => {
    if (!section.visibilityRules || section.visibilityRules.length === 0) {
      return true;
    }

    return section.visibilityRules.every((rule: VisibilityRule) => {
      const fieldValue = formData[rule.field];
      
      switch (rule.operator) {
        case 'equals':
          return fieldValue === rule.value;
        case 'notEquals':
          return fieldValue !== rule.value;
        case 'includes':
          return Array.isArray(fieldValue) && fieldValue.includes(rule.value);
        default:
          return true;
      }
    });
  },

  // ============================================
  // 2. Expiry Calculation (Blueprint #5)
  // ============================================
  
  /**
   * Calculate expiry date based on rule type
   */
  calculateExpiry: (config: ExpiryRule, formData: any): string | null => {
    if (!config) return null;

    let baseDate: Date | null = null;

    switch (config.type) {
      case 'fixedDate':
        return config.fixedDate || null;

      case 'basedOnField':
        if (!config.baseField) return null;
        const fieldDate = new Date(formData[config.baseField]);
        if (isNaN(fieldDate.getTime())) return null;
        baseDate = fieldDate;
        break;

      case 'period':
        // If no baseField, use current date
        if (config.baseField) {
          const fieldDate = new Date(formData[config.baseField]);
          if (!isNaN(fieldDate.getTime())) {
            baseDate = fieldDate;
          }
        }
        if (!baseDate) baseDate = new Date();
        break;

      default:
        return null;
    }

    // Apply period if configured
    if (config.period && baseDate) {
      const expiryDate = new Date(baseDate);
      
      if (config.period.years) {
        expiryDate.setFullYear(expiryDate.getFullYear() + config.period.years);
      }
      if (config.period.months) {
        expiryDate.setMonth(expiryDate.getMonth() + config.period.months);
      }
      if (config.period.days) {
        expiryDate.setDate(expiryDate.getDate() + config.period.days);
      }
      
      return expiryDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }

    return baseDate.toISOString().split('T')[0];
  },

  // ============================================
  // 3. Form Validation (Blueprint #8)
  // ============================================
  
  /**
   * Validate form data against section configuration
   */
  validateForm: (config: SectionConfig, formData: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate each field
    config.fields.forEach((field: FieldConfig) => {
      const value = formData[field.key];

      // Required field validation
      if (field.required && !value) {
        errors.push(`${field.label} is required`);
        return;
      }

      // Skip further validation if field is empty and not required
      if (!value) return;

      // Type-specific validation
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value as string)) {
            errors.push(`Invalid email format for ${field.label}`);
          }
          break;

        case 'number':
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`${field.label} must be a number`);
          }
          break;

        case 'date':
          const date = new Date(value as string);
          if (isNaN(date.getTime())) {
            errors.push(`Invalid date format for ${field.label}`);
          }
          break;
      }

      // Validation rules
      if (field.validation) {
        const { minLength, maxLength, pattern } = field.validation;

        if (typeof value === 'string') {
          if (minLength && value.length < minLength) {
            errors.push(`${field.label} must be at least ${minLength} characters`);
          }
          if (maxLength && value.length > maxLength) {
            errors.push(`${field.label} must be at most ${maxLength} characters`);
          }
          if (pattern && !new RegExp(pattern).test(value)) {
            errors.push(field.validation?.customErrorMessage || `Invalid format for ${field.label}`);
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ============================================
  // 4. Status Calculation
  // ============================================
  
  /**
   * Calculate submission status based on data and configuration
   */
  calculateStatus: (
    submissionData: any,
    sectionConfig: SectionConfig
  ): 'pending_upload' | 'pending_review' | 'approved' | 'rejected' => {
    // Check if file is uploaded
    if (!submissionData.fileName && sectionConfig.required) {
      return 'pending_upload';
    }

    // Check if under review
    if (submissionData.status === 'pending_review') {
      return 'pending_review';
    }

    // Check approval status
    if (submissionData.status === 'approved') {
      return 'approved';
    }

    if (submissionData.status === 'rejected') {
      return 'rejected';
    }

    // Default to pending review if has data
    if (Object.keys(submissionData).length > 0) {
      return 'pending_review';
    }

    return 'pending_upload';
  },

  // ============================================
  // 5. Repeatable Section Processing
  // ============================================
  
  /**
   * Process repeatable section data (e.g., vaccine doses)
   */
  processRepeatableSection: (
    formData: any[],
    minDoses: number,
    maxDoses: number
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData || formData.length === 0) {
      if (minDoses > 0) {
        errors.push(`At least ${minDoses} dose(s) are required`);
      }
      return { isValid: errors.length === 0, errors };
    }

    // Check minimum doses
    if (formData.length < minDoses) {
      errors.push(`Minimum ${minDoses} dose(s) required, but only ${formData.length} provided`);
    }

    // Check maximum doses
    if (formData.length > maxDoses) {
      errors.push(`Maximum ${maxDoses} dose(s) allowed, but ${formData.length} provided`);
    }

    // Validate each dose entry
    formData.forEach((dose, index) => {
      Object.entries(dose).forEach(([key, value]) => {
        if (!value) {
          errors.push(`Dose ${index + 1}: ${key} is required`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ============================================
  // 6. Context Override Application
  // ============================================
  
  /**
   * Apply context-specific overrides to section configuration
   */
  applyContextOverrides: (
    sectionConfig: SectionConfig,
    context: 'clinical' | 'academic'
  ): SectionConfig => {
    if (!sectionConfig.contextOverrides) {
      return sectionConfig;
    }

    const override = sectionConfig.contextOverrides.find(
      (o) => o.context === context
    );

    if (!override) {
      return sectionConfig;
    }

    // Merge overrides with base configuration
    return {
      ...sectionConfig,
      ...override.overrides,
      fields: [
        ...(sectionConfig.fields || []),
        ...(override.overrides.fields || [])
      ]
    };
  }
};

// Export for backward compatibility
export default ruleEngine;