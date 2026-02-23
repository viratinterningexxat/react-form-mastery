// ============================================
// Admin Configuration Management Types
// For the configuration portal
// ============================================

import { DynamicFormConfig, SectionConfig, FieldConfig } from './dynamicConfig';

/**
 * Represents the admin interface state for managing configurations
 */
export interface AdminUIState {
  selectedConfigId: string | null;
  selectedSectionId: string | null;
  selectedFieldKey: string | null;
  activeTab: AdminTab;
  unsavedChanges: boolean;
}

export type AdminTab =
  | 'general'
  | 'sections'
  | 'fields'
  | 'repeatable'
  | 'expiry'
  | 'validation'
  | 'visibility'
  | 'workflow';

/**
 * Represents the full admin state
 */
export interface AdminState {
  configurations: DynamicFormConfig[];
  currentConfig: DynamicFormConfig | null;
  currentSection: SectionConfig | null;
  currentField: FieldConfig | null;
  ui: AdminUIState;
  loading: boolean;
  error: string | null;
}

/**
 * Configuration list item for displaying in admin UI
 */
export interface ConfigListItem {
  id: string;
  name: string;
  category?: string;
  active: boolean;
  version: number;
  sectionCount: number;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Section list item for admin UI
 */
export interface SectionListItem {
  id: string;
  label: string;
  enabled: boolean;
  required: boolean;
  fieldCount: number;
  order?: number;
}

/**
 * Field list item for admin UI
 */
export interface FieldListItem {
  key: string;
  label: string;
  controlType: string;
  required: boolean;
  enabled: boolean;
  hasValidation: boolean;
  hasVisibilityRules: boolean;
}

/**
 * Field builder request for creating/updating fields
 */
export interface FieldBuilderRequest {
  key: string;
  label: string;
  controlType: string;
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | string[] | number;
  options?: { label: string; value: string }[];
}

/**
 * Section builder request for creating/updating sections
 */
export interface SectionBuilderRequest {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  required: boolean;
  category?: string;
  order?: number;
}

/**
 * Repeatable configuration builder
 */
export interface RepeatableBuilderRequest {
  repeatable: true;
  min: number;
  max: number;
  labelPattern?: string;
}

/**
 * Expiry rule builder request
 */
export interface ExpiryRuleBuilderRequest {
  type: 'fixedDate' | 'period' | 'basedOnField' | 'never';
  baseField?: string;
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
  userCanOverride?: boolean;
}

/**
 * Validation rule builder request
 */
export interface ValidationRuleBuilderRequest {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'date' | 'custom';
  message: string;
  value?: string | number;
}

/**
 * Visibility rule builder request
 */
export interface VisibilityRuleBuilderRequest {
  operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes' | 'greaterThan' | 'lessThan';
  dependsOn: string;
  value: string | string[] | number;
  customMessage?: string;
}

/**
 * Configuration duplication request
 */
export interface ConfigDuplicationRequest {
  sourceConfigId: string;
  newName: string;
  newCategory?: string;
}

/**
 * Bulk update request
 */
export interface BulkUpdateRequest {
  configId: string;
  updates: {
    type: 'enable' | 'disable' | 'setRequired' | 'setOrder';
    target: 'section' | 'field';
    sectionId?: string;
    fieldKey?: string;
    value?: any;
  }[];
}

/**
 * Change log entry for tracking modifications
 */
export interface ChangeLogEntry {
  timestamp: string;
  type: 'create' | 'update' | 'delete';
  target: 'config' | 'section' | 'field';
  targetId: string;
  targetName: string;
  changes: Record<string, { old: any; new: any }>;
  changedBy: string;
}

/**
 * Configuration diff for comparing versions
 */
export interface ConfigDiff {
  configId: string;
  version1: number;
  version2: number;
  differences: {
    path: string;
    old: any;
    new: any;
  }[];
}

/**
 * Configuration export format
 */
export interface ConfigExport {
  config: DynamicFormConfig;
  exportedAt: string;
  exportedBy?: string;
  version: number;
}
