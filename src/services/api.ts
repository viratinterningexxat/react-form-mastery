import { Employee, EmployeeFormData } from '@/types/employee';

// ============= API Service Layer =============
// Demonstrates API patterns, error handling, and TypeScript

/**
 * Custom API Error class with status codes
 * Extends Error for proper error handling in catch blocks
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    // Maintains proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Generic API response wrapper
 * Provides consistent response structure
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters for employee queries
 */
export interface EmployeeFilters extends PaginationParams {
  search?: string;
  department?: string;
  role?: string;
  minExperience?: number;
  maxExperience?: number;
}

// Simulated network delay for realistic API behavior
const simulateNetworkDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Random failure simulation for testing error states (10% chance)
const shouldSimulateError = () => Math.random() < 0.1;

/**
 * Mock database - in production this would be an actual API call
 */
let mockDatabase: Employee[] = [];

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('employees');
    if (stored) {
      mockDatabase = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load employees from storage:', error);
  }
}

// Sync to localStorage
const syncToStorage = () => {
  try {
    localStorage.setItem('employees', JSON.stringify(mockDatabase));
  } catch (error) {
    console.error('Failed to sync employees to storage:', error);
  }
};

if (mockDatabase.length === 0) {
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Support'];
  const roles = ['Software Engineer', 'Product Designer', 'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Accountant', 'Operations Manager', 'Support Agent'];
  for (let i = 0; i < 10000; i++) {
    const deptIndex = Math.floor(Math.random() * departments.length);
    mockDatabase.push({
      id: crypto.randomUUID(),
      name: `Mock Employee ${i + 1}`,
      email: `mock.employee${i + 1}@example.com`,
      phone: `+1-555-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
      department: departments[deptIndex],
      role: roles[deptIndex],
      experience: Math.floor(Math.random() * 15) + 1,
      skills: ['React', 'TypeScript', 'Node.js'],
      createdAt: new Date().toISOString(),
    });
  }
  // Try to sync to store if possible, though localstorage may cap at 5MB, which ~10000 records may exceed. Handling gracefully via existing try/catch in syncToStorage.
  syncToStorage();
}

/**
 * Employee API Service
 * Simulates real API behavior with mock data
 */
export const employeeApi = {
  /**
   * Fetch all employees with optional filtering and pagination
   */
  async getAll(filters: EmployeeFilters = {}): Promise<ApiResponse<Employee[]>> {
    await simulateNetworkDelay();

    // Simulate random API errors for testing error states
    if (shouldSimulateError()) {
      throw new ApiError('Network error: Failed to fetch employees', 500, 'NETWORK_ERROR');
    }

    let result = [...mockDatabase];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(emp =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (filters.department) {
      result = result.filter(emp => emp.department === filters.department);
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter(emp => emp.role === filters.role);
    }

    // Apply experience filters
    if (filters.minExperience !== undefined) {
      result = result.filter(emp => emp.experience >= filters.minExperience!);
    }
    if (filters.maxExperience !== undefined) {
      result = result.filter(emp => emp.experience <= filters.maxExperience!);
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof Employee];
        const bVal = b[filters.sortBy as keyof Employee];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const startIndex = (page - 1) * limit;
    const paginatedResult = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedResult,
      meta: {
        total: result.length,
        page,
        limit,
      },
    };
  },

  /**
   * Fetch a single employee by ID
   */
  async getById(id: string): Promise<ApiResponse<Employee>> {
    await simulateNetworkDelay(500);

    const employee = mockDatabase.find(emp => emp.id === id);

    if (!employee) {
      throw new ApiError(`Employee with ID ${id} not found`, 404, 'NOT_FOUND');
    }

    return { data: employee };
  },

  /**
   * Create a new employee
   */
  async create(data: EmployeeFormData): Promise<ApiResponse<Employee>> {
    await simulateNetworkDelay(1000);

    // Validate email uniqueness
    if (mockDatabase.some(emp => emp.email === data.email)) {
      throw new ApiError('Employee with this email already exists', 409, 'DUPLICATE_EMAIL');
    }

    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      ...data,
      skills: data.skills.filter(s => s.trim().length > 0),
      createdAt: new Date().toISOString(),
    };

    mockDatabase.push(newEmployee);
    syncToStorage();

    return {
      data: newEmployee,
      message: 'Employee created successfully',
    };
  },

  /**
   * Update an existing employee
   */
  async update(id: string, data: Partial<EmployeeFormData>): Promise<ApiResponse<Employee>> {
    await simulateNetworkDelay(800);

    const index = mockDatabase.findIndex(emp => emp.id === id);

    if (index === -1) {
      throw new ApiError(`Employee with ID ${id} not found`, 404, 'NOT_FOUND');
    }

    // Check for email conflict (if updating email)
    if (data.email && mockDatabase.some(emp => emp.email === data.email && emp.id !== id)) {
      throw new ApiError('Email already in use by another employee', 409, 'DUPLICATE_EMAIL');
    }

    const updatedEmployee = {
      ...mockDatabase[index],
      ...data,
      skills: data.skills ? data.skills.filter(s => s.trim().length > 0) : mockDatabase[index].skills,
    };

    mockDatabase[index] = updatedEmployee;
    syncToStorage();

    return {
      data: updatedEmployee,
      message: 'Employee updated successfully',
    };
  },

  /**
   * Delete an employee
   */
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    await simulateNetworkDelay(600);

    const index = mockDatabase.findIndex(emp => emp.id === id);

    if (index === -1) {
      throw new ApiError(`Employee with ID ${id} not found`, 404, 'NOT_FOUND');
    }

    mockDatabase.splice(index, 1);
    syncToStorage();

    return {
      data: { deleted: true },
      message: 'Employee deleted successfully',
    };
  },

  /**
   * Batch operations for multiple employees
   */
  async batchDelete(ids: string[]): Promise<ApiResponse<{ deleted: number }>> {
    await simulateNetworkDelay(1200);

    const initialLength = mockDatabase.length;
    mockDatabase = mockDatabase.filter(emp => !ids.includes(emp.id));
    const deletedCount = initialLength - mockDatabase.length;

    syncToStorage();

    return {
      data: { deleted: deletedCount },
      message: `${deletedCount} employees deleted successfully`,
    };
  },
};

/**
 * Type-safe fetch wrapper with error handling
 * For use with actual REST APIs
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    // Add auth header if available
    // 'Authorization': `Bearer ${getToken()}`,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        errorBody.message || `HTTP Error: ${response.status}`,
        response.status,
        errorBody.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network errors, CORS issues, etc.
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}
