// ============================================
// Enhanced Dynamic Configuration Types
// Supports flexible credential management
// ============================================

// Base field control types
export type ControlType =
  | 'textBox'
  | 'textArea'
  | 'datePicker'
  | 'dropDown'
  | 'radio'
  | 'checkBox'
  | 'fileUpload'
  | 'number'
  | 'email';

// Validation rules for fields
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'date' | 'custom';
  message: string;
  value?: string | number; // For minLength, maxLength, pattern
}

// Visibility condition for showing/hiding fields
export interface VisibilityRule {
  operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes' | 'greaterThan' | 'lessThan';
  dependsOn: string; // Field key that this rule depends on
  value: string | string[] | number;
  customMessage?: string;
}

// Generic field configuration
export interface FieldConfig {
  key: string;
  label: string;
  controlType: ControlType;
  enabled: boolean;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | string[] | number;
  options?: { label: string; value: string }[] | string[]; // For dropDown, radio, checkBox
  validation?: ValidationRule[];
  visibilityRules?: VisibilityRule[];
  metadata?: Record<string, any>; // Custom metadata for specific field types
}

// Repeatable group configuration (for doses, multiple entries)
export interface RepeatConfig {
  repeatable: true;
  min: number;
  max: number;
  labelPattern?: string; // e.g., "Dose {index}"
  fields: FieldConfig[];
}

// Expiry rule configuration
export interface ExpiryRule {
  type: 'fixedDate' | 'period' | 'basedOnField' | 'never';
  baseField?: string; // Field key to calculate expiry from
  period?: {
    years?: number;
    months?: number;
    days?: number;
  };
  fixedDate?: {
    day: number;
    month: number;
    year: number;
  };
  userCanOverride?: boolean; // Allow user to set custom expiry
}

// Context-specific override
export interface ContextOverride {
  context: string; // e.g., 'clinical', 'academic'
  overrides: Partial<SectionConfig>;
}

// Complete section configuration
export interface SectionConfig {
  id: string; // Unique identifier
  label: string; // Display name
  description?: string;
  enabled: boolean;
  required: boolean;
  category?: string; // For grouping/organization
  fields: FieldConfig[];
  repeatable?: RepeatConfig; // For repeating field groups
  expiryRule?: ExpiryRule;
  contextOverrides?: ContextOverride[]; // Context-specific modifications
  metadata?: Record<string, any>; // Custom metadata
  order?: number; // Display order
}

// Complete configuration document
export interface DynamicFormConfig {
  id: string;
  name: string;
  description?: string;
  version: number;
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  sections: SectionConfig[];
  metadata?: Record<string, any>;
  workflow?: {
    auto: boolean;
    transitions?: Record<string, string[]>;
  };
}

// ============================================
// Submission Data Model
// ============================================

// Single field value entry
export interface FieldEntry {
  key: string;
  value: string | string[] | number | null;
  metadata?: Record<string, any>;
}

// Repeatable group entry (for doses, multiple items)
export interface RepeatableEntry {
  entries: FieldEntry[];
  index: number;
}

// Section submission data
export interface SectionSubmission {
  sectionId: string;
  fields: FieldEntry[];
  repeatableEntries?: RepeatableEntry[]; // If section is repeatable
  expiryDate?: string; // Calculated or user-provided
  status: 'pending_upload' | 'pending_review' | 'approved' | 'rejected' | 'approved_with_conditions';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

// Complete credential submission
export interface CredentialSubmission {
  id: string;
  employeeId: string;
  configId: string;
  sections: SectionSubmission[];
  status: 'in_progress' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  completedAt?: string;
  notes?: string;
}

// ============================================
// Admin/Configuration Management Types
// ============================================

// Configuration update request
export interface ConfigUpdateRequest {
  configId: string;
  updates: Partial<DynamicFormConfig>;
}

// Section update request
export interface SectionUpdateRequest {
  sectionId: string;
  updates: Partial<SectionConfig>;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: {
    fieldKey: string;
    message: string;
  }[];
}
