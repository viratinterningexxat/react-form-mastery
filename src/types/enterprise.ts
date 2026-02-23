// ============================================
// Enterprise Types
// RBAC, Audit, Workflow, Compliance
// ============================================

// ============================================
// 1. RBAC - Role Hierarchy & Permissions
// ============================================

export type RoleHierarchy = 'admin' | 'manager' | 'reviewer' | 'user' | 'clinical' | 'approver';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'view' | 'edit' | 'approve' | 'override' | 'export' | 'delete' | 'admin';
}

export interface Role {
  id: string;
  name: string;
  hierarchy: number; // 1 (lowest) to 5 (highest)
  permissions: Permission[];
  description: string;
}

export interface PermissionMatrix {
  [roleId: string]: {
    [resourceType: string]: {
      view: boolean;
      edit: boolean;
      approve: boolean;
      override: boolean;
      export: boolean;
      delete: boolean;
    };
  };
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string; // For temporary role delegation
  department?: string;
}

// ============================================
// 2. Audit Log
// ============================================

export type AuditActionType =
  | 'credential_upload'
  | 'credential_approve'
  | 'credential_reject'
  | 'credential_delete'
  | 'credential_archive'
  | 'credential_version_restore'
  | 'user_login'
  | 'user_logout'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'config_created'
  | 'config_updated'
  | 'config_deleted'
  | 'permission_changed'
  | 'report_generated'
  | 'bulk_action_executed';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditActionType;
  resourceType: string; // 'credential', 'user', 'config', etc.
  resourceId: string;
  resourceName?: string;
  description: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// ============================================
// 3. Document Version Control
// ============================================

export interface DocumentVersion {
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  fileDataUrl: string;
  fileName: string;
  notes?: string;
  status: 'active' | 'superseded' | 'archived';
  changesSummary?: string;
}

export interface VersionControlledDocument {
  id: string;
  credentialId: string;
  currentVersion: number;
  versions: DocumentVersion[];
  changeHistory: {
    from: number;
    to: number;
    timestamp: string;
    reason: string;
  }[];
}

// ============================================
// 4. Workflow Status
// ============================================

export type WorkflowState =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'escalated'
  | 'approved'
  | 'approved_with_conditions'
  | 'rejected'
  | 'archived';

export interface WorkflowStatusTransition {
  from: WorkflowState;
  to: WorkflowState;
  timestamp: string;
  actor: string;
  actorName: string;
  reason?: string;
  conditions?: string;
}

export interface WorkflowTimeline {
  credentialId: string;
  transitions: WorkflowStatusTransition[];
  currentStatus: WorkflowState;
}

// ============================================
// 5. Department & Organization
// ============================================

export type DepartmentType = 'HR' | 'Clinical' | 'IT' | 'Legal' | 'Finance' | 'Operations' | 'Other';

export interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  manager: string;
  headCount: number;
  complianceScore?: number;
}

export interface DepartmentStatistics {
  departmentId: string;
  totalEmployees: number;
  compliantEmployees: number;
  compliancePercentage: number;
  expiringWithin30Days: number;
  expiringWithin90Days: number;
  overdue: number;
}

// ============================================
// 6. Compliance & Risk Scoring
// ============================================

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ComplianceScoreBreakdown {
  category: string;
  score: number;
  weight: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
}

export interface ComplianceScore {
  credentialId?: string;
  userId?: string;
  departmentId?: string;
  overallScore: number; // 0-100
  riskLevel: RiskLevel;
  breakdown: ComplianceScoreBreakdown[];
  lastCalculated: string;
  explanation: string;
  recommendations: string[];
}

// ============================================
// 7. Policy & Regulation Mapping
// ============================================

export type PolicyType = 'HIPAA' | 'OSHA' | 'GDPR' | 'SOX' | 'Internal' | 'Industry' | 'Other';

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  description: string;
  requirements: string[];
  mappedCredentials: string[]; // credential IDs
  compliancePercentage?: number;
}

export interface PolicyCompliance {
  policyId: string;
  credentialsCovered: number;
  credentialsCompliant: number;
  compliancePercentage: number;
  gapAnalysis: string[];
}

// ============================================
// 8. SLA Tracking
// ============================================

export interface SLA {
  id: string;
  name: string;
  targetDays: number; // Days to complete review
  warningDays?: number; // Days before breach
}

export interface CredentialSLATracker {
  credentialId: string;
  submittedAt: string;
  slaId: string;
  targetCompletionDate: string;
  daysElapsed: number;
  daysRemaining: number;
  isBreached: boolean;
  isBrushingBreach: boolean; // Within warning period
}

// ============================================
// 9. Notification Center
// ============================================

export type NotificationType =
  | 'compliance_alert'
  | 'approval_required'
  | 'expiry_notice'
  | 'policy_update'
  | 'task_assigned'
  | 'status_change'
  | 'system_alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: string;
  title: string;
  message: string;
  referenceId?: string; // credential/user/config ID
  referenceLink?: string;
  severity: 'info' | 'warning' | 'error';
  createdAt: string;
  readAt?: string;
  acknowledgedAt?: string;
  requiresAcknowledgement: boolean;
}

// ============================================
// 10. Saved Filters & Queries
// ============================================

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  resourceType: string; // 'credentials', 'users', 'approvals'
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: any;
  }[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  sharedWith?: string[]; // user IDs
}

// ============================================
// 11. Data Retention & Archival
// ============================================

export interface RetentionPolicy {
  id: string;
  name: string;
  resourceType: string; // 'credential', 'user', 'audit_log'
  retentionDays: number;
  archiveAfterDays?: number;
  deleteAfterDays?: number;
  isActive: boolean;
}

export interface ArchivedRecord {
  id: string;
  originalId: string;
  resourceType: string;
  resourceName: string;
  archivedAt: string;
  archivedBy: string;
  archiveReason: string;
  content: any; // Serialized original content
  restorable: boolean;
}

// ============================================
// 12. Session & Security
// ============================================

export interface SessionConfig {
  timeoutMinutes: number;
  inactivityLogoutMinutes: number;
  allowConcurrentSessions: number;
  requireMFA: boolean;
  sessionWarningMinutes: number; // Show warning before timeout
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

// ============================================
// 13. Branding & White-Label
// ============================================

export interface BrandingConfig {
  organizationName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  footerLegalText?: string;
  customDomain?: string;
  emailTemplate?: {
    headerColor: string;
    logoUrl?: string;
    footerText: string;
  };
}

// ============================================
// 14. Help Center & Documentation
// ============================================

export interface HelpDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  html?: string; // Rendered HTML
  version: number;
  updatedAt: string;
  updatedBy: string;
  isPublished: boolean;
  relatedDocuments?: string[]; // IDs
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  views: number;
  helpful: number;
  notHelpful: number;
}

// ============================================
// 15. Bulk Operations
// ============================================

export interface BulkOperation {
  id: string;
  operationType: 'approve' | 'reject' | 'archive' | 'export' | 'delete';
  resourceType: string;
  resourceIds: string[];
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  failures?: {
    resourceId: string;
    reason: string;
  }[];
  metadata?: {
    reason?: string;
    additionalNotes?: string;
  };
}

// ============================================
// 16. Executive Dashboard Data
// ============================================

export interface ExecutiveDashboardMetrics {
  organizationCompliancePercentage: number;
  totalEmployees: number;
  compliantEmployees: number;
  nonCompliantEmployees: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  overdue: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  departmentMetrics: DepartmentStatistics[];
  approvalSLAMetrics: {
    averageApprovalTime: number; // days
    slaCompliance: number; // percentage
    breachedApprovals: number;
    pendingApprovals: number;
  };
  policyCompliance: PolicyCompliance[];
  recentAuditLogs: AuditLog[];
}

// ============================================
// 17. Print-Ready Content
// ============================================

export interface PrintableContent {
  title: string;
  generatedAt: string;
  generatedBy: string;
  content: string;
  sections: {
    title: string;
    content: string;
  }[];
}
