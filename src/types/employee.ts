export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  experience: number;
  skills: string[];
  createdAt: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  experience: number;
  skills: string[];
}

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
] as const;

export const ROLES = {
  Engineering: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager', 'DevOps Engineer'],
  Design: ['UI Designer', 'UX Designer', 'Product Designer', 'Design Lead', 'Creative Director'],
  Marketing: ['Marketing Specialist', 'Content Manager', 'SEO Specialist', 'Marketing Manager', 'CMO'],
  Sales: ['Sales Representative', 'Account Executive', 'Sales Manager', 'VP of Sales'],
  'Human Resources': ['HR Coordinator', 'HR Specialist', 'HR Manager', 'Recruiter', 'HR Director'],
  Finance: ['Accountant', 'Financial Analyst', 'Finance Manager', 'CFO', 'Controller'],
  Operations: ['Operations Coordinator', 'Operations Manager', 'COO', 'Project Manager'],
  'Customer Support': ['Support Agent', 'Support Lead', 'Customer Success Manager', 'Head of Support'],
} as const;

export const initialFormData: EmployeeFormData = {
  name: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  experience: 0,
  skills: [''],
};
