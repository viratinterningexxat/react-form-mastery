// ============================================
// Detailed Credential Data Types
// For vaccine doses, manufacturers, etc.
// ============================================

export interface VaccineDose {
  doseNumber: number;
  manufacturer: string;
  lotNumber?: string;
  administrationDate: string;
  expirationDate: string; // Auto-calculated 1 year from administration
  site?: string; // Injection site
  administeredBy?: string;
}

export interface CredentialDetails {
  requirementId: string;
  type: 'vaccine' | 'certification' | 'screening' | 'training' | 'document';
  doses?: VaccineDose[]; // For multi-dose vaccines
  issueDate?: string;
  expirationDate?: string;
  certificationNumber?: string;
  issuingOrganization?: string;
  notes?: string;
}

// Common vaccine manufacturers
export const VACCINE_MANUFACTURERS = [
  'Pfizer-BioNTech',
  'Moderna',
  'Johnson & Johnson',
  'AstraZeneca',
  'Novavax',
  'Merck',
  'GlaxoSmithKline (GSK)',
  'Sanofi Pasteur',
  'Seqirus',
  'CSL Limited',
  'Other',
] as const;

// Certification issuers
export const CERTIFICATION_ISSUERS = [
  'American Heart Association (AHA)',
  'American Red Cross',
  'National Safety Council',
  'OSHA',
  'Other',
] as const;

// Helper to calculate expiration date (1 year from start)
export function calculateExpirationDate(startDate: string): string {
  const date = new Date(startDate);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}

// Helper to calculate days until expiration
export function getDaysUntilExpiration(expirationDate: string): number {
  const expiry = new Date(expirationDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
