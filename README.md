# React Form Mastery - Config-Driven Credential Management System

A sophisticated React application for managing clinical credentials with dynamic, config-driven forms, OCR integration, and admin controls.

## 🏗️ Architecture Overview

This application demonstrates a **config-driven architecture** where form behavior, validation, and UI rendering are controlled by JSON configuration files. This approach allows for:

- **Zero-code changes** to add/modify requirements
- **Dynamic form rendering** based on visibility flags
- **Flexible validation** rules
- **Scalable requirement management**

### Key Design Decisions

- **Visibility controls UI rendering**: Fields only appear if `visible: true`
- **Required controls validation**: Mandatory fields block submission
- **OCR is assistive, not mandatory**: Auto-fills fields but allows manual override
- **Config is backend/admin-driven**: UI adapts without code changes

## 📊 Data Flow

```
Config JSON → Requirement Types → Dynamic Form → Validation Engine → Submit
     ↓              ↓                    ↓              ↓
   Admin UI    Field Rendering     OCR Processing   Error Handling
```

### OCR Flow

```
Upload Document → Tesseract OCR → Text Parsing → Field Mapping → Auto-Fill Form
       ↓                ↓              ↓              ↓              ↓
   File Input      Extract Text   Regex Patterns   Config Mapping   User Override
```

## 🚀 Features Implemented

### Core Features
- ✅ **Requirement-level config schema** (`src/config/requirement-config.json`)
- ✅ **Field visibility flags** (dynamic rendering)
- ✅ **Mandatory vs optional fields** (validation blocking)
- ✅ **Dynamic form rendering** (VaccinationForm component)
- ✅ **Config-driven validation** (validationEngine utility)
- ✅ **Disable submit on missing required fields** (FormFooter component)

### OCR & Upload
- ✅ **Upload → OCR → auto-fill** (DocumentUploader component)
- ✅ **Manual override** (user can edit auto-filled values)
- ✅ **OCR failure handling** (graceful fallback with error alerts)

### Admin & Scalability
- ✅ **Mock admin config UI** (AdminConfigPreview page)
- ✅ **JSON-based rule engine** (requirement-config.json)
- ✅ **Role/requirement extensibility** (modular config structure)

### UX & Polish
- ✅ **Error states** (field highlighting, validation messages)
- ✅ **Clear hook abstraction** (useDocumentProcessor)
- ✅ **Loading states** (progress bars for OCR)

## 🛠️ Technical Implementation

### Configuration Schema

```json
{
  "requirementId": "vaccination_hepatitis_a",
  "label": "Hepatitis A Vaccination",
  "category": "VACCINATION",
  "fields": {
    "doseNumber": {
      "visible": true,
      "required": true,
      "type": "number"
    },
    "expiryDate": {
      "visible": true,
      "required": true,
      "type": "date",
      "autoPopulate": "OCR_EXPIRY_DATE"
    }
  }
}
```

### Key Components

- **VaccinationForm**: Renders fields dynamically based on config
- **DocumentUploader**: Handles file upload and OCR processing
- **FormFooter**: Manages submit button state based on validation
- **AdminConfigPreview**: Mock admin interface for config management

### Utilities

- **validationEngine.ts**: Config-driven validation logic
- **ocrMapper.ts**: Maps OCR data to form fields
- **getRequirementConfig.ts**: Safe config loading

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Interview Talking Points

### Config-Driven Design
- **Why?** Eliminates hardcoding, enables rapid iteration
- **How?** JSON schema defines UI behavior
- **Benefits?** Admin can modify requirements without developer intervention

### OCR Integration
- **Pipeline**: Upload → OCR → Parse → Map → Fill
- **Fallback**: Graceful degradation when OCR fails
- **UX**: Progress indicators, error handling, manual override

### Validation Strategy
- **Dynamic Rules**: Based on config flags
- **Real-time Feedback**: Field-level error highlighting
- **Submit Blocking**: Prevents invalid submissions

### Scalability
- **Modular Config**: Easy to add new requirement types
- **Type Safety**: TypeScript interfaces ensure config validity
- **Performance**: Lazy loading and efficient re-renders

## 📁 Project Structure

```
src/
├── components/
│   ├── forms/
│   │   ├── VaccinationForm.tsx
│   │   └── FormFooter.tsx
│   └── upload/
│       └── DocumentUploader.tsx
├── config/
│   └── requirement-config.json
├── hooks/
│   └── useDocumentProcessor.ts
├── pages/
│   └── AdminConfigPreview.tsx
├── types/
│   └── RequirementConfig.ts
└── utils/
    ├── validationEngine.ts
    ├── ocrMapper.ts
    └── getRequirementConfig.ts
```

## 🔧 Technologies Used

- **React 18** with TypeScript
- **Vite** for build tooling
- **ShadCN UI** for components
- **Tesseract.js** for OCR
- **React Hook Form** for form management
- **Tailwind CSS** for styling

This implementation showcases advanced React patterns, config-driven architecture, and practical OCR integration - perfect for demonstrating senior-level frontend skills in interviews.
