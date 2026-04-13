export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  experience: number;
  skills: string[];
  photo?: string;
  bio?: string;
  interests?: string[];
  languages?: string[];
  certifications?: string[];
  dateOfJoining?: string;
}

export interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  experience: number | string; // string allowed for empty input state
  skills: string[];
}

export interface FormErrors {
  [key: string]: string;
}
