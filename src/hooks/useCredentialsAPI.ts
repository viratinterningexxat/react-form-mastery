// ============================================
// Custom Hooks for API Integration
// Maps directly to your blueprint components
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { API } from '@/services/apiClient';
import { SectionSubmission, SectionConfig } from '@/types/enhancedConfig';

// ============================================
// 🎓 STUDENT HOOKS
// ============================================

export function useStudentCredentials(userId?: string) {
  const [credentials, setCredentials] = useState<SectionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.student.getCredentials(userId);
      setCredentials(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credentials');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const submitCredential = useCallback(async (submission: Omit<SectionSubmission, 'id' | 'status'>) => {
    try {
      const newCredential = await API.student.submitCredential(submission);
      setCredentials(prev => [...prev, newCredential]);
      return newCredential;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateCredential = useCallback(async (id: string, updates: Partial<SectionSubmission>) => {
    try {
      const updated = await API.student.updateCredential(id, updates);
      setCredentials(prev => prev.map(cred => cred.id === id ? updated : cred));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteCredential = useCallback(async (id: string) => {
    try {
      await API.student.deleteCredential(id);
      setCredentials(prev => prev.filter(cred => cred.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  return {
    credentials,
    loading,
    error,
    refetch: fetchCredentials,
    submitCredential,
    updateCredential,
    deleteCredential
  };
}

// ============================================
// ✅ APPROVER HOOKS
// ============================================

export function useApprovals() {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.approver.getPendingApprovals();
      setPendingApprovals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  const approveCredential = useCallback(async (id: string) => {
    try {
      const approved = await API.approver.approveCredential(id);
      setPendingApprovals(prev => prev.filter(item => item.credentialId !== id));
      return approved;
    } catch (err) {
      throw err;
    }
  }, []);

  const rejectCredential = useCallback(async (id: string, reason: string) => {
    try {
      const rejected = await API.approver.rejectCredential(id, reason);
      setPendingApprovals(prev => prev.filter(item => item.credentialId !== id));
      return rejected;
    } catch (err) {
      throw err;
    }
  }, []);

  const bulkApprove = useCallback(async (ids: string[]) => {
    try {
      const result = await API.approver.bulkApprove(ids);
      // Refresh pending approvals after bulk operation
      await fetchPendingApprovals();
      return result;
    } catch (err) {
      throw err;
    }
  }, [fetchPendingApprovals]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  return {
    pendingApprovals,
    loading,
    error,
    refetch: fetchPendingApprovals,
    approveCredential,
    rejectCredential,
    bulkApprove
  };
}

// ============================================
// 🏛️ ADMIN HOOKS
// ============================================

export function useAdminConfig() {
  const [config, setConfig] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.admin.getConfiguration();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (newConfig: SectionConfig[]) => {
    try {
      const updated = await API.admin.updateConfiguration(newConfig);
      setConfig(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const addSection = useCallback(async (section: Omit<SectionConfig, 'id'>) => {
    try {
      const newSection = await API.admin.addSection(section);
      setConfig(prev => [...prev, newSection]);
      return newSection;
    } catch (err) {
      throw err;
    }
  }, []);

  const getConfigWithContext = useCallback(async (context: 'clinical' | 'academic') => {
    try {
      const contextualConfig = await API.admin.getConfigurationWithContext(context);
      setConfig(contextualConfig);
      return contextualConfig;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig,
    addSection,
    getConfigWithContext
  };
}

// ============================================
// 📊 DASHBOARD HOOKS
// ============================================

export function useDashboard() {
  const [complianceSummary, setComplianceSummary] = useState<{
    total: number;
    approved: number;
    pending: number;
    expired: number;
  } | null>(null);
  
  const [expiringSoon, setExpiringSoon] = useState<SectionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceSummary = useCallback(async () => {
    try {
      const data = await API.dashboard.getComplianceSummary();
      setComplianceSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance data');
    }
  }, []);

  const fetchExpiringSoon = useCallback(async (days: number = 30) => {
    try {
      const data = await API.dashboard.getExpiringSoon(days);
      setExpiringSoon(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expiring credentials');
    }
  }, []);

  const fetchStudentCompliance = useCallback(async (userId: string) => {
    try {
      const data = await API.dashboard.getStudentCompliance(userId);
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchComplianceSummary(),
          fetchExpiringSoon()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchComplianceSummary, fetchExpiringSoon]);

  return {
    complianceSummary,
    expiringSoon,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      await Promise.all([
        fetchComplianceSummary(),
        fetchExpiringSoon()
      ]);
      setLoading(false);
    },
    fetchStudentCompliance
  };
}

// ============================================
// 🔐 AUTH HOOKS
// ============================================

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(API.isAuthenticated());
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await API.auth.login(email, password);
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    API.auth.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const userData = await API.auth.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (API.isAuthenticated()) {
      getCurrentUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [getCurrentUser]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    getCurrentUser
  };
}

// ============================================
// 🤖 RULE ENGINE HOOKS
// ============================================

export function useRuleEngine() {
  const validateForm = useCallback(async (section: SectionConfig, formData: any) => {
    try {
      return await API.engine.validateForm(section, formData);
    } catch (err) {
      throw err;
    }
  }, []);

  const calculateExpiry = useCallback(async (rule: any, formData: any) => {
    try {
      return await API.engine.calculateExpiry(rule, formData);
    } catch (err) {
      throw err;
    }
  }, []);

  const evaluateVisibility = useCallback(async (field: any, formData: any) => {
    try {
      return await API.engine.evaluateVisibility(field, formData);
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    validateForm,
    calculateExpiry,
    evaluateVisibility
  };
}