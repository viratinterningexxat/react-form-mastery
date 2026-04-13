import { EmployeeFormValues, FormErrors } from '../types';

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validateEmployeeForm = (values: EmployeeFormValues, step: number | 'all'): FormErrors => {
  const errors: FormErrors = {};

  if (step === 1 || step === 'all') {
    if (!values.name || !values.name.trim()) errors.name = "Name is required";
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(values.email)) {
      errors.email = "Invalid email format";
    }
    if (!values.phone) errors.phone = "Phone is required";
  }

  if (step === 2 || step === 'all') {
    if (!values.department) errors.department = "Department is required";
    if (!values.role) errors.role = "Role is required";
    if (values.experience === "" || values.experience === null || values.experience === undefined) {
      errors.experience = "Experience is required";
    } else if (Number(values.experience) < 0) {
      errors.experience = "Experience cannot be negative";
    }
  }

  if (step === 3 || step === 'all') {
    if (!values.skills || values.skills.length === 0) {
      errors.skills = "At least one skill is required";
    } else {
        const hasEmptySkill = values.skills.some(skill => !skill.trim());
        if (hasEmptySkill) {
            errors.skills = "Skills cannot be empty";
        }
    }
  }

  return errors;
};
