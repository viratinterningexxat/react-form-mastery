export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

export const validateNumber = (value: number, min?: number, max?: number): boolean => {
  if (isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

export const validateArrayMinLength = (arr: unknown[], minLength: number): boolean => {
  return arr.filter(item => {
    if (typeof item === 'string') return item.trim().length > 0;
    if (item !== null && item !== undefined) return item.toString().trim().length > 0;
    return false;
  }).length >= minLength;
};
