export interface FieldConfig {
  visible: boolean;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'select' | 'file' | 'textarea';
  options?: string[];
  autoPopulate?: string; // e.g., "OCR_EXPIRY_DATE"
}

export interface RequirementConfig {
  requirementId: string;
  label: string;
  category: string;
  fields: Record<string, FieldConfig>;
}

export type RequirementConfigList = RequirementConfig[];