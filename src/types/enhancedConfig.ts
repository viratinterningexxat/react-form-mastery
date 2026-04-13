// ============================================
// Enhanced Configuration Types for Dynamic Admin Portal
// ============================================

export interface VisibilityRule {
  field: string;
  showWhen: {
    documentType?: string;
    context?: 'clinical' | 'academic';
    customCondition?: string;
  };
}

export interface ExpiryCalculationRule {
  basedOn: 'lastDoseDate' | 'resultDate' | 'boosterDate' | 'manual' | 'maxDoseDate';
  period?: {
    years?: number;
    months?: number;
    days?: number;
  };
  fixedDate?: string;
}

export interface DynamicFieldConfig {
  key: string;
  type: 'date' | 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  enabled: boolean;
  required: boolean;
  placeholder?: string;
  options?: string[];
  visibilityRules?: VisibilityRule[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface DoseConfiguration {
  count: {
    min: number;
    max: number;
    default: number;
  };
  fields: DynamicFieldConfig[];
  visibilityRules?: VisibilityRule[];
}

export interface BoosterConfiguration {
  enabled: boolean;
  doseCount: number;
  fields: DynamicFieldConfig[];
  expiryLogic?: ExpiryCalculationRule;
}

// Legacy EnhancedSectionConfig (preserved for backward compatibility)
export interface EnhancedSectionConfig {
  enabled: boolean;
  label: string;
  required: boolean;
  category: string;
  tags: {
    ouCode: string;
    userType: string;
  };
  workflow: {
    auto: boolean;
    on: Record<string, string[]>;
  };
  carryForwardConfig: {
    disabled: boolean;
    type: 'UntilExpiration' | 'CustomDays';
    days: number;
  };
  
  // Enhanced vaccine configuration
  vaccine?: {
    enabled: boolean;
    label: string;
    doses: DoseConfiguration;
    booster?: BoosterConfiguration;
    expiryLogic: ExpiryCalculationRule;
    upload: {
      enabled: boolean;
      required: boolean;
      label: string;
    };
    notes: {
      enabled: boolean;
      required: boolean;
      label: string;
    };
  };
  
  // Enhanced titer configuration
  titer?: {
    enabled: boolean;
    label: string;
    testTypes: string[];
    allowMultiple: boolean;
    expiryLogic: ExpiryCalculationRule;
    upload: {
      enabled: boolean;
      required: boolean;
      label: string;
    };
    notes: {
      enabled: boolean;
      required: boolean;
      label: string;
    };
  };
  
  // Enhanced declination configuration
  declination?: {
    enabled: boolean;
    label: string;
    reasons: string[];
    permanentDeclination: boolean;
    expiryLogic: ExpiryCalculationRule;
    upload: {
      enabled: boolean;
      required: boolean;
      label: string;
    };
    notes: {
      enabled: boolean;
      required: boolean;
      label: string;
    };
  };
  
  // Generic section configuration for other types
  [key: string]: any;
}

// Document type specific configurations
export interface DocumentTypeConfig {
  type: string; // 'TB' | 'HepB' | 'Flu' | 'Covid' | etc.
  name: string;
  defaultDoseCount: number;
  showInduration: boolean;
  expiryLogic: ExpiryCalculationRule;
  boosterRequired: boolean;
  specialFields: string[];
}

export interface ClinicalOverrideConfig {
  enabled: boolean;
  doseRules: {
    minDoses: number;
    maxDoses: number;
    requiredFields: string[];
  };
  expiryLogic: ExpiryCalculationRule;
  specialRequirements: string[];
}

// Admin portal configuration
export interface AdminPortalConfig {
  sections: Record<string, EnhancedSectionConfig>;
  documentTypes: DocumentTypeConfig[];
  clinicalOverrides: ClinicalOverrideConfig;
  fieldTemplates: DynamicFieldConfig[];
  validationRules: Record<string, any>;
}

// ============================================
// BLUEPRINT IMPLEMENTATION TYPES
// ============================================

// 1. Generic Section Configuration (Blueprint #1)
export interface SectionConfig {
  id: string;
  label: string;
  enabled: boolean;
  required: boolean;
  category: string;
  tags: {
    ouCode: string;
    userType: string;
  };
  workflow: {
    auto: boolean;
    on: Record<string, string[]>;
  };
  carryForwardConfig: {
    disabled: boolean;
    type: 'UntilExpiration' | 'CustomDays';
    days: number;
  };
  fields: FieldConfig[];
  expiryRule?: ExpiryRule;
  repeatable?: RepeatConfig;
  visibilityRules?: VisibilityRule[];
  contextOverrides?: ContextOverride[];
}

// 2. Generic Field Configuration (Blueprint #2)
export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'date' | 'radio' | 'checkbox' | 'dropdown' | 'file' | 'number' | 'textarea' | 'email';
  enabled: boolean;
  required: boolean;
  options?: string[];
  validation?: ValidationRules;
  visibilityRules?: VisibilityRule[];
  placeholder?: string;
}

// 3. Repeatable Group Configuration (Blueprint #3)
export interface RepeatConfig {
  repeatable: boolean;
  min: number;
  max: number;
  labelPattern?: string;
}

// 4. Conditional Visibility Engine (Blueprint #4)
export interface VisibilityRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'includes';
  value: any;
}

// 5. Expiry Rule Engine (Blueprint #5)
export interface ExpiryRule {
  type: 'fixedDate' | 'period' | 'basedOnField';
  baseField?: string;
  period?: {
    years?: number;
    months?: number;
    days?: number;
  };
  fixedDate?: string;
}

// 6. Context Override Configuration (Blueprint #6)
export interface ContextOverride {
  context: 'clinical' | 'academic';
  overrides: Partial<SectionConfig>;
}

// 8. Validation Engine (Blueprint #8)
export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customErrorMessage?: string;
}

// 9. Submission Data Model (Blueprint #9)
export interface SectionSubmission {
  id?: string;
  sectionId: string;
  entries: any[];
  expiryDate?: string;
  status: 'pending_upload' | 'pending_review' | 'approved' | 'rejected';
  fileName?: string;
  notes?: string;
}

// 10. Central Rule Evaluation Service Interface
export interface RuleEngine {
  evaluateVisibility: (config: FieldConfig, formData: any) => boolean;
  calculateExpiry: (config: ExpiryRule, formData: any) => string | null;
  validateForm: (config: SectionConfig, formData: any) => { isValid: boolean; errors: string[] };
  evaluateSectionVisibility?: (section: SectionConfig, formData: any) => boolean;
  calculateStatus?: (
    submissionData: any,
    sectionConfig: SectionConfig
  ) => 'pending_upload' | 'pending_review' | 'approved' | 'rejected';
  processRepeatableSection?: (
    formData: any[],
    minDoses: number,
    maxDoses: number
  ) => { isValid: boolean; errors: string[] };
  applyContextOverrides?: (sectionConfig: SectionConfig, context: 'clinical' | 'academic') => SectionConfig;
}