// ============================================
// Configuration Migration Service
// Migrates old RequirementConfig to new DynamicFormConfig
// ============================================

import { DynamicFormConfig, SectionConfig, FieldConfig } from '../types/dynamicConfig';

/**
 * Converts old RequirementConfig format to new DynamicFormConfig
 * This handles the legacy format with hardcoded section keys
 */
export function migrateRequirementConfig(oldConfig: any): DynamicFormConfig {
  const sections: SectionConfig[] = [];

  // Map of old section keys to new section configs
  const sectionMappings: { [key: string]: { label: string; category?: string } } = {
    vaccine: { label: 'Vaccination Details', category: 'Immunizations' },
    booster: { label: 'Revaccination/Booster Details', category: 'Immunizations' },
    titer: { label: 'Titer Details', category: 'Serology' },
    repeatTiter: { label: 'Mumps- Titer Details', category: 'Serology' },
    otherTiter: { label: 'Rubella- Titer Details', category: 'Serology' },
    bloodTest: { label: 'Blood Test Section', category: 'Testing' },
    chestXray: { label: 'Chest X Ray Section', category: 'Imaging' },
    symptomScrn: { label: 'TB Symptom Screening Section', category: 'Screening' },
    certification: { label: 'CPR Certification Details', category: 'Certifications' },
    licensure: { label: 'Additional Licensure Details', category: 'Licenses' },
    hisummary: { label: 'HI Summary Details', category: 'Summary' },
    decline: { label: 'Declination Details', category: 'Declinations' },
    historyOfDisease: { label: 'History of Disease Details', category: 'Medical History' },
    custom: { label: 'Custom Section', category: 'Custom' },
  };

  // Iterate through old config sections
  for (const [sectionKey, sectionData] of Object.entries(oldConfig)) {
    if (typeof sectionData !== 'object' || sectionData === null) continue;
    if (sectionKey.startsWith('_') || ['appName', 'name', 'category', 'createdBy', 'updatedBy', 'tags', 'workflow', 'carryForwardConfig', 'reportingContext', 'guidelines', 'version', 'docType', 'required', 'shortName', 'allowSetupChanges', 'updatedAt', 'createdAt', 'tenantId', 'active'].includes(sectionKey)) {
      continue;
    }

    const sectionMapping = sectionMappings[sectionKey];
    if (!sectionMapping) continue;

    const fields = convertSectionFields(sectionData as any, sectionKey);
    const expiryRule = convertExpiryRule(sectionData as any);

    const section: SectionConfig = {
      id: sectionKey,
      label: sectionMapping.label,
      category: sectionMapping.category,
      enabled: (sectionData as any).enabled ?? true,
      required: false,
      fields,
      expiryRule: expiryRule || undefined,
    };

    sections.push(section);
  }

  return {
    id: oldConfig._id || `config_${Date.now()}`,
    name: oldConfig.name || 'Migrated Configuration',
    description: `Migrated from legacy configuration - ${oldConfig.category || ''}`,
    version: oldConfig.version || 1,
    category: oldConfig.category || 'Base Configuration',
    active: oldConfig.active ?? true,
    createdAt: oldConfig.createdAt || new Date().toISOString(),
    updatedAt: oldConfig.updatedAt || new Date().toISOString(),
    createdBy: oldConfig.createdBy,
    updatedBy: oldConfig.updatedBy,
    sections: sections.sort((a, b) => a.label.localeCompare(b.label)),
  };
}

/**
 * Converts old section format fields to new FieldConfig array
 */
function convertSectionFields(section: any, sectionKey: string): FieldConfig[] {
  const fields: FieldConfig[] = [];

  // Standard fields that appear across multiple sections
  const standardFields = [
    { key: 'resultDate', label: section.resultDate?.label || 'Result Date', controlType: 'datePicker' },
    { key: 'expiryLogic', label: section.expiryLogic?.label || 'Expiry Date', controlType: 'datePicker' },
    { key: 'src', label: section.src?.label || 'Upload Files', controlType: 'fileUpload' },
    { key: 'text', label: section.text?.label || 'Notes', controlType: 'textArea' },
    { key: 'testType', label: section.testType?.label || 'Test Type', controlType: 'radio' },
    { key: 'doseType', label: section.doseType?.label || 'Dose Type', controlType: 'checkBox' },
  ];

  // Add standard fields if they exist in the section
  for (const field of standardFields) {
    if (section[field.key]) {
      const fieldConfig = section[field.key];
      if (fieldConfig.enabled !== false) {
        fields.push({
          key: field.key,
          label: fieldConfig.label || field.label,
          controlType: fieldConfig.controlType || field.controlType,
          enabled: fieldConfig.enabled !== false,
          required: fieldConfig.required || false,
          options: fieldConfig.options,
        });
      }
    }
  }

  // Add section-specific fields
  const specificFieldMappings: { [key: string]: FieldConfig[] } = {
    certification: [
      {
        key: 'courseName',
        label: 'Name of course',
        controlType: 'textBox',
        enabled: true,
        required: false,
      },
      {
        key: 'courseType',
        label: 'Course Type',
        controlType: 'dropDown',
        enabled: true,
        required: false,
        options: ['Online', 'Classroom', 'Hybrid'],
      },
      {
        key: 'documentType',
        label: 'Document Type',
        controlType: 'dropDown',
        enabled: true,
        required: false,
        options: ['Card', 'Certificate'],
      },
      {
        key: 'provider',
        label: 'Provider name',
        controlType: 'textBox',
        enabled: true,
        required: false,
      },
    ],
    licensure: [
      {
        key: 'licenseNumber',
        label: 'License number',
        controlType: 'textBox',
        enabled: true,
        required: false,
      },
      {
        key: 'stateOfLicense',
        label: 'State of license',
        controlType: 'dropDown',
        enabled: true,
        required: false,
        options: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
      },
      {
        key: 'typeOfLicense',
        label: 'Type of license',
        controlType: 'textBox',
        enabled: true,
        required: false,
      },
    ],
    hisummary: [
      {
        key: 'applicableDocuments',
        label: 'Document types',
        controlType: 'checkBox',
        enabled: true,
        required: false,
        options: ['MMR', 'Tuberculosis', 'Varicella', 'Hepatitis A', 'Hepatitis B', 'Hepatitis C', 'TDAP', 'Flu (Influenza)', 'Polio', 'Meningococcal', 'Covid-19'],
      },
    ],
  };

  if (specificFieldMappings[sectionKey]) {
    fields.push(...specificFieldMappings[sectionKey]);
  }

  return fields;
}

/**
 * Converts old expiryDate format to new ExpiryRule
 */
function convertExpiryRule(section: any): any | null {
  const expiryDate = section.expiryDate;

  if (!expiryDate) {
    return null;
  }

  // Fixed date expiry
  if (expiryDate['fixed-date']) {
    const fixedDate = expiryDate['fixed-date'];
    return {
      type: 'fixedDate',
      fixedDate: {
        day: fixedDate.day || 1,
        month: fixedDate.month || 1,
        year: fixedDate.year || new Date().getFullYear(),
      },
      userCanOverride: fixedDate['by-user'] || false,
    };
  }

  // Period-based expiry
  if (expiryDate.period) {
    return {
      type: 'period',
      period: expiryDate.period,
    };
  }

  return null;
}

/**
 * Batch migrate multiple old configurations
 */
export function migrateMultipleConfigs(oldConfigs: any[]): DynamicFormConfig[] {
  return oldConfigs.map((config) => migrateRequirementConfig(config));
}
