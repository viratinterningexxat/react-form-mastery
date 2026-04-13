// ============================================
// Configuration Migration Utility
// Converts existing config to enhanced format
// ============================================

import { 
  EnhancedSectionConfig, 
  DoseConfiguration, 
  BoosterConfiguration,
  DocumentTypeConfig,
  DynamicFieldConfig
} from '@/types/enhancedConfig';

interface LegacyConfig {
  vaccine: {
    doses: Array<{
      date: any;
      manufacturer: any;
      lotNumber: any;
      induration: any;
    }>;
    enabled: boolean;
    label: string;
    expiryDate: any;
    expiryLogic: any;
    src: any;
    text: any;
  };
  booster: {
    enabled: boolean;
    doses: any;
    expiryDate: any;
    expiryLogic: any;
    src: any;
    text: any;
  };
  // ... other legacy config properties
}

export function migrateLegacyConfig(legacyConfig: LegacyConfig): EnhancedSectionConfig {
  // Convert vaccine configuration
  const vaccineConfig: DoseConfiguration = {
    count: {
      min: 1,
      max: 10,
      default: Math.min(4, legacyConfig.vaccine.doses.length || 3)
    },
    fields: [
      {
        key: 'date',
        type: 'date',
        label: 'Administration Date',
        enabled: legacyConfig.vaccine.doses[0]?.date?.enabled ?? true,
        required: legacyConfig.vaccine.doses[0]?.date?.required ?? false
      },
      {
        key: 'manufacturer',
        type: 'select',
        label: 'Manufacturer',
        enabled: legacyConfig.vaccine.doses[0]?.manufacturer?.enabled ?? true,
        required: legacyConfig.vaccine.doses[0]?.manufacturer?.required ?? false,
        options: [
          'Pfizer-BioNTech',
          'Moderna',
          'Johnson & Johnson',
          'AstraZeneca',
          'Novavax',
          'Merck',
          'GlaxoSmithKline (GSK)',
          'Sanofi Pasteur',
          'Seqirus',
          'CSL Limited',
          'Other'
        ]
      },
      {
        key: 'lotNumber',
        type: 'text',
        label: 'Lot Number',
        enabled: legacyConfig.vaccine.doses[0]?.lotNumber?.enabled ?? true,
        required: legacyConfig.vaccine.doses[0]?.lotNumber?.required ?? false,
        placeholder: 'e.g., EL9262'
      },
      {
        key: 'induration',
        type: 'text',
        label: 'Induration (mm)',
        enabled: legacyConfig.vaccine.doses.some(d => d.induration?.enabled) ?? false,
        required: legacyConfig.vaccine.doses.some(d => d.induration?.required) ?? false,
        placeholder: 'e.g., 15mm'
      }
    ]
  };

  // Convert booster configuration
  const boosterConfig: BoosterConfiguration = {
    enabled: legacyConfig.booster?.enabled ?? false,
    doseCount: 1,
    fields: [
      {
        key: 'boosterDate',
        type: 'date',
        label: 'Booster Date',
        enabled: true,
        required: true
      },
      {
        key: 'boosterManufacturer',
        type: 'select',
        label: 'Booster Manufacturer',
        enabled: true,
        required: false,
        options: [
          'Pfizer-BioNTech',
          'Moderna',
          'Johnson & Johnson',
          'Other'
        ]
      },
      {
        key: 'boosterLot',
        type: 'text',
        label: 'Booster Lot Number',
        enabled: true,
        required: false,
        placeholder: 'e.g., BOOST123'
      }
    ],
    expiryLogic: {
      basedOn: 'boosterDate',
      period: { years: 1 }
    }
  };

  // Create enhanced section configuration
  const enhancedConfig: EnhancedSectionConfig = {
    enabled: legacyConfig.vaccine.enabled,
    label: legacyConfig.vaccine.label,
    required: true,
    category: 'Medical Requirements',
    tags: {
      ouCode: 'DEFAULT',
      userType: 'All'
    },
    workflow: {
      auto: true,
      on: {
        'PendingReview': [null, 'Approved']
      }
    },
    carryForwardConfig: {
      disabled: true,
      type: 'UntilExpiration',
      days: 0
    },
    vaccine: {
      enabled: legacyConfig.vaccine.enabled,
      label: legacyConfig.vaccine.label,
      doses: vaccineConfig,
      booster: boosterConfig,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { 
          years: legacyConfig.vaccine.expiryDate?.period?.years || 1 
        }
      },
      upload: {
        enabled: legacyConfig.vaccine.src?.enabled ?? true,
        required: legacyConfig.vaccine.src?.required ?? false,
        label: legacyConfig.vaccine.src?.label || 'Upload Documents'
      },
      notes: {
        enabled: legacyConfig.vaccine.text?.enabled ?? true,
        required: legacyConfig.vaccine.text?.required ?? false,
        label: legacyConfig.vaccine.text?.label || 'Notes'
      }
    }
  };

  return enhancedConfig;
}

export function createDefaultDocumentTypes(): DocumentTypeConfig[] {
  return [
    {
      type: 'TB',
      name: 'Tuberculosis',
      defaultDoseCount: 2,
      showInduration: true,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 1 }
      },
      boosterRequired: true,
      specialFields: ['induration']
    },
    {
      type: 'HepB',
      name: 'Hepatitis B',
      defaultDoseCount: 3,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 10 }
      },
      boosterRequired: false,
      specialFields: []
    },
    {
      type: 'Flu',
      name: 'Influenza',
      defaultDoseCount: 1,
      showInduration: false,
      expiryLogic: {
        basedOn: 'resultDate',
        period: { years: 1 }
      },
      boosterRequired: false,
      specialFields: []
    },
    {
      type: 'Covid',
      name: 'COVID-19',
      defaultDoseCount: 2,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 1 }
      },
      boosterRequired: true,
      specialFields: []
    },
    {
      type: 'MMR',
      name: 'Measles, Mumps, Rubella',
      defaultDoseCount: 2,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 10 }
      },
      boosterRequired: false,
      specialFields: []
    },
    {
      type: 'Varicella',
      name: 'Chickenpox',
      defaultDoseCount: 2,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 10 }
      },
      boosterRequired: false,
      specialFields: []
    },
    {
      type: 'TDAP',
      name: 'Tetanus/Diphtheria/Pertussis',
      defaultDoseCount: 1,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 10 }
      },
      boosterRequired: true,
      specialFields: []
    }
  ];
}

export function createDefaultFieldTemplates(): DynamicFieldConfig[] {
  return [
    {
      key: 'date',
      type: 'date',
      label: 'Administration Date',
      enabled: true,
      required: true
    },
    {
      key: 'manufacturer',
      type: 'select',
      label: 'Manufacturer',
      enabled: true,
      required: true,
      options: [
        'Pfizer-BioNTech',
        'Moderna',
        'Johnson & Johnson',
        'AstraZeneca',
        'Novavax',
        'Other'
      ]
    },
    {
      key: 'lotNumber',
      type: 'text',
      label: 'Lot Number',
      enabled: true,
      required: false,
      placeholder: 'e.g., EL9262'
    },
    {
      key: 'induration',
      type: 'text',
      label: 'Induration (mm)',
      enabled: false,
      required: false,
      placeholder: 'e.g., 15mm'
    },
    {
      key: 'notes',
      type: 'text',
      label: 'Notes',
      enabled: true,
      required: false,
      placeholder: 'Additional notes...'
    }
  ];
}

// Usage example:
// const enhancedConfig = migrateLegacyConfig(requirementConfig);
// const documentTypes = createDefaultDocumentTypes();
// const fieldTemplates = createDefaultFieldTemplates();