// ============================================
// Credential Submission Service
// Manages submission storage and retrieval
// ============================================

import {
  CredentialSubmission,
  SectionSubmission,
  FieldEntry,
  RepeatableEntry,
} from '../types/dynamicConfig';

const STORAGE_KEY = 'credential_submissions';

/**
 * Creates a new credential submission
 */
export function createCredentialSubmission(
  employeeId: string,
  configId: string
): CredentialSubmission {
  return {
    id: generateId(),
    employeeId,
    configId,
    sections: [],
    status: 'in_progress',
  };
}

/**
 * Creates a section submission
 */
export function createSectionSubmission(sectionId: string): SectionSubmission {
  return {
    sectionId,
    fields: [],
    status: 'pending_upload',
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Adds or updates a field entry in a section
 */
export function updateFieldEntry(
  submission: SectionSubmission,
  key: string,
  value: string | string[] | number | null
): SectionSubmission {
  const existingEntry = submission.fields.find((f) => f.key === key);

  if (existingEntry) {
    existingEntry.value = value;
  } else {
    submission.fields.push({
      key,
      value,
    });
  }

  return submission;
}

/**
 * Adds a repeatable entry (for doses, multiple items)
 */
export function addRepeatableEntry(
  submission: SectionSubmission,
  fields: Record<string, any>
): SectionSubmission {
  if (!submission.repeatableEntries) {
    submission.repeatableEntries = [];
  }

  const entries: FieldEntry[] = Object.entries(fields).map(([key, value]) => ({
    key,
    value: value as string | string[] | number,
  }));

  submission.repeatableEntries.push({
    index: submission.repeatableEntries.length,
    entries,
  });

  return submission;
}

/**
 * Updates a repeatable entry
 */
export function updateRepeatableEntry(
  submission: SectionSubmission,
  index: number,
  fields: Record<string, any>
): SectionSubmission {
  if (!submission.repeatableEntries) {
    return submission;
  }

  const entry = submission.repeatableEntries.find((e) => e.index === index);
  if (!entry) {
    return submission;
  }

  for (const [key, value] of Object.entries(fields)) {
    const fieldEntry = entry.entries.find((f) => f.key === key);
    if (fieldEntry) {
      fieldEntry.value = value as string | string[] | number;
    } else {
      entry.entries.push({ key, value: value as string | string[] | number });
    }
  }

  return submission;
}

/**
 * Removes a repeatable entry by index
 */
export function removeRepeatableEntry(
  submission: SectionSubmission,
  index: number
): SectionSubmission {
  if (!submission.repeatableEntries) {
    return submission;
  }

  submission.repeatableEntries = submission.repeatableEntries.filter((e) => e.index !== index);
  return submission;
}

/**
 * Gets or creates a section submission
 */
export function getOrCreateSectionSubmission(
  submission: CredentialSubmission,
  sectionId: string
): SectionSubmission {
  let sectionSubmission = submission.sections.find((s) => s.sectionId === sectionId);

  if (!sectionSubmission) {
    sectionSubmission = createSectionSubmission(sectionId);
    submission.sections.push(sectionSubmission);
  }

  return sectionSubmission;
}

/**
 * Updates the expiry date for a section
 */
export function updateSectionExpiryDate(
  submission: SectionSubmission,
  expiryDate: string | undefined
): SectionSubmission {
  submission.expiryDate = expiryDate;
  return submission;
}

/**
 * Updates section status
 */
export function updateSectionStatus(
  submission: SectionSubmission,
  status: SectionSubmission['status']
): SectionSubmission {
  submission.status = status;
  return submission;
}

/**
 * Saves a credential submission to localStorage
 */
export function saveCredentialSubmission(submission: CredentialSubmission): void {
  const submissions = loadAllSubmissions();
  const existingIndex = submissions.findIndex((s) => s.id === submission.id);

  if (existingIndex >= 0) {
    submissions[existingIndex] = submission;
  } else {
    submissions.push(submission);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

/**
 * Loads a credential submission by ID
 */
export function loadCredentialSubmission(id: string): CredentialSubmission | null {
  const submissions = loadAllSubmissions();
  return submissions.find((s) => s.id === id) || null;
}

/**
 * Loads all submissions for an employee
 */
export function loadEmployeeSubmissions(employeeId: string): CredentialSubmission[] {
  const submissions = loadAllSubmissions();
  return submissions.filter((s) => s.employeeId === employeeId);
}

/**
 * Loads all submissions
 */
export function loadAllSubmissions(): CredentialSubmission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading submissions:', error);
    return [];
  }
}

/**
 * Deletes a credential submission
 */
export function deleteCredentialSubmission(id: string): void {
  const submissions = loadAllSubmissions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

/**
 * Gets a section submission from a credential submission
 */
export function getSectionSubmission(
  submission: CredentialSubmission,
  sectionId: string
): SectionSubmission | undefined {
  return submission.sections.find((s) => s.sectionId === sectionId);
}

/**
 * Converts field entries to form data object
 */
export function entriesToFormData(entries: FieldEntry[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const entry of entries) {
    result[entry.key] = entry.value;
  }
  return result;
}

/**
 * Converts form data object to field entries
 */
export function formDataToEntries(formData: Record<string, any>): FieldEntry[] {
  return Object.entries(formData).map(([key, value]) => ({
    key,
    value: value as string | string[] | number,
  }));
}

/**
 * Generates a unique ID
 */
function generateId(): string {
  return `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
