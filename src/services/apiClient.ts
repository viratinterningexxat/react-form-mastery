// ============================================
// Centralized API Client for Credential Portal
// Maps directly to your blueprint architecture
// ============================================

import { 
  SectionConfig, 
  FieldConfig, 
  SectionSubmission,
  ExpiryRule,
  VisibilityRule,
  ValidationRules
} from '@/types/enhancedConfig';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = 'auth_token';

// Authentication helpers
const getAuthToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY);
const setAuthToken = (token: string): void => localStorage.setItem(AUTH_TOKEN_KEY, token);
const clearAuthToken = (): void => localStorage.removeItem(AUTH_TOKEN_KEY);

// Generic HTTP request function
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// HTTP client with automatic auth header injection
const apiClient = {
  request,
  
  async get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

// ============================================
// 🎓 STUDENT APIs
// ============================================

export const studentAPI = {
  // 1️⃣ Submit Credential
  async submitCredential(submission: Omit<SectionSubmission, 'id' | 'status'>): Promise<SectionSubmission> {
    return apiClient.post<SectionSubmission>('/credentials', {
      ...submission,
      status: 'pending_review'
    });
  },

  // 2️⃣ Get Student Credentials
  async getCredentials(userId?: string): Promise<SectionSubmission[]> {
    const endpoint = userId ? `/credentials?userId=${userId}` : '/credentials';
    return apiClient.get<SectionSubmission[]>(endpoint);
  },

  // 3️⃣ Update Credential (Before Approval)
  async updateCredential(id: string, updates: Partial<SectionSubmission>): Promise<SectionSubmission> {
    return apiClient.put<SectionSubmission>(`/credentials/${id}`, updates);
  },

  // 4️⃣ Delete Credential
  async deleteCredential(id: string): Promise<void> {
    return apiClient.delete<void>(`/credentials/${id}`);
  },

  // 5️⃣ Upload Document
  async uploadDocument(file: File): Promise<{ url: string; fileId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  // 6️⃣ OCR Extraction
  async extractFromImage(imageFile: File): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/ocr/extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('OCR extraction failed');
    }
    
    return response.json();
  }
};

// ============================================
// ✅ APPROVER APIs
// ============================================

export const approverAPI = {
  // 7️⃣ Get Pending Approvals
  async getPendingApprovals(): Promise<any[]> {
    return apiClient.get<any[]>('/approvals/pending');
  },

  // 8️⃣ Approve Credential
  async approveCredential(id: string): Promise<SectionSubmission> {
    return apiClient.post<SectionSubmission>(`/approvals/${id}/approve`, {});
  },

  // 9️⃣ Reject Credential
  async rejectCredential(id: string, reason: string): Promise<SectionSubmission> {
    return apiClient.post<SectionSubmission>(`/approvals/${id}/reject`, { reason });
  },

  // 🔟 Bulk Approval
  async bulkApprove(ids: string[]): Promise<{ approved: number; failed: number }> {
    return apiClient.post<{ approved: number; failed: number }>('/approvals/bulk', { ids });
  }
};

// ============================================
// 🏛️ ADMIN CONFIG APIs
// ============================================

export const adminAPI = {
  // 11️⃣ Get Configuration
  async getConfiguration(): Promise<SectionConfig[]> {
    return apiClient.get<SectionConfig[]>('/config');
  },

  // 12️⃣ Update Configuration
  async updateConfiguration(config: SectionConfig[]): Promise<SectionConfig[]> {
    return apiClient.put<SectionConfig[]>('/config', config);
  },

  // 13️⃣ Add New Section
  async addSection(section: Omit<SectionConfig, 'id'>): Promise<SectionConfig> {
    return apiClient.post<SectionConfig>('/config/section', section);
  },

  // 14️⃣ Context Override
  async getConfigurationWithContext(context: 'clinical' | 'academic'): Promise<SectionConfig[]> {
    return apiClient.get<SectionConfig[]>(`/config?context=${context}`);
  }
};

// ============================================
// 🤖 RULE ENGINE APIs
// ============================================

export const engineAPI = {
  // 15️⃣ Validate Form
  async validateForm(section: SectionConfig, formData: any): Promise<{ isValid: boolean; errors: string[] }> {
    return apiClient.post<{ isValid: boolean; errors: string[] }>('/engine/validate', {
      section,
      formData
    });
  },

  // 16️⃣ Calculate Expiry
  async calculateExpiry(rule: ExpiryRule, formData: any): Promise<{ expiryDate: string }> {
    return apiClient.post<{ expiryDate: string }>('/engine/calculate-expiry', {
      rule,
      formData
    });
  },

  // 17️⃣ Evaluate Visibility
  async evaluateVisibility(field: FieldConfig, formData: any): Promise<{ visible: boolean }> {
    return apiClient.post<{ visible: boolean }>('/engine/visibility', {
      field,
      formData
    });
  }
};

// ============================================
// 📊 DASHBOARD & ANALYTICS APIs
// ============================================

export const dashboardAPI = {
  // 18️⃣ Compliance Summary
  async getComplianceSummary(): Promise<{
    total: number;
    approved: number;
    pending: number;
    expired: number;
  }> {
    return apiClient.get('/dashboard/compliance');
  },

  // 19️⃣ Expiring Soon
  async getExpiringSoon(days: number = 30): Promise<SectionSubmission[]> {
    return apiClient.get<SectionSubmission[]>(`/dashboard/expiring?days=${days}`);
  },

  // 20️⃣ Student Compliance Status
  async getStudentCompliance(userId: string): Promise<{
    compliant: boolean;
    missing: string[];
    expired: string[];
  }> {
    return apiClient.get(`/users/${userId}/compliance`);
  }
};

// ============================================
// 🔐 AUTH APIs
// ============================================

export const authAPI = {
  // 21️⃣ Login
  async login(email: string, password: string): Promise<{ 
    token: string; 
    user: { id: string; role: 'student' | 'approver' | 'admin' }; 
  }> {
    const response = await apiClient.post<{ token: string; user: any }>('/auth/login', {
      email,
      password
    });
    
    setAuthToken(response.token);
    return response;
  },

  // 22️⃣ Get Current User
  async getCurrentUser(): Promise<{ id: string; role: string }> {
    return apiClient.get<{ id: string; role: string }>('/auth/me');
  },

  // Logout
  logout(): void {
    clearAuthToken();
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!getAuthToken();
  }
};

// ============================================
// EXPORT ALL APIS
// ============================================

export const API = {
  student: studentAPI,
  approver: approverAPI,
  admin: adminAPI,
  engine: engineAPI,
  dashboard: dashboardAPI,
  auth: authAPI,
  // Helper methods
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  isAuthenticated: authAPI.isAuthenticated
};