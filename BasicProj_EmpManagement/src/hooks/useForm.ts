import { useState } from "react";
import { FormErrors } from "../types";

export function useForm<T>(initialValues: T, validate: (values: T, step: number | 'all') => FormErrors) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (step: number | 'all') => {
    // Pass step to validate function if provided
    const validationErrors = validate(values, step);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  return { values, errors, handleChange, validateForm, setValues, setErrors };
}
