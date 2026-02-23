# Dynamic Credential Configuration System - Complete Guide

## Overview

This document describes the implementation of a flexible, data-driven credential management system that replaces hardcoded form structures with dynamic, configurable form definitions.

## Architecture

The system is organized into 4 main layers:

### 1. **Configuration Layer** (Admin Portal)
Allows admins to create and manage credential form configurations without writing code.

- **Location**: `src/components/admin/`
- **Main Component**: `ConfigurationPortal.tsx`
- **Features**:
  - Create/edit/delete configurations
  - Manage sections and fields
  - Configure validation, visibility, and expiry rules
  - Import/export configurations

### 2. **Rule Engine Layer** (Business Logic)
Evaluates visibility, validation, and expiry rules at runtime.

- **Location**: `src/services/ruleEngine.ts`
- **Key Functions**:
  - `evaluateFieldVisibility()` - Determine if a field should be shown
  - `validateFormData()` - Validate section data against rules
  - `calculateExpiryDate()` - Calculate credential expiry dates
  - `validateCredentialSubmission()` - Full form validation

### 3. **Submission Layer** (Data Storage)
Manages credential submission data storage and retrieval.

- **Location**: `src/services/credentialSubmissionService.ts`
- **Features**:
  - Create and manage submissions
  - Handle repeatable fields/doses
  - LocalStorage persistence
  - Field and section state management

### 4. **Rendering Layer** (Frontend Forms)
Dynamically renders forms based on configuration.

- **Location**: `src/components/forms/DynamicFormRenderer.tsx`
- **Features**:
  - Section-based navigation
  - Progressive form revelation
  - Real-time validation
  - Repeatable field groups

## Type System

### Core Types

#### `DynamicFormConfig`
```typescript
{
  id: string;
  name: string;
  description?: string;
  version: number;
  category?: string;
  active: boolean;
  sections: SectionConfig[];
  createdAt: string;
  updatedAt: string;
}
```

#### `SectionConfig`
```typescript
{
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  required: boolean;
  fields: FieldConfig[];
  repeatable?: RepeatConfig;
  expiryRule?: ExpiryRule;
  contextOverrides?: ContextOverride[];
}
```

#### `FieldConfig`
```typescript
{
  key: string;
  label: string;
  controlType: ControlType;
  enabled: boolean;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[] | { label: string; value: string }[];
  validation?: ValidationRule[];
  visibilityRules?: VisibilityRule[];
}
```

### Validation Rules

```typescript
interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'date';
  message: string;
  value?: string | number; // For minLength, maxLength, pattern
}
```

**Example**:
```typescript
validation: [
  {
    type: 'required',
    message: 'This field is required'
  },
  {
    type: 'minLength',
    message: 'Must be at least 5 characters',
    value: 5
  }
]
```

### Visibility Rules

```typescript
interface VisibilityRule {
  operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes' | 'greaterThan' | 'lessThan';
  dependsOn: string; // Field key to depend on
  value: string | string[] | number;
}
```

**Example**: Show "Induration" field only when "documentType" equals "TB"
```typescript
visibilityRules: [
  {
    operator: 'equals',
    dependsOn: 'documentType',
    value: 'TB'
  }
]
```

### Expiry Rules

```typescript
interface ExpiryRule {
  type: 'fixedDate' | 'period' | 'basedOnField' | 'never';
  baseField?: string;
  period?: { years?: number; months?: number; days?: number };
  fixedDate?: { day: number; month: number; year: number };
  userCanOverride?: boolean;
}
```

**Examples**:

1. **Period-based** (Vaccine valid for 10 years):
```typescript
expiryRule: {
  type: 'period',
  period: { years: 10 }
}
```

2. **Based on field** (Expires 3 years after result date):
```typescript
expiryRule: {
  type: 'basedOnField',
  baseField: 'resultDate',
  period: { years: 3 }
}
```

3. **Fixed date** (All expire on Dec 31, 2025):
```typescript
expiryRule: {
  type: 'fixedDate',
  fixedDate: { day: 31, month: 12, year: 2025 }
}
```

### Repeatable Groups

```typescript
interface RepeatConfig {
  repeatable: true;
  min: number;
  max: number;
  labelPattern?: string; // "Dose {index}"
  fields: FieldConfig[];
}
```

**Example**: Vaccine with up to 6 doses
```typescript
repeatable: {
  repeatable: true,
  min: 1,
  max: 6,
  labelPattern: 'Dose {index}',
  fields: [
    {
      key: 'date',
      label: 'Dose Date',
      controlType: 'datePicker',
      required: true,
      enabled: true
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      controlType: 'textBox',
      required: false,
      enabled: true
    }
  ]
}
```

## How to Use

### Creating a Configuration

1. Open the Configuration Portal
2. Click "New Config"
3. Enter configuration name
4. Add sections
5. For each section, add fields
6. Configure validation, visibility, and expiry rules
7. Save and activate

### Example: Creating a Vaccination Configuration

```typescript
// Step 1: Create config
const config = createConfiguration('Vaccination Requirements');

// Step 2: Create section
const vaccineSection = createSection('vaccine', 'Vaccination Details');
vaccineSection.required = true;
vaccineSection.expiryRule = {
  type: 'period',
  period: { years: 10 }
};

// Step 3: Add fields
const dateField = createField('doseDate', 'Dose Date', 'datePicker');
dateField.required = true;

const manufacturerField = createField('manufacturer', 'Manufacturer', 'textBox');
manufacturerField.required = false;

vaccineSection.fields.push(dateField, manufacturerField);
config.sections.push(vaccineSection);

// Step 4: Save
saveConfiguration(config);
```

### Using the Form Renderer

```typescript
import { DynamicFormRenderer } from '../components/forms/DynamicFormRenderer';

export const MyPage = () => {
  const [config] = useState<DynamicFormConfig>(/* your config */);
  
  return (
    <DynamicFormRenderer
      config={config}
      employeeId="emp_123"
      onSubmit={(submission) => {
        console.log('Form submitted:', submission);
        // Send to backend
      }}
    />
  );
};
```

### Using the Custom Hook

```typescript
import { useDynamicForm } from '../hooks/useDynamicForm';

export const CustomFormComponent = ({ config, employeeId }) => {
  const {
    submission,
    currentSection,
    visibleFields,
    errors,
    updateField,
    nextSection,
    previousSection,
    submitForm,
    progress,
  } = useDynamicForm({
    config,
    employeeId,
  });

  return (
    <div>
      <div style={{ width: `${progress}%` }} className="progress-bar" />
      
      {currentSection && (
        <div>
          <h2>{currentSection.label}</h2>
          {visibleFields.map(field => (
            <input
              key={field.key}
              value={submission?.sections[0]?.fields?.find(f => f.key === field.key)?.value || ''}
              onChange={(e) => updateField(field.key, e.target.value)}
            />
          ))}
        </div>
      )}
      
      <button onClick={previousSection}>Previous</button>
      <button onClick={nextSection}>Next</button>
      <button onClick={submitForm}>Submit</button>
    </div>
  );
};
```

## Control Types

- **textBox**: Single-line text input
- **textArea**: Multi-line text input
- **datePicker**: Date input
- **dropDown**: Dropdown select
- **radio**: Radio button group
- **checkBox**: Checkbox group (multiple selection)
- **fileUpload**: File upload input
- **number**: Numeric input
- **email**: Email input

## Rule Evaluation

### Visibility Rules
Evaluated for each field. If a field has visibility rules, it's only shown if ALL rules pass.

```typescript
// Field only visible when documentType = "TB" AND testType = "Positive"
visibilityRules: [
  { operator: 'equals', dependsOn: 'documentType', value: 'TB' },
  { operator: 'equals', dependsOn: 'testType', value: 'Positive' }
]
```

### Validation Rules
Applied to field values during submission. Multiple validation rules can be applied to a single field.

### Expiry Rules
Applied at submission time to calculate credential expiry dates. The calculated date is stored with the submission.

## Data Flow

```
Admin Portal
    ↓
ConfigurationService (CRUD)
    ↓
DynamicFormConfig (stored in localStorage)
    ↓
DynamicFormRenderer / useDynamicForm
    ↓
RuleEngine (visibility, validation, expiry)
    ↓
CredentialSubmissionService
    ↓
CredentialSubmission (stored in localStorage)
```

## Services Reference

### `configurationService.ts`
**CRUD operations for configurations**

```typescript
// Create
const config = createConfiguration('Name');
saveConfiguration(config);

// Read
const config = loadConfiguration(configId);
const allConfigs = loadAllConfigurations();

// Update
const updated = updateSectionInConfiguration(configId, sectionId, updates);

// Delete
deleteConfiguration(configId);

// Import/Export
const json = exportConfiguration(configId);
const imported = importConfiguration(jsonString);
```

### `credentialSubmissionService.ts`
**Manage form submissions**

```typescript
// Create
const submission = createCredentialSubmission(employeeId, configId);
saveCredentialSubmission(submission);

// Update fields
const updated = updateFieldEntry(section, key, value);

// Repeatable entries
addRepeatableEntry(section, { field1: 'value1' });
removeRepeatableEntry(section, index);

// Load
const submission = loadCredentialSubmission(id);
const employeeSubmissions = loadEmployeeSubmissions(employeeId);
```

### `ruleEngine.ts`
**Business logic evaluation**

```typescript
// Visibility
const isVisible = evaluateFieldVisibility(field, formData);
const visible = getVisibleFields(section, formData);

// Validation
const result = validateFormData(section, formData);
const result = validateCredentialSubmission(config, submission);

// Expiry
const expiryDate = calculateExpiryDate(expiryRule, formData);

// Context override
const overridden = applyContextOverride(section, 'clinical');
const contextConfig = getContextualConfig(config, 'academic');
```

## Migration from Legacy Config

Use `configMigration.ts` to convert old RequirementConfig to new DynamicFormConfig:

```typescript
import { migrateRequirementConfig } from '../services/configMigration';

const oldConfig = require('../config/requirement-config.json');
const newConfig = migrateRequirementConfig(oldConfig);
saveConfiguration(newConfig);
```

## Testing

Navigate to `/admin-demo` to access the demo page with:
- Admin portal for creating configurations
- Form preview to test configurations
- Submission data viewing

## Best Practices

1. **Field Keys**: Use lowercase with underscores (e.g., `dose_date`, `test_type`)
2. **Labels**: Use clear, user-friendly labels
3. **Validation**: Always mark required fields with `required: true`
4. **Visibility**: Test visibility rules thoroughly with different scenarios
5. **Expiry**: Consider the business logic carefully when setting expiry rules
6. **Organization**: Group related fields into logical sections

## Extensibility

The system is designed to be extended:

- **Custom Validation**: Add custom validation rules in `ruleEngine.ts`
- **Custom Control Types**: Add new control types in `FieldRenderer` component
- **Custom Visibility Logic**: Extend `evaluateRule()` function
- **Custom Expiry Logic**: Add to `calculateExpiryDate()` function
- **Context-Specific Overrides**: Use `contextOverrides` in sections

## Troubleshooting

### Form not rendering
- Check that configuration is active (`config.active === true`)
- Verify sections are enabled (`section.enabled === true`)
- Check browser console for errors

### Fields not showing
- Check visibility rules for the field
- Verify form data values match visibility rule conditions
- Check that field is enabled (`field.enabled === true`)

### Validation not working
- Ensure validation rules are set on fields
- Check that form data matches field requirements
- Verify validation rule configuration

### Expiry not calculated
- Check that expiryRule is configured on section
- Verify baseField matches actual field keys
- Test with correct field values

## Future Enhancements

- Backend API integration
- Database persistence
- User role-based configuration access
- Configuration versioning and rollback
- Audit logging for configuration changes
- Advanced conditional logic (OR, nested conditions)
- Custom formula-based expiry calculations
- Form templates and sections library
