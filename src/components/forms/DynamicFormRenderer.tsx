// ============================================
// Dynamic Form Renderer
// Renders forms based on configuration
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useForm } from 'react-hook-form';
import {
  DynamicFormConfig,
  SectionConfig,
  FieldConfig,
  FieldEntry,
  CredentialSubmission,
} from '../../types/dynamicConfig';
import {
  evaluateFieldVisibility,
  getVisibleFields,
  calculateExpiryDate,
  validateFormData,
} from '../../services/ruleEngine';
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
  entriesToFormData,
} from '../../services/credentialSubmissionService';

interface DynamicFormRendererProps {
  config: DynamicFormConfig;
  employeeId: string;
  submissionId?: string;
  onSubmit?: (submission: CredentialSubmission) => void;
  onCancel?: () => void;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  config,
  employeeId,
  submissionId,
  onSubmit,
  onCancel,
}) => {
  const { handleSubmit, register, watch, formState: { errors } } = useForm();
  const [submission, setSubmission] = useState<CredentialSubmission | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionErrors, setSectionErrors] = useState<{ [key: string]: string[] }>({});
  const formData = watch();

  // Initialize submission
  useEffect(() => {
    if (submissionId) {
      // Load existing submission
      // In a real app, load from backend
      const newSubmission = createCredentialSubmission(employeeId, config.id);
      setSubmission(newSubmission);
    } else {
      const newSubmission = createCredentialSubmission(employeeId, config.id);
      setSubmission(newSubmission);
    }
  }, [employeeId, config.id, submissionId]);

  const currentSection = config.sections[currentSectionIndex];

  const handleFieldChange = useCallback(
    (fieldKey: string, value: any) => {
      if (!submission) return;

      const updatedSubmission = { ...submission };
      let sectionSubmission = getOrCreateSectionSubmission(
        updatedSubmission,
        currentSection.id
      );

      sectionSubmission = updateFieldEntry(sectionSubmission, fieldKey, value);

      // Update the section in submission
      updatedSubmission.sections = updatedSubmission.sections.map((s) =>
        s.sectionId === currentSection.id ? sectionSubmission : s
      );

      setSubmission(updatedSubmission);
    },
    [submission, currentSection]
  );

  const handleAddRepeatableEntry = useCallback(() => {
    if (!submission) return;

    const updatedSubmission = { ...submission };
    let sectionSubmission = getOrCreateSectionSubmission(
      updatedSubmission,
      currentSection.id
    );

    sectionSubmission = addRepeatableEntry(sectionSubmission, {});

    updatedSubmission.sections = updatedSubmission.sections.map((s) =>
      s.sectionId === currentSection.id ? sectionSubmission : s
    );

    setSubmission(updatedSubmission);
  }, [submission, currentSection]);

  const handleRemoveRepeatableEntry = useCallback(
    (index: number) => {
      if (!submission) return;

      const updatedSubmission = { ...submission };
      let sectionSubmission = getOrCreateSectionSubmission(
        updatedSubmission,
        currentSection.id
      );

      sectionSubmission = removeRepeatableEntry(sectionSubmission, index);

      updatedSubmission.sections = updatedSubmission.sections.map((s) =>
        s.sectionId === currentSection.id ? sectionSubmission : s
      );

      setSubmission(updatedSubmission);
    },
    [submission, currentSection]
  );

  const handleNextSection = () => {
    if (!submission || !currentSection) return;

    // Validate current section
    const sectionSubmission = submission.sections.find(
      (s) => s.sectionId === currentSection.id
    );

    if (!sectionSubmission) return;

    const formDataObj = entriesToFormData(sectionSubmission.fields);
    const validation = validateFormData(currentSection, formDataObj);

    if (!validation.valid) {
      setSectionErrors({
        ...sectionErrors,
        [currentSection.id]: validation.errors.map((e) => e.message),
      });
      return;
    }

    // Calculate expiry if applicable
    if (currentSection.expiryRule) {
      const expiryDate = calculateExpiryDate(currentSection.expiryRule, formDataObj);
      updateSectionExpiryDate(sectionSubmission, expiryDate);
    }

    // Move to next section
    if (currentSectionIndex < config.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setSectionErrors({});
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setSectionErrors({});
    }
  };

  const handleSubmitForm = () => {
    if (!submission) return;

    // Validate all sections
    const allErrors: { [key: string]: string[] } = {};
    let isValid = true;

    for (const section of config.sections) {
      const sectionSubmission = submission.sections.find(
        (s) => s.sectionId === section.id
      );

      if (!sectionSubmission) continue;

      const formDataObj = entriesToFormData(sectionSubmission.fields);
      const validation = validateFormData(section, formDataObj);

      if (!validation.valid) {
        allErrors[section.id] = validation.errors.map((e) => e.message);
        isValid = false;
      }
    }

    if (!isValid) {
      setSectionErrors(allErrors);
      return;
    }

    // Mark submission as complete
    submission.status = 'submitted';
    submission.completedAt = new Date().toISOString();

    saveCredentialSubmission(submission);
    onSubmit?.(submission);
  };

  if (!submission || !currentSection) {
    return <div>Loading form...</div>;
  }

  const visibleFields = getVisibleFields(currentSection, formData);
  const sectionErrors_current = sectionErrors[currentSection.id] || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{currentSection.label}</h2>
            <p className="text-sm text-gray-600">
              Section {currentSectionIndex + 1} of {config.sections.length}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentSectionIndex + 1) / config.sections.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentSection.label}</CardTitle>
            {currentSection.description && (
              <p className="text-sm text-gray-600 mt-2">{currentSection.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {sectionErrors_current.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-800 font-medium">Please fix the following errors:</p>
                <ul className="mt-2 space-y-1 text-red-700 text-sm">
                  {sectionErrors_current.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render Fields */}
            <div className="space-y-4">
              {visibleFields.map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={formData[field.key] || ''}
                  onChange={(value) => handleFieldChange(field.key, value)}
                />
              ))}
            </div>

            {/* Repeatable Section */}
            {currentSection.repeatable && (
              <RepeatableSectionRenderer
                section={currentSection}
                submission={submission}
                currentSection={currentSection}
                onAdd={handleAddRepeatableEntry}
                onRemove={handleRemoveRepeatableEntry}
                onFieldChange={(index, fieldKey, value) => {
                  const sectionSubmission = submission.sections.find(
                    (s) => s.sectionId === currentSection.id
                  );
                  if (sectionSubmission) {
                    updateRepeatableEntry(sectionSubmission, index, {
                      [fieldKey]: value,
                    });
                  }
                }}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePreviousSection}
                disabled={currentSectionIndex === 0}
              >
                Previous
              </Button>

              {currentSectionIndex === config.sections.length - 1 ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitForm}>Submit</Button>
                </div>
              ) : (
                <Button onClick={handleNextSection}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Individual field renderer
 */
interface FieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange }) => {
  switch (field.controlType) {
    case 'textBox':
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Input
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      );

    case 'textArea':
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      );

    case 'datePicker':
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      );

    case 'dropDown':
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select an option</option>
            {field.options?.map((opt) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const val = typeof opt === 'string' ? opt : opt.value;
              return (
                <option key={val} value={val}>
                  {label}
                </option>
              );
            })}
          </select>
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      );

    case 'radio':
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const val = typeof opt === 'string' ? opt : opt.value;
              return (
                <label key={val} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={field.key}
                    value={val}
                    checked={value === val}
                    onChange={(e) => onChange(e.target.value)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
          </div>
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-2">{field.helpText}</p>
          )}
        </div>
      );

    case 'checkBox':
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const val = typeof opt === 'string' ? opt : opt.value;
              const isChecked = Array.isArray(value) && value.includes(val);
              return (
                <label key={val} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValue = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onChange([...newValue, val]);
                      } else {
                        onChange(newValue.filter((v) => v !== val));
                      }
                    }}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
          </div>
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-2">{field.helpText}</p>
          )}
        </div>
      );

    default:
      return null;
  }
};

/**
 * Repeatable section renderer
 */
interface RepeatableSectionRendererProps {
  section: SectionConfig;
  submission: CredentialSubmission;
  currentSection: SectionConfig;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onFieldChange: (index: number, fieldKey: string, value: any) => void;
}

const RepeatableSectionRenderer: React.FC<RepeatableSectionRendererProps> = ({
  section,
  submission,
  onAdd,
  onRemove,
  onFieldChange,
}) => {
  const sectionSubmission = submission.sections.find((s) => s.sectionId === section.id);
  const entries = sectionSubmission?.repeatableEntries || [];

  if (!section.repeatable) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          {section.repeatable.labelPattern || 'Entry'} ({entries.length}/
          {section.repeatable.max})
        </h3>
        <Button
          size="sm"
          onClick={onAdd}
          disabled={entries.length >= section.repeatable.max}
        >
          + Add Entry
        </Button>
      </div>

      {entries.map((entry, index) => (
        <Card key={index} className="bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">
                {section.repeatable?.labelPattern?.replace('{index}', String(index + 1)) ||
                  `Entry ${index + 1}`}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(index)}
              >
                Remove
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.repeatable?.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={
                  entry.entries.find((e) => e.key === field.key)?.value || ''
                }
                onChange={(value) => onFieldChange(index, field.key, value)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DynamicFormRenderer;
