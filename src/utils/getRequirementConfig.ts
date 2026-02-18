import { BaseConfig } from '@/types/RequirementConfig';

const REQUIREMENT_CONFIG_PATH = '/src/config/requirement-config.json';

export async function getRequirementConfig(): Promise<BaseConfig> {
  try {
    const response = await fetch(REQUIREMENT_CONFIG_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    const config: BaseConfig = await response.json();
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