import { RequirementConfigList } from '@/types/RequirementConfig';

const REQUIREMENT_CONFIG_PATH = '/src/config/requirement-config.json';

export async function getRequirementConfig(): Promise<RequirementConfigList> {
  try {
    const response = await fetch(REQUIREMENT_CONFIG_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    const config: RequirementConfigList = await response.json();
    return config;
  } catch (error) {
    console.error('Error loading requirement config:', error);
    throw new Error('Unable to load requirement configuration');
  }
}

export function getRequirementById(config: RequirementConfigList, id: string): RequirementConfig | undefined {
  return config.find(req => req.requirementId === id);
}