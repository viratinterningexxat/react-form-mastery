# Enhanced Credential Management System

## Overview

This enhanced credential management system provides a flexible, admin-configurable portal for managing medical credential requirements with dynamic field visibility, conditional logic, and scalable configuration.

## Key Features

### 🚀 Dynamic Dose Configuration
- **Configurable dose ranges**: Set minimum (1) and maximum (10) doses per vaccine
- **Flexible field management**: Add/remove fields per dose with individual enable/disable toggles
- **Dynamic field types**: Support for date, text, number, select, checkbox, radio, and file fields
- **Per-dose field control**: Configure which fields are required/enabled for each dose

### 👁️ Conditional Field Visibility
- **Document type based rules**: Show/hide fields based on document type (TB shows induration, others don't)
- **Clinical vs academic contexts**: Different field visibility for different user contexts
- **Custom visibility rules**: Define complex conditions for field display
- **Real-time updates**: Field visibility updates automatically when document type changes

### 💉 Enhanced Booster Management
- **Separate booster configuration**: Independent settings from primary doses
- **Configurable booster fields**: Custom fields for booster doses
- **Flexible expiry logic**: Booster-specific expiration calculations
- **Toggle-based enabling**: Enable/disable booster requirements as needed

### 📋 Document Type Intelligence
- **Predefined document types**: TB, HepB, Flu, Covid, MMR, Varicella, TDAP
- **Type-specific configurations**: Each document type has unique default settings
- **Special field handling**: Document-type specific fields (e.g., induration for TB)
- **Booster requirement flags**: Automatic booster requirement based on document type

### ⚙️ Admin Portal Features
- **Visual configuration interface**: Intuitive UI for configuring all settings
- **Real-time preview**: See configuration changes before saving
- **Template-based fields**: Reusable field templates for consistency
- **Export/import capabilities**: Save and load configurations

## File Structure

```
src/
├── components/credentials/
│   ├── AdminPortal.tsx           # Main admin configuration interface
│   ├── EnhancedVaccineConfig.tsx # Vaccine dose configuration panel
│   ├── EnhancedBoosterConfig.tsx # Booster configuration panel
│   ├── DocumentTypeSelector.tsx  # Document type management
│   ├── EnhancedVaccineForm.tsx   # Dynamic vaccine form renderer
│   └── [existing components]
├── types/
│   └── enhancedConfig.ts         # Enhanced configuration types
├── utils/
│   └── configMigration.ts        # Legacy config conversion utilities
└── data/
    └── requirement-config.json   # Current configuration (to be enhanced)
```

## Implementation Details

### Type Definitions

The enhanced system uses strongly-typed configurations:

```typescript
interface EnhancedSectionConfig {
  vaccine: {
    doses: DoseConfiguration;
    booster?: BoosterConfiguration;
    expiryLogic: ExpiryCalculationRule;
    // ... other properties
  };
}

interface DoseConfiguration {
  count: {
    min: number;
    max: number;
    default: number;
  };
  fields: DynamicFieldConfig[];
  visibilityRules?: VisibilityRule[];
}

interface DynamicFieldConfig {
  key: string;
  type: 'date' | 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  enabled: boolean;
  required: boolean;
  // ... other properties
}
```

### Key Components

#### AdminPortal.tsx
The main administrative interface that combines all configuration panels:
- Tab-based navigation (Vaccine, Booster, Document Types, Preview)
- Configuration state management
- Save/load functionality
- Real-time preview of changes

#### EnhancedVaccineConfig.tsx
Manages vaccine dose configuration:
- Dose count range settings
- Field configuration editor
- Conditional visibility rules
- Document type integration

#### EnhancedVaccineForm.tsx
Renders dynamic forms based on configuration:
- Real-time field visibility based on rules
- Dynamic field rendering
- Validation handling
- Expiry status indicators

#### DocumentTypeSelector.tsx
Manages document type configurations:
- Predefined document types
- Custom type creation
- Type-specific rule management
- Visibility rule preview

## Usage Examples

### Basic Configuration

```typescript
// Initialize with enhanced configuration
const config = migrateLegacyConfig(legacyConfig);
const documentTypes = createDefaultDocumentTypes();

// Use in admin portal
<AdminPortal 
  initialConfig={config}
  onSave={(newConfig) => {
    // Save configuration
    console.log('Configuration saved:', newConfig);
  }}
/>
```

### Dynamic Form Rendering

```typescript
// In your credential form component
<EnhancedVaccineForm
  requirementId="vaccine-123"
  doses={currentDoses}
  config={vaccineConfig}
  documentType="TB"  // This determines field visibility
  onDosesChange={setDoses}
/>
```

### Field Visibility Logic

```typescript
// Example visibility rule for induration field
const indurationField: DynamicFieldConfig = {
  key: 'induration',
  type: 'text',
  label: 'Induration (mm)',
  enabled: true,
  required: false,
  visibilityRules: [
    {
      field: 'induration',
      showWhen: {
        documentType: 'TB'
      }
    }
  ]
};
```

## Migration from Legacy System

The system includes utilities to migrate existing configurations:

```typescript
import { migrateLegacyConfig, createDefaultDocumentTypes } from '@/utils/configMigration';

// Convert existing configuration
const enhancedConfig = migrateLegacyConfig(legacyConfig);

// Add default document types
const documentTypes = createDefaultDocumentTypes();

// The enhanced system maintains backward compatibility
// while adding new features
```

## Best Practices

### Configuration Management
1. **Version your configurations** - Keep track of configuration changes
2. **Use templates** - Create reusable field templates for consistency
3. **Test visibility rules** - Always test conditional visibility with different document types
4. **Validate configurations** - Ensure configuration integrity before deployment

### Performance Considerations
1. **Lazy loading** - Load configuration panels only when needed
2. **Memoization** - Use React.memo for configuration components
3. **Debounced saves** - Implement debounced saving to prevent excessive writes
4. **Local storage caching** - Cache configurations in local storage for offline support

### Security
1. **Configuration validation** - Validate all configuration inputs
2. **Access controls** - Restrict admin portal access to authorized users
3. **Audit logging** - Log configuration changes for compliance
4. **Data sanitization** - Sanitize user inputs in dynamic forms

## Future Enhancements

### Planned Features
- **Multi-tenant support** - Different configurations per organization
- **Workflow integration** - Advanced approval workflows
- **Analytics dashboard** - Configuration usage analytics
- **API integration** - RESTful API for configuration management
- **Mobile support** - Responsive design for mobile devices

### Advanced Features
- **Custom field validators** - User-defined validation rules
- **Conditional field dependencies** - Field visibility based on other field values
- **Configuration templates** - Save/load entire configuration templates
- **Bulk operations** - Batch update multiple configurations
- **Real-time collaboration** - Multi-user configuration editing

## Contributing

1. **Branch naming**: Use feature/config-enhancement-name format
2. **Type safety**: All new features must use TypeScript
3. **Component structure**: Follow existing component patterns
4. **Documentation**: Update this README with new features
5. **Testing**: Add tests for new functionality

## Support

For issues or questions:
- Check the documentation above
- Review existing configuration examples
- Contact the development team
- Check the migration utilities for compatibility issues

The enhanced system provides a robust foundation for managing complex credential requirements while maintaining flexibility and scalability for future enhancements.