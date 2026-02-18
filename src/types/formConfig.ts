// ============================================
// Dynamic Form Configuration Types
// Based on Exxat Base Configuration Schema
// ============================================

// Control types for form fields
export type ControlType = 
  | 'textBox' 
  | 'textArea' 
  | 'datePicker' 
  | 'dropDown' 
  | 'radio' 
  | 'checkBox' 
  | 'fileUpload';

// Generic field configuration
export interface FieldConfig {
  controlType: ControlType;
  enabled: boolean;
  label: string;
  required: boolean;
  options?: string[]; // For dropDown, radio, checkBox
}

// Dose configuration for vaccines
export interface DoseConfig {
  date: FieldConfig;
  manufacturer: FieldConfig;
  lotNumber: FieldConfig;
  induration?: FieldConfig; // For TB tests
}

// Section configuration
export interface SectionConfig {
  enabled: boolean;
  label: string;
  expiryLogic?: FieldConfig;
  resultDate?: FieldConfig;
  src?: FieldConfig;
  text?: FieldConfig;
  testType?: FieldConfig;
  doseType?: FieldConfig;
  doses?: DoseConfig[];
  // Certification specific
  courseName?: FieldConfig;
  courseType?: FieldConfig;
  documentType?: FieldConfig;
  provider?: FieldConfig;
  // Licensure specific
  licenseNumber?: FieldConfig;
  stateOfLicense?: FieldConfig;
  typeOfLicense?: FieldConfig;
  // Health Summary specific
  applicableDocuments?: FieldConfig;
  expiryDate?: {
    'fixed-date'?: { 'by-user'?: boolean; day?: number; month?: number; year?: number };
    period?: { years?: number; months?: number; days?: number };
  };
}

// Complete configuration
export interface RequirementConfig {
  _id: string;
  name: string;
  category: string;
  active: boolean;
  bloodTest: SectionConfig;
  booster: SectionConfig;
  certification: SectionConfig;
  chestXray: SectionConfig;
  custom: SectionConfig;
  decline: SectionConfig;
  historyOfDisease: SectionConfig;
  hisummary: SectionConfig;
  licensure: SectionConfig;
  otherTiter: SectionConfig;
  repeatTiter: SectionConfig;
  symptomScrn: SectionConfig;
  titer: SectionConfig;
  vaccine: SectionConfig;
}

// Section keys type
export type SectionKey = 
  | 'bloodTest'
  | 'booster'
  | 'certification'
  | 'chestXray'
  | 'custom'
  | 'decline'
  | 'historyOfDisease'
  | 'hisummary'
  | 'licensure'
  | 'otherTiter'
  | 'repeatTiter'
  | 'symptomScrn'
  | 'titer'
  | 'vaccine';

// Form data structure for saving
export interface SectionFormData {
  sectionKey: SectionKey;
  resultDate?: string;
  expiryDate?: string;
  notes?: string;
  testType?: string;
  doseType?: string[];
  courseName?: string;
  courseType?: string;
  documentType?: string;
  provider?: string;
  licenseNumber?: string;
  stateOfLicense?: string;
  typeOfLicense?: string;
  applicableDocuments?: string[];
  doses?: {
    date: string;
    manufacturer: string;
    lotNumber: string;
    induration?: string;
  }[];
  fileUrl?: string;
  fileName?: string;
  status: 'pending_upload' | 'pending_review' | 'approved' | 'rejected';
}

// OCR extracted data
export interface ExtractedDocumentData {
  dates: string[];
  manufacturers: string[];
  lotNumbers: string[];
  names: string[];
  numbers: string[];
  rawText: string;
}

export type MappedFieldData = Partial<Record<string, string | string[]>>;
