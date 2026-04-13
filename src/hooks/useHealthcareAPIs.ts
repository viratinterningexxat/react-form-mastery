// ============================================
// Custom Hooks for Free Healthcare APIs
// Easy integration with React components
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { 
  FreeHealthcareAPIs, 
  NPIProvider, 
  RxNormDrug, 
  LOINCCode,
  CredentialVerificationResult 
} from '@/services/freeHealthcareAPIs';

// ============================================
// NPI Provider Verification Hook
// ============================================

export function useNPIVerification() {
  const [provider, setProvider] = useState<NPIProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyNPI = useCallback(async (npi: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await FreeHealthcareAPIs.npi.verifyNPI(npi);
      setProvider(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'NPI verification failed';
      setError(errorMessage);
      setProvider(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProviders = useCallback(async (
    firstName?: string,
    lastName?: string,
    state?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await FreeHealthcareAPIs.npi.searchProviders(
        firstName, lastName, state
      );
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Provider search failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    provider,
    loading,
    error,
    verifyNPI,
    searchProviders,
    clearError: () => setError(null)
  };
}

// ============================================
// Drug/Vaccine Validation Hook
// ============================================

export function useDrugValidation() {
  const [drugs, setDrugs] = useState<RxNormDrug[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDrugs = useCallback(async (name: string) => {
    if (!name.trim()) {
      setDrugs([]);
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await FreeHealthcareAPIs.rxnorm.searchDrug(name);
      setDrugs(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Drug search failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateVaccineManufacturer = useCallback(async (name: string) => {
    try {
      return await FreeHealthcareAPIs.rxnorm.validateVaccineManufacturer(name);
    } catch (err) {
      return false;
    }
  }, []);

  return {
    drugs,
    loading,
    error,
    searchDrugs,
    validateVaccineManufacturer,
    clearError: () => setError(null)
  };
}

// ============================================
// Lab Test Code Lookup Hook
// ============================================

export function useLabTestLookup() {
  const [tests, setTests] = useState<LOINCCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLabTests = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTests([]);
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await FreeHealthcareAPIs.loinc.searchLabTests(query);
      setTests(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lab test search failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCommonLabTests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await FreeHealthcareAPIs.loinc.getCommonLabTests();
      setTests(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load common tests';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tests,
    loading,
    error,
    searchLabTests,
    getCommonLabTests,
    clearError: () => setError(null)
  };
}

// ============================================
// Comprehensive Credential Verification Hook
// ============================================

export function useCredentialVerification() {
  const [verificationResult, setVerificationResult] = useState<CredentialVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyCredential = useCallback(async (credential: {
    npi?: string;
    drugName?: string;
    labTest?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await FreeHealthcareAPIs.verification.verifyCredential(credential);
      setVerificationResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Credential verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    verificationResult,
    loading,
    error,
    verifyCredential,
    clearResult: () => setVerificationResult(null),
    clearError: () => setError(null)
  };
}

// ============================================
// CDC Vaccine Schedule Hook
// ============================================

export function useVaccineSchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await FreeHealthcareAPIs.cdc.getImmunizationSchedule();
      setSchedule(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vaccine schedule';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendationsByAge = useCallback(async (age: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const recommendations = await FreeHealthcareAPIs.cdc.getVaccineRecommendations(age);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  return {
    schedule,
    loading,
    error,
    loadSchedule,
    getRecommendationsByAge,
    clearError: () => setError(null)
  };
}

// ============================================
// SMART Health Card Verification Hook
// ============================================

export function useHealthCardVerification() {
  const [healthCard, setHealthCard] = useState<any | null>(null);
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyHealthCard = useCallback(async (qrData: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await FreeHealthcareAPIs.smartHealth.verifyHealthCard(qrData);
      
      if (card) {
        setHealthCard(card);
        const immRecords = FreeHealthcareAPIs.smartHealth.extractImmunizations(card);
        setImmunizations(immRecords);
        return { card, immunizations: immRecords };
      } else {
        throw new Error('Invalid SMART Health Card');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health card verification failed';
      setError(errorMessage);
      setHealthCard(null);
      setImmunizations([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    healthCard,
    immunizations,
    loading,
    error,
    verifyHealthCard,
    clearResult: () => {
      setHealthCard(null);
      setImmunizations([]);
    },
    clearError: () => setError(null)
  };
}

// ============================================
// FHIR Integration Hook
// ============================================

export function useFHIRIntegration() {
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientImmunizations = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await FreeHealthcareAPIs.fhir.searchImmunizations(patientId);
      setImmunizations(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch immunizations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatientObservations = useCallback(async (patientId: string, code?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await FreeHealthcareAPIs.fhir.searchObservations(patientId, code);
      setObservations(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch observations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    immunizations,
    observations,
    loading,
    error,
    fetchPatientImmunizations,
    fetchPatientObservations,
    clearData: () => {
      setImmunizations([]);
      setObservations([]);
    },
    clearError: () => setError(null)
  };
}