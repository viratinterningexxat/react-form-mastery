// ============================================
// Enterprise Services (Combined)
// Departments, Compliance Scoring, Workflows, Notifications
// ============================================

import {
  Department,
  DepartmentStatistics,
  ComplianceScore,
  ComplianceScoreBreakdown,
  RiskLevel,
  WorkflowTimeline,
  WorkflowState,
  WorkflowStatusTransition,
  Notification,
  NotificationType,
  SavedFilter,
  Policy,
  PolicyCompliance,
  ArchivedRecord,
  RetentionPolicy,
} from '../types/enterprise';

// ============================================
// DEPARTMENTS
// ============================================

const DEPARTMENTS_KEY = 'enterprise_departments';

export function createDepartment(
  name: string,
  type: string,
  manager: string
): Department {
  return {
    id: `dept_${Date.now()}`,
    name,
    type: type as any,
    manager,
    headCount: 0,
  };
}

export function saveDepartment(dept: Department): void {
  const depts = loadAllDepartments();
  const idx = depts.findIndex((d) => d.id === dept.id);
  if (idx >= 0) depts[idx] = dept;
  else depts.push(dept);
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(depts));
}

export function loadAllDepartments(): Department[] {
  try {
    return JSON.parse(localStorage.getItem(DEPARTMENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getDepartmentStatistics(deptId: string): DepartmentStatistics {
  return {
    departmentId: deptId,
    totalEmployees: 0,
    compliantEmployees: 0,
    compliancePercentage: 0,
    expiringWithin30Days: 0,
    expiringWithin90Days: 0,
    overdue: 0,
  };
}

// ============================================
// COMPLIANCE SCORING
// ============================================

const COMPLIANCE_SCORES_KEY = 'enterprise_compliance_scores';

export function calculateComplianceScore(
  userId: string,
  credentialsStatus: { total: number; compliant: number; atRisk: number }
): ComplianceScore {
  const compliance = (credentialsStatus.compliant / credentialsStatus.total) * 100;
  const atRiskPercentage = (credentialsStatus.atRisk / credentialsStatus.total) * 100;

  let riskLevel: RiskLevel = 'low';
  if (compliance < 50) riskLevel = 'critical';
  else if (compliance < 70) riskLevel = 'high';
  else if (compliance < 85) riskLevel = 'moderate';

  const breakdown: ComplianceScoreBreakdown[] = [
    {
      category: 'Current Certifications',
      score: Math.min(100, compliance),
      weight: 40,
      status: compliance >= 85 ? 'compliant' : compliance >= 70 ? 'at_risk' : 'non_compliant',
    },
    {
      category: 'Expiration Management',
      score: Math.max(0, 100 - atRiskPercentage),
      weight: 35,
      status: atRiskPercentage < 10 ? 'compliant' : atRiskPercentage < 25 ? 'at_risk' : 'non_compliant',
    },
    {
      category: 'Submission History',
      score: 85,
      weight: 25,
      status: 'compliant',
    },
  ];

  const overallScore = breakdown.reduce((sum, cat) => sum + (cat.score * cat.weight) / 100, 0);

  return {
    userId,
    overallScore: Math.round(overallScore),
    riskLevel,
    breakdown,
    lastCalculated: new Date().toISOString(),
    explanation: `Compliance score based on ${credentialsStatus.total} credentials. ${credentialsStatus.compliant} compliant, ${credentialsStatus.atRisk} at risk.`,
    recommendations: [
      ...(compliance < 85 ? ['Review pending credential submissions'] : []),
      ...(atRiskPercentage > 10 ? ['Schedule renewals for expiring credentials'] : []),
      ...(credentialsStatus.total === 0 ? ['Submit initial credential documents'] : []),
    ],
  };
}

export function saveComplianceScore(score: ComplianceScore): void {
  const scores = loadAllComplianceScores();
  const idx = scores.findIndex((s) => s.userId === score.userId);
  if (idx >= 0) scores[idx] = score;
  else scores.push(score);
  localStorage.setItem(COMPLIANCE_SCORES_KEY, JSON.stringify(scores));
}

export function loadAllComplianceScores(): ComplianceScore[] {
  try {
    return JSON.parse(localStorage.getItem(COMPLIANCE_SCORES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getComplianceScore(userId: string): ComplianceScore | null {
  const scores = loadAllComplianceScores();
  return scores.find((s) => s.userId === userId) || null;
}

// ============================================
// WORKFLOW
// ============================================

const WORKFLOWS_KEY = 'enterprise_workflows';

export function createWorkflowTimeline(credentialId: string): WorkflowTimeline {
  return {
    credentialId,
    transitions: [],
    currentStatus: 'draft',
  };
}

export function addWorkflowTransition(
  credentialId: string,
  from: WorkflowState,
  to: WorkflowState,
  actor: string,
  actorName: string,
  reason?: string
): void {
  const timelines = loadAllWorkflows();
  let timeline = timelines.find((t) => t.credentialId === credentialId);

  if (!timeline) {
    timeline = createWorkflowTimeline(credentialId);
  }

  timeline.transitions.push({
    from,
    to,
    timestamp: new Date().toISOString(),
    actor,
    actorName,
    reason,
  });

  timeline.currentStatus = to;

  const idx = timelines.findIndex((t) => t.credentialId === credentialId);
  if (idx >= 0) timelines[idx] = timeline;
  else timelines.push(timeline);

  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(timelines));
}

export function getWorkflowTimeline(credentialId: string): WorkflowTimeline | null {
  const timelines = loadAllWorkflows();
  return timelines.find((t) => t.credentialId === credentialId) || null;
}

export function loadAllWorkflows(): WorkflowTimeline[] {
  try {
    return JSON.parse(localStorage.getItem(WORKFLOWS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getWorkflowHistory(credentialId: string): WorkflowStatusTransition[] {
  const timeline = getWorkflowTimeline(credentialId);
  return timeline?.transitions || [];
}

// ============================================
// NOTIFICATIONS
// ============================================

const NOTIFICATIONS_KEY = 'enterprise_notifications';

export function createNotification(
  userId: string,
  type: NotificationType,
  category: string,
  title: string,
  message: string,
  options?: {
    referenceId?: string;
    referenceLink?: string;
    severity?: 'info' | 'warning' | 'error';
    requiresAcknowledgement?: boolean;
  }
): Notification {
  return {
    id: `notif_${Date.now()}`,
    userId,
    type,
    category,
    title,
    message,
    referenceId: options?.referenceId,
    referenceLink: options?.referenceLink,
    severity: options?.severity || 'info',
    createdAt: new Date().toISOString(),
    requiresAcknowledgement: options?.requiresAcknowledgement || false,
  };
}

export function saveNotification(notif: Notification): void {
  const notifs = loadAllNotifications();
  notifs.push(notif);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

export function getUserNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
  const notifs = loadAllNotifications();
  return notifs
    .filter((n) => n.userId === userId && (!unreadOnly || !n.readAt))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markNotificationAsRead(notifId: string): void {
  const notifs = loadAllNotifications();
  const notif = notifs.find((n) => n.id === notifId);
  if (notif) {
    notif.readAt = new Date().toISOString();
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  }
}

export function markNotificationAsAcknowledged(notifId: string): void {
  const notifs = loadAllNotifications();
  const notif = notifs.find((n) => n.id === notifId);
  if (notif) {
    notif.acknowledgedAt = new Date().toISOString();
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  }
}

export function loadAllNotifications(): Notification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getUnreadNotificationCount(userId: string): number {
  return loadAllNotifications().filter((n) => n.userId === userId && !n.readAt).length;
}

// ============================================
// SAVED FILTERS
// ============================================

const SAVED_FILTERS_KEY = 'enterprise_saved_filters';

export function saveSavedFilter(filter: SavedFilter): void {
  const filters = loadAllSavedFilters();
  const idx = filters.findIndex((f) => f.id === filter.id);
  if (idx >= 0) filters[idx] = filter;
  else filters.push(filter);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

export function loadAllSavedFilters(): SavedFilter[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getUserSavedFilters(userId: string): SavedFilter[] {
  return loadAllSavedFilters().filter((f) => f.createdBy === userId || f.isPublic);
}

export function deleteSavedFilter(filterId: string): void {
  const filters = loadAllSavedFilters().filter((f) => f.id !== filterId);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

// ============================================
// POLICIES
// ============================================

const POLICIES_KEY = 'enterprise_policies';

export function savePolicySavePolicy(policy: Policy): void {
  const policies = loadAllPolicies();
  const idx = policies.findIndex((p) => p.id === policy.id);
  if (idx >= 0) policies[idx] = policy;
  else policies.push(policy);
  localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
}

export function loadAllPolicies(): Policy[] {
  try {
    return JSON.parse(localStorage.getItem(POLICIES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getPoliciesForCredential(credentialId: string): Policy[] {
  return loadAllPolicies().filter((p) => p.mappedCredentials.includes(credentialId));
}

// ============================================
// ARCHIVAL
// ============================================

const ARCHIVED_KEY = 'enterprise_archived_records';

export function archiveRecord(record: ArchivedRecord): void {
  const records = loadAllArchivedRecords();
  records.push(record);
  localStorage.setItem(ARCHIVED_KEY, JSON.stringify(records));
}

export function loadAllArchivedRecords(): ArchivedRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ARCHIVED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function restoreArchivedRecord(recordId: string): ArchivedRecord | null {
  const records = loadAllArchivedRecords();
  const record = records.find((r) => r.id === recordId);
  if (record && record.restorable) {
    // Remove from archive
    const filtered = records.filter((r) => r.id !== recordId);
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(filtered));
    return record;
  }
  return null;
}
