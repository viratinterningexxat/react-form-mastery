import { BaseConfig } from '@/types/RequirementConfig';

const REQUIREMENT_CONFIG_PATH = '/src/config/requirement-config.json';

export async function getRequirementConfig(): Promise<BaseConfig> {
  try {
    const response = await fetch(REQUIREMENT_CONFIG_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    const config: BaseConfig = await response.json();
    // migrate legacy structure when sections array is missing
    if (!(config as any).sections) {
      return migrateLegacyConfig(config);
    }
    return config;
  } catch (error) {
    console.error('Error loading requirement config:', error);
    throw new Error('Unable to load requirement configuration');
  }
}

export function getSectionByName(config: BaseConfig, sectionName: string): unknown {
  return config[sectionName as keyof BaseConfig];
}

export function isSectionEnabled(config: BaseConfig, sectionName: string): boolean {
  const section = getSectionByName(config, sectionName);
  return section?.enabled ?? false;
}

// ----- migration helpers -----

function migrateLegacyConfig(config: BaseConfig): BaseConfig {
  const sectionKeys = [
    'vaccine',
    'booster',
    'titer',
    'repeatTiter',
    'bloodTest',
    'chestXray',
    'symptomScrn',
    'certification',
    'licensure',
    'hisummary',
    'decline',
    'historyOfDisease',
    'otherTiter'
  ] as const;

  const sections: any[] = [];
  sectionKeys.forEach(key => {
    const section = (config as any)[key];
    if (section) {
      sections.push({
        id: key,
        label: section.label || key,
        enabled: section.enabled ?? false,
        required: false,
        fields: Object.entries(section)
          .filter(([k]) => !['enabled', 'label', 'faas', 'expiryDate', 'expiryLogic', 'doses'].includes(k))
          .map(([k, v]) => ({
            key: k,
            label: (v as any)?.label || k,
            type: mapControlType((v as any)?.controlType),
            enabled: (v as any)?.enabled ?? false,
            required: (v as any)?.required ?? false,
            options: (v as any)?.options || undefined,
          })),
        expiryRule: section.expiryDate
          ? { type: 'period', period: (section.expiryDate as any).period }
          : undefined,
        repeatConfig: section.doses
          ? {
              repeatable: true,
              min: 1,
              max: (section.doses as any[]).length,
              labelPattern: 'Dose {index}',
              fields: Object.keys((section.doses as any[])[0] || {}).map(fk => ({
                key: fk,
                label: fk,
                type: 'text',
                enabled: true,
                required: false,
              })),
            }
          : undefined,
      });
    }
  });

  return {
    ...config,
    sections,
  } as BaseConfig;
}

function mapControlType(old?: string): string {
  switch (old) {
    case 'textBox':
    case 'textArea':
      return 'text';
    case 'datePicker':
      return 'date';
    case 'dropDown':
      return 'dropdown';
    case 'radio':
      return 'radio';
    case 'checkBox':
      return 'checkbox';
    case 'fileUpload':
      return 'file';
    case 'number':
      return 'number';
    default:
      return 'text';
  }
}