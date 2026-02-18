// ============================================
// Clinical Credentialing Types
// Based on Exxat "Verified Professional" Flow
// ============================================

// Document approval status following Prism → Approve → One flow
export type DocumentStatus = 
  | 'pending_upload'
  | 'pending_review'
  | 'approved'
  | 'approved_with_exception'
  | 'rejected'
  | 'expired';

// Categories of required credentials
export type CredentialCategory = 
  | 'immunization'
  | 'certification'
  | 'background_check'
  | 'training'
  | 'identification'
  | 'health_screening';

// Credential requirement definition
export interface CredentialRequirement {
  id: string;
  name: string;
  category: CredentialCategory;
  description: string;
  validityPeriodDays: number | null; // null = never expires
  isRequired: boolean;
  templateUrl?: string;
}

// Uploaded document with approval workflow
export interface CredentialDocument {
  id: string;
  requirementId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileDataUrl: string; // Base64 for localStorage demo
  uploadedAt: string;
  status: DocumentStatus;
  expiresAt: string | null;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Student profile (Exxat One)
export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  legalName: string; // Must match certificates
  email: string;
  phone: string;
  program: string;
  expectedGraduation: string;
  bio: string;
  profilePhotoUrl?: string;
  workHistory: WorkHistoryEntry[];
  interests: string[];
  languages: string[];
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkHistoryEntry {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
}

// Expiration alert
export interface ExpirationAlert {
  id: string;
  credentialId: string;
  credentialName: string;
  expiresAt: string;
  daysUntilExpiry: number;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  createdAt: string;
}

// Clinical readiness status
export interface ClinicalReadiness {
  isReady: boolean;
  totalRequired: number;
  totalCompleted: number;
  totalPending: number;
  totalExpiring: number;
  totalRejected: number;
  percentComplete: number;
  missingRequirements: string[];
  expiringRequirements: string[];
}

// Default credential requirements for clinical programs
export const DEFAULT_REQUIREMENTS: CredentialRequirement[] = [
  {
    id: 'tdap',
    name: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    category: 'immunization',
    description: 'Must be within the last 10 years',
    validityPeriodDays: 3650, // 10 years
    isRequired: true,
  },
  {
    id: 'mmr',
    name: 'MMR (Measles, Mumps, Rubella)',
    category: 'immunization',
    description: '2-dose series or positive titer results',
    validityPeriodDays: null, // Lifetime
    isRequired: true,
  },
  {
    id: 'varicella',
    name: 'Varicella (Chickenpox)',
    category: 'immunization',
    description: '2-dose series or positive titer results',
    validityPeriodDays: null,
    isRequired: true,
  },
  {
    id: 'hepatitis_b',
    name: 'Hepatitis B',
    category: 'immunization',
    description: '3-dose series with positive titer or declination',
    validityPeriodDays: null,
    isRequired: true,
  },
  {
    id: 'flu_shot',
    name: 'Influenza Vaccine',
    category: 'immunization',
    description: 'Current season flu shot required',
    validityPeriodDays: 365,
    isRequired: true,
  },
  {
    id: 'tb_test',
    name: 'TB Screening',
    category: 'health_screening',
    description: 'Annual TB test or chest X-ray if positive history',
    validityPeriodDays: 365,
    isRequired: true,
  },
  {
    id: 'covid_vaccine',
    name: 'COVID-19 Vaccination',
    category: 'immunization',
    description: 'Primary series plus recommended boosters',
    validityPeriodDays: null,
    isRequired: true,
  },
  {
    id: 'bls_cpr',
    name: 'BLS/CPR Certification',
    category: 'certification',
    description: 'American Heart Association BLS for Healthcare Providers',
    validityPeriodDays: 730, // 2 years
    isRequired: true,
  },
  {
    id: 'hipaa',
    name: 'HIPAA Training',
    category: 'training',
    description: 'Annual HIPAA privacy and security training',
    validityPeriodDays: 365,
    isRequired: true,
  },
  {
    id: 'osha',
    name: 'OSHA Bloodborne Pathogens',
    category: 'training',
    description: 'Annual bloodborne pathogen training',
    validityPeriodDays: 365,
    isRequired: true,
  },
  {
    id: 'background_check',
    name: 'Background Check',
    category: 'background_check',
    description: 'Criminal background check clearance',
    validityPeriodDays: 365,
    isRequired: true,
  },
  {
    id: 'drug_screen',
    name: 'Drug Screening',
    category: 'background_check',
    description: '10-panel drug screening',
    validityPeriodDays: 365,
    isRequired: true,
  },
  {
    id: 'physical_exam',
    name: 'Physical Examination',
    category: 'health_screening',
    description: 'Annual physical exam clearance',
    validityPeriodDays: 365,
    isRequired: true,
  },
  {
    id: 'government_id',
    name: 'Government-Issued ID',
    category: 'identification',
    description: 'Valid driver\'s license or passport',
    validityPeriodDays: null,
    isRequired: true,
  },
];

// Helper functions
export function getStatusColor(status: DocumentStatus): 'success' | 'warning' | 'default' | 'destructive' | 'secondary' | 'outline' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'approved_with_exception':
      return 'warning';
    case 'pending_review':
      return 'default';
    case 'pending_upload':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    case 'expired':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'approved_with_exception':
      return 'Approved with Exception';
    case 'pending_review':
      return 'Pending Review';
    case 'pending_upload':
      return 'Not Uploaded';
    case 'rejected':
      return 'Rejected';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
}

export function getCategoryLabel(category: CredentialCategory): string {
  switch (category) {
    case 'immunization':
      return 'Immunizations';
    case 'certification':
      return 'Certifications';
    case 'background_check':
      return 'Background Checks';
    case 'training':
      return 'Training';
    case 'identification':
      return 'Identification';
    case 'health_screening':
      return 'Health Screenings';
    default:
      return 'Other';
  }
}

export function getCategoryIcon(category: CredentialCategory): string {
  switch (category) {
    case 'immunization':
      return 'Syringe';
    case 'certification':
      return 'Award';
    case 'background_check':
      return 'Shield';
    case 'training':
      return 'GraduationCap';
    case 'identification':
      return 'IdCard';
    case 'health_screening':
      return 'Stethoscope';
    default:
      return 'FileText';
  }
}
