// ============================================
// Configuration Management Service
// CRUD operations for configurations
// ============================================

import {
  DynamicFormConfig,
  SectionConfig,
  FieldConfig,
  FieldEntry,
} from '../types/dynamicConfig';

const CONFIG_STORAGE_KEY = 'dynamic_form_configs';

/**
 * Creates a new configuration
 */
export function createConfiguration(
  name: string,
  category?: string,
  description?: string
): DynamicFormConfig {
  return {
    id: generateId(),
    name,
    description,
    version: 1,
    category,
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [],
  };
}

/**
 * Creates a new section
 */
export function createSection(
  id: string,
  label: string,
  description?: string
): SectionConfig {
  return {
    id,
    label,
    description,
    enabled: true,
    required: false,
    fields: [],
  };
}

/**
 * Creates a new field
 */
export function createField(key: string, label: string, controlType: string): FieldConfig {
  return {
    key,
    label,
    controlType: controlType as any,
    enabled: true,
    required: false,
  };
}

/**
 * Saves a configuration to storage
 */
export function saveConfiguration(config: DynamicFormConfig): void {
  const configs = loadAllConfigurations();
  const existingIndex = configs.findIndex((c) => c.id === config.id);

  config.updatedAt = new Date().toISOString();

  if (existingIndex >= 0) {
    configs[existingIndex] = config;
  } else {
    configs.push(config);
  }

  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Loads a configuration by ID
 */
export function loadConfiguration(id: string): DynamicFormConfig | null {
  const configs = loadAllConfigurations();
  return configs.find((c) => c.id === id) || null;
}

/**
 * Loads all configurations
 */
export function loadAllConfigurations(): DynamicFormConfig[] {
  try {
    const data = localStorage.getItem(CONFIG_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading configurations:', error);
    return [];
  }
}

/**
 * Loads active configurations
 */
export function loadActiveConfigurations(): DynamicFormConfig[] {
  return loadAllConfigurations().filter((c) => c.active);
}

/**
 * Deletes a configuration
 */
export function deleteConfiguration(id: string): void {
  const configs = loadAllConfigurations().filter((c) => c.id !== id);
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Duplicates a configuration with a new name
 */
export function duplicateConfiguration(
  sourceId: string,
  newName: string,
  newCategory?: string
): DynamicFormConfig | null {
  const source = loadConfiguration(sourceId);
  if (!source) {
    return null;
  }

  const duplicate = createConfiguration(newName, newCategory, source.description);
  duplicate.sections = source.sections.map((section) => ({
    ...section,
    id: `${section.id}_${generateId().substring(0, 8)}`,
  }));

  saveConfiguration(duplicate);
  return duplicate;
}

/**
 * Adds a section to a configuration
 */
export function addSectionToConfiguration(
  configId: string,
  section: SectionConfig
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  config.sections.push(section);
  saveConfiguration(config);
  return config;
}

/**
 * Updates a section in a configuration
 */
export function updateSectionInConfiguration(
  configId: string,
  sectionId: string,
  updates: Partial<SectionConfig>
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  const section = config.sections.find((s) => s.id === sectionId);
  if (!section) {
    return null;
  }

  Object.assign(section, updates);
  saveConfiguration(config);
  return config;
}

/**
 * Removes a section from a configuration
 */
export function removeSectionFromConfiguration(
  configId: string,
  sectionId: string
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  config.sections = config.sections.filter((s) => s.id !== sectionId);
  saveConfiguration(config);
  return config;
}

/**
 * Adds a field to a section
 */
export function addFieldToSection(
  configId: string,
  sectionId: string,
  field: FieldConfig
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  const section = config.sections.find((s) => s.id === sectionId);
  if (!section) {
    return null;
  }

  section.fields.push(field);
  saveConfiguration(config);
  return config;
}

/**
 * Updates a field in a section
 */
export function updateFieldInSection(
  configId: string,
  sectionId: string,
  fieldKey: string,
  updates: Partial<FieldConfig>
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  const section = config.sections.find((s) => s.id === sectionId);
  if (!section) {
    return null;
  }

  const field = section.fields.find((f) => f.key === fieldKey);
  if (!field) {
    return null;
  }

  Object.assign(field, updates);
  saveConfiguration(config);
  return config;
}

/**
 * Removes a field from a section
 */
export function removeFieldFromSection(
  configId: string,
  sectionId: string,
  fieldKey: string
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  const section = config.sections.find((s) => s.id === sectionId);
  if (!section) {
    return null;
  }

  section.fields = section.fields.filter((f) => f.key !== fieldKey);
  saveConfiguration(config);
  return config;
}

/**
 * Reorders sections in a configuration
 */
export function reorderSections(
  configId: string,
  sectionIds: string[]
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  const reorderedSections: SectionConfig[] = [];
  for (const sectionId of sectionIds) {
    const section = config.sections.find((s) => s.id === sectionId);
    if (section) {
      reorderedSections.push(section);
    }
  }

  config.sections = reorderedSections;
  saveConfiguration(config);
  return config;
}

/**
 * Reorders fields in a section
 */
export function reorderFields(
  configId: string,
  sectionId: string,
  fieldKeys: string[]
): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  const section = config.sections.find((s) => s.id === sectionId);
  if (!section) {
    return null;
  }

  const reorderedFields: FieldConfig[] = [];
  for (const fieldKey of fieldKeys) {
    const field = section.fields.find((f) => f.key === fieldKey);
    if (field) {
      reorderedFields.push(field);
    }
  }

  section.fields = reorderedFields;
  saveConfiguration(config);
  return config;
}

/**
 * Toggles active status of a configuration
 */
export function toggleConfigurationActive(configId: string): DynamicFormConfig | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  config.active = !config.active;
  config.version += 1;
  saveConfiguration(config);
  return config;
}

/**
 * Exports a configuration as JSON
 */
export function exportConfiguration(configId: string): string | null {
  const config = loadConfiguration(configId);
  if (!config) {
    return null;
  }

  return JSON.stringify(
    {
      config,
      exportedAt: new Date().toISOString(),
      version: 1,
    },
    null,
    2
  );
}

/**
 * Imports a configuration from JSON
 */
export function importConfiguration(jsonString: string): DynamicFormConfig | null {
  try {
    const parsed = JSON.parse(jsonString);
    const config = parsed.config || parsed;

    // Ensure it has required fields
    if (!config.id || !config.name || !Array.isArray(config.sections)) {
      return null;
    }

    // Give it a new ID to avoid conflicts
    config.id = generateId();
    config.createdAt = new Date().toISOString();
    config.updatedAt = new Date().toISOString();

    saveConfiguration(config);
    return config;
  } catch (error) {
    console.error('Error importing configuration:', error);
    return null;
  }
}

/**
 * Gets all field keys in a section
 */
export function getSectionFieldKeys(configId: string, sectionId: string): string[] {
  const config = loadConfiguration(configId);
  if (!config) {
    return [];
  }

  const section = config.sections.find((s) => s.id === sectionId);
  if (!section) {
    return [];
  }

  return section.fields.map((f) => f.key);
}

/**
 * Searches for configurations by name or category
 */
export function searchConfigurations(query: string): DynamicFormConfig[] {
  const configs = loadAllConfigurations();
  const lowerQuery = query.toLowerCase();

  return configs.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.category?.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Generates a unique ID
 */
function generateId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
