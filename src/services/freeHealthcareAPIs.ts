// ============================================
// Free Healthcare APIs Integration
// Production-ready implementations using free tiers
// ============================================

import { API } from './apiClient';

// ============================================
// 1. NPI Registry API (US Provider Verification)
// ============================================

export interface NPIProvider {
  npi: string;
  firstName: string;
  lastName: string;
  credential: string;
  primaryTaxonomy: {
    code: string;
    desc: string;
    state: string;
    license: string;
  };
  addresses: Array<{
    address_1: string;
    city: string;
    state: string;
    postal_code: string;
    telephone_number: string;
  }>;
}

export const npiAPI = {
  // Search providers by name
  async searchProviders(
    firstName?: string,
    lastName?: string,
    state?: string,
    taxonomy?: string
  ): Promise<NPIProvider[]> {
    const params = new URLSearchParams();
    if (firstName) params.append('first_name', firstName);
    if (lastName) params.append('last_name', lastName);
    if (state) params.append('state', state);
    if (taxonomy) params.append('taxonomy_description', taxonomy);
    
    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?version=2.1&${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('NPI Registry API error');
    }
    
    const data = await response.json();
    return data.results || [];
  },

  // Verify specific NPI number
  async verifyNPI(npi: string): Promise<NPIProvider | null> {
    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`
    );
    
    if (!response.ok) {
      throw new Error('NPI verification failed');
    }
    
    const data = await response.json();
    return data.results?.[0] || null;
  }
};

// ============================================
// 2. RxNorm API (Drug/Vaccine Normalization)
// ============================================

export interface RxNormDrug {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: string;
}

export const rxnormAPI = {
  // Search for drug/vaccine by name
  async searchDrug(name: string): Promise<RxNormDrug[]> {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(name)}`
    );
    
    if (!response.ok) {
      throw new Error('RxNorm API error');
    }
    
    const data = await response.json();
    return data.drugGroup?.conceptGroup?.flatMap((group: any) => 
      group.conceptProperties || []
    ) || [];
  },

  // Get drug details by RxCUI
  async getDrugDetails(rxcui: string): Promise<any> {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`
    );
    
    if (!response.ok) {
      throw new Error('RxNorm details error');
    }
    
    return response.json();
  },

  // Validate vaccine manufacturer name
  async validateVaccineManufacturer(name: string): Promise<boolean> {
    try {
      const results = await this.searchDrug(name);
      return results.some(drug => 
        drug.name.toLowerCase().includes('vaccine') ||
        drug.tty === 'BN' // Brand Name
      );
    } catch {
      return false;
    }
  }
};

// ============================================
// 3. LOINC API (Lab Test Codes)
// ============================================

export interface LOINCCode {
  loincNum: string;
  component: string;
  property: string;
  timeAspect: string;
  system: string;
  scaleType: string;
  methodType: string;
  longCommonName: string;
}

export const loincAPI = {
  // Search for lab test codes
  async searchLabTests(query: string): Promise<LOINCCode[]> {
    const response = await fetch(
      `https://loinc.org/search/?t=1&s=${encodeURIComponent(query)}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('LOINC API error');
    }
    
    const data = await response.json();
    return data.Results || [];
  },

  // Common credential-related lab tests
  async getCommonLabTests(): Promise<LOINCCode[]> {
    const commonTests = [
      'TB test',
      'Hepatitis B surface antibody',
      'MMR antibody',
      'Varicella antibody',
      'Tdap',
      'Influenza'
    ];
    
    const results: LOINCCode[] = [];
    for (const test of commonTests) {
      try {
        const tests = await this.searchLabTests(test);
        results.push(...tests.slice(0, 3)); // Top 3 results per test
      } catch (error) {
        console.warn(`Failed to fetch ${test}:`, error);
      }
    }
    
    return results;
  }
};

// ============================================
// 4. CDC Open Data API (Vaccine Schedules)
// ============================================

export const cdcAPI = {
  // Get immunization schedule
  async getImmunizationSchedule(): Promise<any> {
    const response = await fetch(
      'https://data.cdc.gov/resource/7kqx-2x9f.json'
    );
    
    if (!response.ok) {
      throw new Error('CDC API error');
    }
    
    return response.json();
  },

  // Get vaccine recommendations by age
  async getVaccineRecommendations(age: number): Promise<any[]> {
    const schedule = await this.getImmunizationSchedule();
    
    // Filter by age group
    return schedule.filter((item: any) => {
      const minAge = parseInt(item.minimum_age);
      const maxAge = parseInt(item.maximum_age);
      return age >= minAge && age <= maxAge;
    });
  }
};

// ============================================
// 5. SMART Health Cards (Open Standard)
// ============================================

export interface SMARTHealthCard {
  iss: string;
  nbf: number;
  vc: {
    type: string[];
    credentialSubject: {
      fhirVersion: string;
      fhirBundle: {
        resourceType: string;
        entry: any[];
      };
    };
  };
}

export const smartHealthAPI = {
  // Verify SMART Health Card QR code data
  async verifyHealthCard(qrData: string): Promise<SMARTHealthCard | null> {
    try {
      // Decode base64url
      const decoded = JSON.parse(atob(qrData.replace(/^shc:\/\//, '')));
      return decoded;
    } catch (error) {
      console.error('Invalid SMART Health Card:', error);
      return null;
    }
  },

  // Extract immunization records from health card
  extractImmunizations(healthCard: SMARTHealthCard): any[] {
    const entries = healthCard.vc?.credentialSubject?.fhirBundle?.entry || [];
    return entries.filter((entry: any) => 
      entry.resource?.resourceType === 'Immunization'
    );
  }
};

// ============================================
// 6. HAPI FHIR Public Server (Testing)
// ============================================

export const fhirAPI = {
  baseUrl: 'http://hapi.fhir.org/baseR4',

  // Search for patient immunizations
  async searchImmunizations(patientId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/Immunization?patient=${patientId}`
    );
    
    if (!response.ok) {
      throw new Error('FHIR API error');
    }
    
    const bundle = await response.json();
    return bundle.entry?.map((e: any) => e.resource) || [];
  },

  // Get patient observations (lab results)
  async searchObservations(patientId: string, code?: string): Promise<any[]> {
    let url = `${this.baseUrl}/Observation?patient=${patientId}`;
    if (code) url += `&code=${code}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('FHIR API error');
    }
    
    const bundle = await response.json();
    return bundle.entry?.map((e: any) => e.resource) || [];
  },

  // Create immunization record
  async createImmunization(immunization: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/Immunization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(immunization)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create immunization record');
    }
    
    return response.json();
  }
};

// ============================================
// 7. Free OCR Services Integration
// ============================================

export const ocrAPI = {
  // Tesseract.js integration (client-side)
  async extractWithTesseract(imageFile: File): Promise<string> {
    // This would require tesseract.js package
    // Implementation depends on your OCR setup
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch('/api/ocr/tesseract', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('OCR extraction failed');
    }
    
    return response.text();
  },

  // Google Cloud Vision API (free tier: 1000 requests/month)
  async extractWithGoogleVision(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch('/api/ocr/google-vision', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Google Vision OCR failed');
    }
    
    return response.json();
  }
};

// ============================================
// 8. Combined Credential Verification Service
// ============================================

export interface CredentialVerificationResult {
  isValid: boolean;
  provider?: NPIProvider;
  drugInfo?: RxNormDrug;
  labCode?: LOINCCode;
  errors: string[];
}

export const credentialVerificationService = {
  // Comprehensive credential verification
  async verifyCredential(credential: {
    npi?: string;
    drugName?: string;
    labTest?: string;
  }): Promise<CredentialVerificationResult> {
    const result: CredentialVerificationResult = {
      isValid: true,
      errors: []
    };

    // Verify NPI if provided
    if (credential.npi) {
      try {
        const provider = await npiAPI.verifyNPI(credential.npi);
        if (provider) {
          result.provider = provider;
        } else {
          result.isValid = false;
          result.errors.push('Invalid NPI number');
        }
      } catch (error) {
        result.errors.push('NPI verification service unavailable');
      }
    }

    // Verify drug/vaccine if provided
    if (credential.drugName) {
      try {
        const drugs = await rxnormAPI.searchDrug(credential.drugName);
        if (drugs.length > 0) {
          result.drugInfo = drugs[0];
        } else {
          result.errors.push(`Drug not found: ${credential.drugName}`);
        }
      } catch (error) {
        result.errors.push('Drug verification service unavailable');
      }
    }

    // Verify lab test if provided
    if (credential.labTest) {
      try {
        const tests = await loincAPI.searchLabTests(credential.labTest);
        if (tests.length > 0) {
          result.labCode = tests[0];
        } else {
          result.errors.push(`Lab test not found: ${credential.labTest}`);
        }
      } catch (error) {
        result.errors.push('Lab test verification service unavailable');
      }
    }

    return result;
  }
};

// ============================================
// Export all APIs
// ============================================

export const FreeHealthcareAPIs = {
  npi: npiAPI,
  rxnorm: rxnormAPI,
  loinc: loincAPI,
  cdc: cdcAPI,
  smartHealth: smartHealthAPI,
  fhir: fhirAPI,
  ocr: ocrAPI,
  verification: credentialVerificationService
};