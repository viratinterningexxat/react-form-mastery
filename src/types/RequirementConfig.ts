// Base field configuration
export interface BaseFieldConfig {
  controlType: 'textBox' | 'textArea' | 'datePicker' | 'dropDown' | 'radio' | 'checkBox' | 'fileUpload' | 'number';
  enabled: boolean;
  label: string;
  required: boolean;
  options?: string[];
  visibilityRules?: VisibilityRule[];
}

export interface VisibilityRule {
  field: string;
  showWhen: Record<string, string | number | boolean>;
}

// Expiry date configuration
export interface ExpiryDateConfig {
  'fixed-date'?: {
    'by-user'?: boolean;
    day?: number;
    month?: number;
    year?: number;
  };
  period?: {
    years?: number;
    months?: number;
    days?: number;
  };
}

// Dose configuration for vaccines
export interface DoseConfig {
  date?: BaseFieldConfig;
  induration?: BaseFieldConfig;
  lotNumber?: BaseFieldConfig;
  manufacturer?: BaseFieldConfig;
}

// Section configurations
export interface VaccineSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
  doses: DoseConfig[];
}

export interface BoosterSection {
  enabled: boolean;
  label: string;
  doses: DoseConfig[] | null;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig | null;
  expiryLogic: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface TiterSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  src: BaseFieldConfig;
  testType: BaseFieldConfig;
  text: BaseFieldConfig;
  doseType?: BaseFieldConfig; // For repeatTiter
}

export interface BloodTestSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  src: BaseFieldConfig;
  testType: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface ChestXraySection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface SymptomScreeningSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface CertificationSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  courseName: BaseFieldConfig;
  courseType: BaseFieldConfig;
  documentType: BaseFieldConfig;
  provider: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface LicensureSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  licenseNumber: BaseFieldConfig;
  stateOfLicense: BaseFieldConfig;
  typeOfLicense: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface HISummarySection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  applicableDocuments: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface DeclineSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface HistoryOfDiseaseSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  src: BaseFieldConfig;
  text: BaseFieldConfig;
}

export interface OtherTiterSection {
  enabled: boolean;
  label: string;
  faas: {
    formId: string;
  };
  expiryDate?: ExpiryDateConfig | null;
  expiryLogic: BaseFieldConfig;
  resultDate: BaseFieldConfig;
  src: BaseFieldConfig;
  testType: BaseFieldConfig;
  text: BaseFieldConfig;
}

// Reporting context configuration
export interface ReportingContext {
  clinicalMode?: boolean;
  overrideExpiry?: boolean;
  customFields?: Record<string, unknown>;
}

// Guidelines configuration
export interface GuidelinesConfig {
  samples: {
    collectionId: string;
    files: Record<string, string>;
  };
  templates: {
    collectionId: string;
    files: Record<string, string>;
  };
}

// Main configuration interface
export interface BaseConfig {
  _id: string;
  _updatedAt: string;
  active: boolean;
  allowSetupChanges: boolean;
  appName: string;
  name: string;
  shortName: string;
  category: string;
  docType: string;
  required: boolean;
  version: number;
  createdBy: string;
  updatedBy: string;
  tenantId: string;
  tags: {
    ouCode: string;
    userType: string;
  };
  workflow: {
    auto: boolean;
    on: {
      PendingReview: (string | null)[];
    };
  };
  carryForwardConfig: {
    days: number;
    disabled: boolean;
    type: string;
  };
  reportingContext: ReportingContext;
  guidelines: GuidelinesConfig;

  // Sections
  vaccine: VaccineSection;
  booster: BoosterSection;
  titer: TiterSection;
  repeatTiter: TiterSection;
  bloodTest: BloodTestSection;
  chestXray: ChestXraySection;
  symptomScrn: SymptomScreeningSection;
  certification: CertificationSection;
  licensure: LicensureSection;
  hisummary: HISummarySection;
  decline: DeclineSection;
  historyOfDisease: HistoryOfDiseaseSection;
  otherTiter: OtherTiterSection;
}

export type BaseConfigType = BaseConfig;