# 🚀 API Integration Guide for Dynamic Credential Portal

## 🎯 Complete API Architecture Mapping

This guide maps your React blueprint components directly to the backend API structure, ensuring seamless integration between frontend and backend.

## 🏗️ API Domain Structure

### 6 Core API Domains:
1. **Auth API** - User authentication and role management
2. **Credential API** - Student credential operations  
3. **Approval API** - Approver workflow management
4. **Config API** - Admin configuration management
5. **Engine API** - Rule evaluation services
6. **Dashboard API** - Analytics and reporting

## 🎓 Student API Integration

### Components Using Student APIs:
- `EnhancedVaccineForm.tsx`
- `Credentials.tsx` 
- `useCredentials.ts`
- `useForm.ts`

### Key Endpoints:

**1️⃣ Submit Credential**
```typescript
// POST /api/credentials
const submission = {
  sectionId: "vaccine",
  entries: [
    {
      date: "2025-01-01",
      lotNumber: "123",
      manufacturer: "Pfizer"
    }
  ]
};

// Hook usage:
const { submitCredential } = useStudentCredentials();
await submitCredential(submission);
```

**2️⃣ Get Student Credentials**
```typescript
// GET /api/credentials?userId=123
// Hook usage:
const { credentials, loading, error } = useStudentCredentials(userId);
```

**3️⃣ Document Upload with OCR**
```typescript
// POST /api/uploads + POST /api/ocr/extract
const { uploadDocument, extractFromImage } = useStudentCredentials();

// Upload file
const uploadResult = await uploadDocument(file);

// Extract data from image
const extractedData = await extractFromImage(imageFile);
```

## ✅ Approver API Integration

### Components Using Approver APIs:
- `Dashboard.tsx`
- `Credentials.tsx`

### Key Endpoints:

**7️⃣ Get Pending Approvals**
```typescript
// GET /api/approvals/pending
const { pendingApprovals, approveCredential, rejectCredential } = useApprovals();

// Usage in Dashboard:
{pendingApprovals.map(approval => (
  <ApprovalCard 
    key={approval.credentialId}
    approval={approval}
    onApprove={() => approveCredential(approval.credentialId)}
    onReject={(reason) => rejectCredential(approval.credentialId, reason)}
  />
))}
```

**🔟 Bulk Approval**
```typescript
// POST /api/approvals/bulk
const selectedIds = ['cred_001', 'cred_002', 'cred_003'];
const result = await bulkApprove(selectedIds);
```

## 🏛️ Admin Configuration API

### Components Using Admin APIs:
- `AdminPortal.tsx`
- `EnhancedVaccineConfig.tsx`
- `DocumentTypeSelector.tsx`

### Key Endpoints:

**11️⃣ Get Configuration**
```typescript
// GET /api/config
const { config, updateConfig, addSection } = useAdminConfig();

// Load configuration in Admin Portal:
useEffect(() => {
  // Configuration automatically loaded via hook
}, []);
```

**12️⃣ Update Configuration**
```typescript
// PUT /api/config
const newConfig = [...config, newSection];
await updateConfig(newConfig);
```

**14️⃣ Context Override**
```typescript
// GET /api/config?context=clinical
const clinicalConfig = await getConfigWithContext('clinical');
```

## 🤖 Rule Engine API Integration

### Integration with Rule Evaluation Service:

**15️⃣ Form Validation**
```typescript
// POST /api/engine/validate
const { validateForm } = useRuleEngine();

const validation = await validateForm(currentSection, formData);
if (!validation.isValid) {
  setErrors(validation.errors);
}
```

**16️⃣ Expiry Calculation**
```typescript
// POST /api/engine/calculate-expiry
const { calculateExpiry } = useRuleEngine();

const expiry = await calculateExpiry(expiryRule, {
  lastDoseDate: '2024-01-15'
});
// Returns: { expiryDate: '2034-01-15' }
```

## 📊 Dashboard & Analytics API

### Components Using Dashboard APIs:
- `Dashboard.tsx`
- `BlueprintDemo.tsx`

### Key Endpoints:

**18️⃣ Compliance Summary**
```typescript
// GET /api/dashboard/compliance
const { complianceSummary } = useDashboard();

// Usage:
<div className="stats-grid">
  <StatCard 
    title="Total Credentials" 
    value={complianceSummary?.total || 0}
    color="blue"
  />
  <StatCard 
    title="Approved" 
    value={complianceSummary?.approved || 0}
    color="green"
  />
</div>
```

**19️⃣ Expiring Soon**
```typescript
// GET /api/dashboard/expiring?days=30
const { expiringSoon } = useDashboard();
// Shows credentials expiring within 30 days
```

## 🔐 Authentication Flow

### Role-Based Access Control:

```typescript
const { isAuthenticated, user, login, logout } = useAuth();

// Role-based rendering:
{user?.role === 'admin' && <AdminPortal />}
{user?.role === 'approver' && <ApprovalDashboard />}
{user?.role === 'student' && <StudentCredentials />}
```

### Protected Routes Implementation:
```typescript
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

## 🔄 Data Flow Architecture

### Student Submission Flow:
```
Student Form (EnhancedVaccineForm.tsx)
    ↓
useStudentCredentials Hook
    ↓
API Client (apiClient.ts)
    ↓
Backend Validation & Rule Engine
    ↓
Normalized Storage
    ↓
Status Update (PendingReview)
```

### Admin Configuration Flow:
```
Admin Portal (AdminPortal.tsx)
    ↓
useAdminConfig Hook
    ↓
API Client
    ↓
Configuration Storage
    ↓
Dynamic Form Rendering
```

## 🛠️ Implementation Examples

### 1. Dynamic Form with API Integration:
```typescript
// EnhancedVaccineForm.tsx with API integration
export function EnhancedVaccineFormWithAPI({ sectionId }) {
  const { credentials, submitCredential } = useStudentCredentials();
  const { validateForm } = useRuleEngine();
  const currentConfig = useAdminConfig().config.find(s => s.id === sectionId);
  
  const handleSubmit = async (formData) => {
    // Validate first
    const validation = await validateForm(currentConfig, formData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Submit to API
    const submission = {
      sectionId,
      entries: [formData],
      status: 'pending_review'
    };
    
    return await submitCredential(submission);
  };
  
  return (
    <DynamicForm 
      config={currentConfig}
      onSubmit={handleSubmit}
      existingData={credentials.filter(c => c.sectionId === sectionId)}
    />
  );
}
```

### 2. Admin Portal with Real-time Updates:
```typescript
// AdminPortal.tsx with live configuration
export function AdminPortalWithLiveUpdates() {
  const { config, updateConfig } = useAdminConfig();
  const [localConfig, setLocalConfig] = useState(config);
  
  // Debounced save to prevent excessive API calls
  const debouncedSave = useCallback(
    debounce((newConfig) => {
      updateConfig(newConfig);
    }, 1000),
    [updateConfig]
  );
  
  const handleConfigChange = (newConfig) => {
    setLocalConfig(newConfig);
    debouncedSave(newConfig);
  };
  
  return (
    <div className="admin-portal">
      <ConfigurationEditor 
        config={localConfig}
        onChange={handleConfigChange}
      />
      <LivePreview config={localConfig} />
    </div>
  );
}
```

## 📈 Performance Optimizations

### 1. Caching Strategy:
```typescript
// Query caching with stale-while-revalidate
const useCachedCredentials = (userId) => {
  const queryClient = useQueryClient();
  
  return useQuery(
    ['credentials', userId],
    () => API.student.getCredentials(userId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};
```

### 2. Pagination for Large Datasets:
```typescript
const usePaginatedCredentials = (page, limit) => {
  return useInfiniteQuery(
    ['credentials', { page, limit }],
    ({ pageParam = 1 }) => 
      API.student.getCredentialsPaginated(pageParam, limit),
    {
      getNextPageParam: (lastPage) => 
        lastPage.hasNext ? lastPage.nextPage : undefined,
    }
  );
};
```

## 🛡️ Error Handling & Retry Logic

```typescript
// Robust error handling with automatic retry
const apiClient = {
  request: async (endpoint, options) => {
    const maxRetries = 3;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (response.status === 429) {
          // Rate limiting - exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        if (i === maxRetries - 1) break;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw lastError;
  }
};
```

## 🎯 Deployment Considerations

### Environment Variables:
```bash
# .env.production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com
REACT_APP_ENV=production
```

### API Versioning:
```typescript
// Versioned API endpoints
const API_VERSION = 'v1';
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/${API_VERSION}`;
```

This comprehensive API integration ensures your dynamic credential portal maintains real-time synchronization between frontend and backend while providing enterprise-grade reliability and performance.