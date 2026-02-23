// ============================================
// Hook: useDynamicForm
// Manages dynamic form state and operations
// ============================================

import { useState, useCallback, useEffect } from 'react';
import {
  DynamicFormConfig,
  SectionConfig,
  CredentialSubmission,
  FieldEntry,
} from '../types/dynamicConfig';
import {
  evaluateFieldVisibility,
  getVisibleFields,
  calculateExpiryDate,
  validateFormData,
  validateCredentialSubmission,
} from '../services/ruleEngine';
import {
  createCredentialSubmission,
  getOrCreateSectionSubmission,
  updateFieldEntry,
  addRepeatableEntry,
  updateRepeatableEntry,
  removeRepeatableEntry,
  updateSectionExpiryDate,
  updateSectionStatus,
  saveCredentialSubmission,
  loadCredentialSubmission,
  entriesToFormData,
  formDataToEntries,
} from '../services/credentialSubmissionService';

interface UseDynamicFormOptions {
  config: DynamicFormConfig;
  employeeId: string;
  submissionId?: string;
  onSubmit?: (submission: CredentialSubmission) => void;
}

interface UseDynamicFormReturn {
  submission: CredentialSubmission | null;
  currentSectionIndex: number;
  currentSection: SectionConfig | null;
  visibleFields: FieldConfig[];
  errors: { [key: string]: string[] };
  isLoading: boolean;
  isLastSection: boolean;
  progress: number;
  
  // Field operations
  updateField: (fieldKey: string, value: any) => void;
  updateFieldValue: (sectionId: string, fieldKey: string, value: any) => void;
  
  // Repeatable operations
  addRepeatableEntry: (sectionId: string, data?: Record<string, any>) => void;
  removeRepeatableEntry: (sectionId: string, index: number) => void;
  updateRepeatableField: (sectionId: string, index: number, fieldKey: string, value: any) => void;
  
  // Navigation
  goToSection: (index: number) => void;
  nextSection: () => boolean;
  previousSection: () => void;
  
  // Submission
  submitForm: () => boolean;
  saveDraft: () => void;
  getSectionData: (sectionId: string) => Record<string, any>;
  
  // Validation
  validateSection: (sectionId: string) => boolean;
  validateField: (sectionId: string, fieldKey: string) => boolean;
}

export function useDynamicForm({
  config,
  employeeId,
  submissionId,
  onSubmit,
}: UseDynamicFormOptions): UseDynamicFormReturn {
  const [submission, setSubmission] = useState<CredentialSubmission | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize submission
  useEffect(() => {
    setIsLoading(true);
    if (submissionId) {
      const loaded = loadCredentialSubmission(submissionId);
      if (loaded) {
        setSubmission(loaded);
      } else {
        const newSubmission = createCredentialSubmission(employeeId, config.id);
        setSubmission(newSubmission);
      }
    } else {
      const newSubmission = createCredentialSubmission(employeeId, config.id);
      setSubmission(newSubmission);
    }
    setIsLoading(false);
  }, [employeeId, config.id, submissionId]);

  const currentSection = config.sections[currentSectionIndex];

  // Build visible fields based on current form data
  const visibleFields = currentSection ? getVisibleFields(currentSection, formData) : [];

  const updateField = useCallback(
    (fieldKey: string, value: any) => {
      if (!submission || !currentSection) return;

      setFormData((prev) => ({
        ...prev,
        [fieldKey]: value,
      }));

      const updatedSubmission = { ...submission };
      let sectionSubmission = getOrCreateSectionSubmission(
        updatedSubmission,
        currentSection.id
      );

      sectionSubmission = updateFieldEntry(sectionSubmission, fieldKey, value);

      updatedSubmission.sections = updatedSubmission.sections.map((s) =>
        s.sectionId === currentSection.id ? sectionSubmission : s
      );

      setSubmission(updatedSubmission);
    },
    [submission, currentSection]
  );

  const updateFieldValue = useCallback(
    (sectionId: string, fieldKey: string, value: any) => {
      if (!submission) return;

      const updatedSubmission = { ...submission };
      let sectionSubmission = getOrCreateSectionSubmission(updatedSubmission, sectionId);

      sectionSubmission = updateFieldEntry(sectionSubmission, fieldKey, value);

      updatedSubmission.sections = updatedSubmission.sections.map((s) =>
        s.sectionId === sectionId ? sectionSubmission : s
      );

      setSubmission(updatedSubmission);
    },
    [submission]
  );

  const addRepeatableEntryHandler = useCallback(
    (sectionId: string, data?: Record<string, any>) => {
      if (!submission) return;

      const updatedSubmission = { ...submission };
      let sectionSubmission = getOrCreateSectionSubmission(updatedSubmission, sectionId);

      sectionSubmission = addRepeatableEntry(sectionSubmission, data || {});

      updatedSubmission.sections = updatedSubmission.sections.map((s) =>
        s.sectionId === sectionId ? sectionSubmission : s
      );

      setSubmission(updatedSubmission);
    },
    [submission]
  );

  const removeRepeatableEntryHandler = useCallback(
    (sectionId: string, index: number) => {
      if (!submission) return;

      const updatedSubmission = { ...submission };
      let sectionSubmission = getOrCreateSectionSubmission(updatedSubmission, sectionId);

      sectionSubmission = removeRepeatableEntry(sectionSubmission, index);

      updatedSubmission.sections = updatedSubmission.sections.map((s) =>
        s.sectionId === sectionId ? sectionSubmission : s
      );

      setSubmission(updatedSubmission);
    },
    [submission]
  );

  const updateRepeatableField = useCallback(
    (sectionId: string, index: number, fieldKey: string, value: any) => {
      if (!submission) return;

      const updatedSubmission = { ...submission };
      let sectionSubmission = getOrCreateSectionSubmission(updatedSubmission, sectionId);

      sectionSubmission = updateRepeatableEntry(sectionSubmission, index, {
        [fieldKey]: value,
      });

      updatedSubmission.sections = updatedSubmission.sections.map((s) =>
        s.sectionId === sectionId ? sectionSubmission : s
      );

      setSubmission(updatedSubmission);
    },
    [submission]
  );

  const validateSection = useCallback(
    (sectionId: string): boolean => {
      if (!submission) return false;

      const section = config.sections.find((s) => s.id === sectionId);
      const sectionSubmission = submission.sections.find((s) => s.sectionId === sectionId);

      if (!section || !sectionSubmission) return false;

      const sectionData = entriesToFormData(sectionSubmission.fields);
      const validation = validateFormData(section, sectionData);

      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          [sectionId]: validation.errors.map((e) => e.message),
        }));
        return false;
      }

      // Calculate expiry if applicable
      if (section.expiryRule) {
        const expiryDate = calculateExpiryDate(section.expiryRule, sectionData);
        updateSectionExpiryDate(sectionSubmission, expiryDate);
      }

      return true;
    },
    [submission, config.sections]
  );

  const validateField = useCallback(
    (sectionId: string, fieldKey: string): boolean => {
      if (!submission) return false;

      const section = config.sections.find((s) => s.id === sectionId);
      const field = section?.fields.find((f) => f.key === fieldKey);

      if (!section || !field) return false;

      const sectionSubmission = submission.sections.find((s) => s.sectionId === sectionId);
      if (!sectionSubmission) return false;

      const fieldEntry = sectionSubmission.fields.find((f) => f.key === fieldKey);
      const value = fieldEntry?.value;

      // Required check
      if (field.required && (value === undefined || value === null || value === '')) {
        setErrors((prev) => ({
          ...prev,
          [fieldKey]: [`${field.label} is required`],
        }));
        return false;
      }

      // TODO: Apply field-specific validation rules

      return true;
    },
    [submission, config.sections]
  );

  const nextSection = useCallback((): boolean => {
    if (!currentSection) return false;

    // Validate current section
    if (!validateSection(currentSection.id)) {
      return false;
    }

    // Move to next section
    if (currentSectionIndex < config.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setErrors({});
      setFormData({});
      return true;
    }

    return false;
  }, [currentSectionIndex, currentSection, config.sections.length, validateSection]);

  const previousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setErrors({});
    }
  }, [currentSectionIndex]);

  const goToSection = useCallback((index: number) => {
    if (index >= 0 && index < config.sections.length) {
      setCurrentSectionIndex(index);
      setErrors({});
      setFormData({});
    }
  }, [config.sections.length]);

  const getSectionData = useCallback(
    (sectionId: string): Record<string, any> => {
      if (!submission) return {};

      const sectionSubmission = submission.sections.find((s) => s.sectionId === sectionId);
      if (!sectionSubmission) return {};

      return entriesToFormData(sectionSubmission.fields);
    },
    [submission]
  );

  const saveDraft = useCallback(() => {
    if (submission) {
      submission.status = 'in_progress';
      saveCredentialSubmission(submission);
    }
  }, [submission]);

  const submitForm = useCallback((): boolean => {
    if (!submission) return false;

    // Validate all sections
    const validation = validateCredentialSubmission(config, submission);
    if (!validation.valid) {
      const errorMap: { [key: string]: string[] } = {};
      for (const error of validation.errors) {
        if (!errorMap[error.fieldKey]) {
          errorMap[error.fieldKey] = [];
        }
        errorMap[error.fieldKey].push(error.message);
      }
      setErrors(errorMap);
      return false;
    }

    // Mark submission as complete
    submission.status = 'submitted';
    submission.completedAt = new Date().toISOString();

    saveCredentialSubmission(submission);
    onSubmit?.(submission);
    return true;
  }, [submission, config, onSubmit]);

  return {
    submission,
    currentSectionIndex,
    currentSection: currentSection || null,
    visibleFields: visibleFields as any,
    errors,
    isLoading,
    isLastSection: currentSectionIndex === config.sections.length - 1,
    progress: ((currentSectionIndex + 1) / config.sections.length) * 100,
    
    updateField,
    updateFieldValue,
    addRepeatableEntry: addRepeatableEntryHandler,
    removeRepeatableEntry: removeRepeatableEntryHandler,
    updateRepeatableField,
    goToSection,
    nextSection,
    previousSection,
    submitForm,
    saveDraft,
    getSectionData,
    validateSection,
    validateField,
  };
}

export default useDynamicForm;
