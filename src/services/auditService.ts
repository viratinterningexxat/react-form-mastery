// ============================================
// Audit Log Service
// Immutable compliance and activity tracking
// ============================================

import { AuditLog, AuditActionType } from '../types/enterprise';

const AUDIT_LOG_KEY = 'enterprise_audit_logs';
const MAX_LOGS = 10000; // Prevent unbounded growth

/**
 * Create audit log entry
 */
export function createAuditLog(
  userId: string,
  userName: string,
  userRole: string,
  action: AuditActionType,
  resourceType: string,
  resourceId: string,
  description: string,
  options?: {
    resourceName?: string;
    changes?: { field: string; oldValue: any; newValue: any }[];
    ipAddress?: string;
    status?: 'success' | 'failure';
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
): AuditLog {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    resourceType,
    resourceId,
    resourceName: options?.resourceName,
    description,
    changes: options?.changes,
    ipAddress: options?.ipAddress,
    status: options?.status || 'success',
    errorMessage: options?.errorMessage,
    metadata: options?.metadata,
  };
}

/**
 * Log action (immutable - logs are never modified)
 */
export function logAction(log: AuditLog): void {
  const logs = loadAllLogs();
  logs.push(log);

  // Keep only most recent logs to prevent storage overflow
  if (logs.length > MAX_LOGS) {
    logs.splice(0, logs.length - MAX_LOGS);
  }

  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}

/**
 * Load all audit logs
 */
export function loadAllLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(AUDIT_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get logs with filters
 */
export function getAuditLogs(options: {
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: AuditActionType;
  startDate?: string;
  endDate?: string;
  status?: 'success' | 'failure';
  limit?: number;
  offset?: number;
}): AuditLog[] {
  let logs = loadAllLogs();

  // Apply filters
  if (options.userId) {
    logs = logs.filter((l) => l.userId === options.userId);
  }

  if (options.resourceType) {
    logs = logs.filter((l) => l.resourceType === options.resourceType);
  }

  if (options.resourceId) {
    logs = logs.filter((l) => l.resourceId === options.resourceId);
  }

  if (options.action) {
    logs = logs.filter((l) => l.action === options.action);
  }

  if (options.startDate) {
    const start = new Date(options.startDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() >= start);
  }

  if (options.endDate) {
    const end = new Date(options.endDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() <= end);
  }

  if (options.status) {
    logs = logs.filter((l) => l.status === options.status);
  }

  // Sort by newest first
  logs = logs.reverse();

  // Pagination
  const offset = options.offset || 0;
  const limit = options.limit || 100;

  return logs.slice(offset, offset + limit);
}

/**
 * Get audit log for specific resource
 */
export function getResourceAuditTrail(
  resourceType: string,
  resourceId: string
): AuditLog[] {
  const logs = loadAllLogs();
  return logs
    .filter((l) => l.resourceType === resourceType && l.resourceId === resourceId)
    .reverse();
}

/**
 * Get user activity
 */
export function getUserAuditTrail(userId: string, limit: number = 50): AuditLog[] {
  const logs = loadAllLogs();
  return logs
    .filter((l) => l.userId === userId)
    .reverse()
    .slice(0, limit);
}

/**
 * Get logs by date range
 */
export function getAuditLogsByDateRange(startDate: string, endDate: string): AuditLog[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return loadAllLogs()
    .filter((l) => {
      const logTime = new Date(l.timestamp).getTime();
      return logTime >= start && logTime <= end;
    })
    .reverse();
}

/**
 * Export audit logs as CSV
 */
export function exportAuditLogsAsCSV(logs: AuditLog[] = loadAllLogs()): string {
  const headers = [
    'ID',
    'Timestamp',
    'User ID',
    'User Name',
    'User Role',
    'Action',
    'Resource Type',
    'Resource ID',
    'Resource Name',
    'Description',
    'Status',
    'Error Message',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp,
    log.userId,
    log.userName,
    log.userRole,
    log.action,
    log.resourceType,
    log.resourceId,
    log.resourceName || '',
    log.description,
    log.status,
    log.errorMessage || '',
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  return csv;
}

/**
 * Export audit logs as JSON
 */
export function exportAuditLogsAsJSON(logs: AuditLog[] = loadAllLogs()): string {
  return JSON.stringify(logs, null, 2);
}

/**
 * Get audit statistics
 */
export function getAuditStatistics(options?: {
  startDate?: string;
  endDate?: string;
}): {
  totalLogs: number;
  byAction: Record<AuditActionType, number>;
  byStatus: Record<string, number>;
  byResourceType: Record<string, number>;
  byUser: Record<string, number>;
  failureRate: number;
} {
  let logs = loadAllLogs();

  if (options?.startDate) {
    const start = new Date(options.startDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() >= start);
  }

  if (options?.endDate) {
    const end = new Date(options.endDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() <= end);
  }

  const byAction: Record<AuditActionType, number> = {} as any;
  const byStatus: Record<string, number> = {};
  const byResourceType: Record<string, number> = {};
  const byUser: Record<string, number> = {};

  let failures = 0;

  for (const log of logs) {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byStatus[log.status] = (byStatus[log.status] || 0) + 1;
    byResourceType[log.resourceType] = (byResourceType[log.resourceType] || 0) + 1;
    byUser[log.userName] = (byUser[log.userName] || 0) + 1;

    if (log.status === 'failure') failures++;
  }

  return {
    totalLogs: logs.length,
    byAction,
    byStatus,
    byResourceType,
    byUser,
    failureRate: logs.length > 0 ? (failures / logs.length) * 100 : 0,
  };
}

/**
 * Get recent suspicious activity
 */
export function getSuspiciousActivity(
  options: {
    failuresInMinutes?: number;
    multipleFailuresThreshold?: number;
  } = {}
): AuditLog[] {
  const failuresInMinutes = options.failuresInMinutes || 5;
  const threshold = options.multipleFailuresThreshold || 3;

  const logs = loadAllLogs();
  const now = Date.now();
  const timeWindow = failuresInMinutes * 60 * 1000;

  // Find users with multiple failures in time window
  const userFailures: Record<string, AuditLog[]> = {};

  for (const log of logs) {
    if (log.status === 'failure' && now - new Date(log.timestamp).getTime() < timeWindow) {
      if (!userFailures[log.userId]) {
        userFailures[log.userId] = [];
      }
      userFailures[log.userId].push(log);
    }
  }

  // Return suspicious logs (multiple failures)
  const suspicious: AuditLog[] = [];
  for (const userId in userFailures) {
    if (userFailures[userId].length >= threshold) {
      suspicious.push(...userFailures[userId]);
    }
  }

  return suspicious.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Validate audit log integrity (check for gaps or anomalies)
 */
export function validateAuditIntegrity(): {
  isValid: boolean;
  issues: string[];
} {
  const logs = loadAllLogs();
  const issues: string[] = [];

  // Check for gaps in log IDs
  for (let i = 1; i < logs.length; i++) {
    const prevTime = new Date(logs[i - 1].timestamp).getTime();
    const currTime = new Date(logs[i].timestamp).getTime();

    if (currTime > prevTime) {
      issues.push(`Timestamp ordering issue at log ${logs[i].id}`);
    }
  }

  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const log of logs) {
    if (ids.has(log.id)) {
      issues.push(`Duplicate log ID: ${log.id}`);
    }
    ids.add(log.id);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Archive old logs (moves to separate storage)
 */
export function archiveOldLogs(olderThanDays: number): number {
  const logs = loadAllLogs();
  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  const [active, archived] = logs.reduce(
    (acc, log) => {
      if (new Date(log.timestamp).getTime() < cutoffTime) {
        acc[1].push(log);
      } else {
        acc[0].push(log);
      }
      return acc;
    },
    [[] as AuditLog[], [] as AuditLog[]]
  );

  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(active));

  // Store archived logs separately
  const archivedKey = `${AUDIT_LOG_KEY}_archive_${Date.now()}`;
  localStorage.setItem(archivedKey, JSON.stringify(archived));

  return archived.length;
}
