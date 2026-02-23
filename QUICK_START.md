# Quick Start Guide - Dynamic Credential Configuration System

## 🚀 Getting Started

### 1. Access the Admin Portal

Navigate to `/admin-demo` in your browser to access the configuration system.

```bash
# In development:
npm run dev
# Then visit: http://localhost:5173/admin-demo
```

### 2. Create Your First Configuration

1. Click **"New Config"**
2. Enter configuration name (e.g., "Faculty Health Requirements")
3. Click **"Create"**

### 3. Add Sections

1. Click on your config
2. Go to **"Sections"** tab
3. Click **"New Section"**
4. Enter section name (e.g., "Vaccination Details")
5. Select the section and configure it

### 4. Add Fields to Section

1. Go to **"Fields"** tab
2. Make sure a section is selected
3. Click **"New Field"**
4. Configure field:
   - **Field Key**: Unique identifier (e.g., `vaccine_date`)
   - **Label**: Display name (e.g., "Vaccination Date")
   - **Control Type**: Choose from dropdown (textBox, datePicker, etc.)
5. Save

### 5. Configure Validation

1. Select a field in the **"Fields"** tab
2. Go to **"Validation"** tab
3. Click **"Add Validation Rule"**
4. Choose rule type:
   - **Required**: Field must be filled
   - **MinLength/MaxLength**: String length restrictions
   - **Pattern**: Regex validation
   - **Email**: Email format validation
   - **Date**: Valid date validation
5. Enter error message
6. Save

### 6. Configure Visibility Rules

1. Select a field
2. Go to **"Visibility"** tab
3. Click **"Add Visibility Rule"**
4. Configure when field should be visible:
   - **Depends On**: Which field controls visibility
   - **Operator**: equals, notEquals, includes, etc.
   - **Value**: Value to match
5. Example: Show "Test Type" field only when "Document Type" equals "TB"

### 7. Configure Expiry Rules

1. Select a section
2. Go to **"Expiry"** tab
3. Choose expiry type:
   - **No Expiry**: Credential never expires
   - **After Period**: Expires after X years/months/days
   - **Based on Field Date**: Expires relative to a field (e.g., result date + 3 years)
   - **Fixed Date**: All expire on specific date

### 8. Preview the Form

1. Select your configuration from the list
2. The form will automatically preview on the right
3. Test filling it out
4. Check validation works correctly

### 9. Test Submission

1. Fill out all required fields
2. Click **"Next"** to navigate sections
3. Click **"Submit"** on final section
4. View submission data in the console

## 📝 Configuration Examples

### Example 1: Simple Vaccination Form

```typescript
Configuration Name: "Vaccination"
  └─ Section: "Vaccination"
      ├─ Field: vaccine_type (dropdown, required)
      ├─ Field: dose_date (datePicker, required)
      ├─ Field: manufacturer (textBox)
      └─ Expiry: After 10 years
```

### Example 2: TB Testing with Conditional Fields

```typescript
Configuration Name: "TB Testing"
  └─ Section: "TB Screening"
      ├─ Field: test_type (radio, required, options: ["T-Spot", "Quantiferon"])
      ├─ Field: result_date (datePicker, required)
      ├─ Field: induration (textBox)
      │   └─ Visibility: Show only when test_type = "T-Spot"
      └─ Expiry: Based on result_date + 3 years
```

### Example 3: CPR Certification with Multiple Doses

```typescript
Configuration Name: "CPR Certification"
  └─ Section: "CPR"
      ├─ Field: issue_date (datePicker, required)
      ├─ Field: renewal_date (datePicker, required)
      ├─ Repeatable Doses (min: 1, max: 1)
      │   ├─ dose_date
      │   └─ provider_name
      └─ Expiry: After 2 years
```

## 🔧 Common Tasks

### Change Field Type
1. Select field in "Fields" tab
2. Click edit button
3. Change "Control Type"
4. Save

### Make Field Required
1. Select field
2. Toggle "Required Field" checkbox
3. Save

### Delete a Section
1. Select section in "Sections" tab
2. Click "Delete Section"
3. Confirm deletion

### Export Configuration
1. Find configuration in list
2. Click download/export button
3. File saves as JSON

### Import Configuration
1. Click upload button in "Configurations" panel
2. Select exported JSON file
3. Configuration is imported with new ID

## 📚 Type System Quick Reference

### Field Control Types
- `textBox` - Single line text
- `textArea` - Multi-line text
- `datePicker` - Date input
- `dropDown` - Dropdown selection
- `radio` - Single selection (radio buttons)
- `checkBox` - Multiple selection (checkboxes)
- `fileUpload` - File upload
- `number` - Numeric input
- `email` - Email input

### Validation Types
- `required` - Field required
- `minLength` - Minimum string length
- `maxLength` - Maximum string length
- `pattern` - Regex pattern matching
- `email` - Valid email format
- `date` - Valid date

### Visibility Operators
- `equals` - Exact match
- `notEquals` - Not equal
- `includes` - Contains value (for arrays)
- `notIncludes` - Doesn't contain value
- `greaterThan` - Numeric greater than
- `lessThan` - Numeric less than

### Expiry Types
- `never` - No expiry
- `period` - Expires after period (years/months/days)
- `basedOnField` - Expires relative to field date
- `fixedDate` - All expire on specific date

## 🎯 Best Practices

1. **Use Clear Field Keys**: `vaccine_date` not `vd`
2. **Group Related Fields**: Put related fields in same section
3. **Set Required Fields**: Mark fields that must be completed
4. **Test Visibility Rules**: Ensure conditions work correctly
5. **Validate Expiry Logic**: Test expiry calculations with sample data
6. **Use Helpful Labels**: Use clear, user-friendly field names
7. **Provide Help Text**: Add guidance for complex fields

## 🐛 Troubleshooting

### Fields Not Showing
- Check field is enabled
- Check visibility rules conditions
- Check that dependent field has correct value

### Validation Not Working
- Ensure validation rules are configured
- Check rule conditions match field values
- Review error messages

### Form Not Submitting
- Ensure all required fields are filled
- Check for validation errors (shown in red)
- Verify expiry rules don't have errors

### Data Not Saving
- Check browser localStorage isn't full
- Try clearing browser cache
- Check browser console for errors

## 📖 File Locations

| File | Purpose |
|------|---------|
| `src/types/dynamicConfig.ts` | Core type definitions |
| `src/services/ruleEngine.ts` | Rule evaluation logic |
| `src/services/credentialSubmissionService.ts` | Submission management |
| `src/services/configurationService.ts` | Configuration CRUD |
| `src/components/admin/ConfigurationPortal.tsx` | Admin UI |
| `src/components/forms/DynamicFormRenderer.tsx` | Form rendering |
| `src/hooks/useDynamicForm.ts` | React hook for forms |
| `src/pages/AdminDemo.tsx` | Demo page |

## 🔗 Key Services

### Configuration Service
```typescript
import { 
  createConfiguration, 
  saveConfiguration, 
  loadConfiguration,
  deleteConfiguration 
} from '../services/configurationService';
```

### Rule Engine
```typescript
import {
  evaluateFieldVisibility,
  validateFormData,
  calculateExpiryDate
} from '../services/ruleEngine';
```

### Submission Service
```typescript
import {
  createCredentialSubmission,
  updateFieldEntry,
  saveCredentialSubmission,
  loadCredentialSubmission
} from '../services/credentialSubmissionService';
```

## 💡 Next Steps

1. **Create your first configuration** using the admin portal
2. **Test the form preview** to verify functionality
3. **Review DYNAMIC_CONFIG_GUIDE.md** for detailed documentation
4. **Integrate with backend** by replacing localStorage with API calls
5. **Deploy to production** with proper authentication

## 📞 Support

For detailed documentation, see `DYNAMIC_CONFIG_GUIDE.md`.

For API/service reference, check the JSDoc comments in:
- `src/services/ruleEngine.ts`
- `src/services/configurationService.ts`
- `src/services/credentialSubmissionService.ts`
