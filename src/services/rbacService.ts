// ============================================
// RBAC Service
// Role Hierarchy & Permission Management
// ============================================

import { Role, Permission, PermissionMatrix, RoleAssignment } from '../types/enterprise';

const ROLES_STORAGE_KEY = 'enterprise_roles';
const PERMISSIONS_STORAGE_KEY = 'enterprise_permissions';
const ASSIGNMENTS_STORAGE_KEY = 'enterprise_role_assignments';

// Default roles with hierarchy
const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    hierarchy: 5,
    description: 'Full system access and control',
    permissions: [
      {
        id: 'perm_all',
        name: 'All Permissions',
        description: 'Access all features',
        category: 'admin',
      },
    ],
  },
  {
    id: 'manager',
    name: 'Manager',
    hierarchy: 4,
    description: 'Manage departments and approvals',
    permissions: [
      {
        id: 'perm_view_all',
        name: 'View All Credentials',
        description: 'View all credentials in organization',
        category: 'view',
      },
      {
        id: 'perm_approve',
        name: 'Approve Credentials',
        description: 'Approve pending credentials',
        category: 'approve',
      },
      {
        id: 'perm_export',
        name: 'Export Reports',
        description: 'Export audit logs and reports',
        category: 'export',
      },
    ],
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    hierarchy: 3,
    description: 'Review and approve credentials',
    permissions: [
      {
        id: 'perm_review',
        name: 'Review Credentials',
        description: 'Review submitted credentials',
        category: 'approve',
      },
      {
        id: 'perm_view_assigned',
        name: 'View Assigned Credentials',
        description: 'View credentials assigned for review',
        category: 'view',
      },
    ],
  },
  {
    id: 'clinical',
    name: 'Clinical User',
    hierarchy: 2,
    description: 'Clinical staff access',
    permissions: [
      {
        id: 'perm_view_own',
        name: 'View Own Credentials',
        description: 'View own credential data',
        category: 'view',
      },
      {
        id: 'perm_edit_own',
        name: 'Edit Own Credentials',
        description: 'Edit own credential submissions',
        category: 'edit',
      },
    ],
  },
  {
    id: 'user',
    name: 'User',
    hierarchy: 1,
    description: 'Standard user access',
    permissions: [
      {
        id: 'perm_submit',
        name: 'Submit Credentials',
        description: 'Submit credential documents',
        category: 'edit',
      },
      {
        id: 'perm_view_own_data',
        name: 'View Own Data',
        description: 'View own credential and profile data',
        category: 'view',
      },
    ],
  },
];

/**
 * Initialize default roles
 */
export function initializeRoles(): void {
  const existing = loadAllRoles();
  if (existing.length === 0) {
    for (const role of DEFAULT_ROLES) {
      saveRole(role);
    }
  }
}

/**
 * Create new role
 */
export function createRole(
  name: string,
  hierarchy: number,
  permissions: Permission[]
): Role {
  return {
    id: `role_${Date.now()}`,
    name,
    hierarchy,
    permissions,
    description: '',
  };
}

/**
 * Save role
 */
export function saveRole(role: Role): void {
  const roles = loadAllRoles();
  const existing = roles.findIndex((r) => r.id === role.id);
  if (existing >= 0) {
    roles[existing] = role;
  } else {
    roles.push(role);
  }
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
}

/**
 * Load role by ID
 */
export function loadRole(id: string): Role | null {
  const roles = loadAllRoles();
  return roles.find((r) => r.id === id) || null;
}

/**
 * Load all roles
 */
export function loadAllRoles(): Role[] {
  try {
    const data = localStorage.getItem(ROLES_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_ROLES;
  } catch {
    return DEFAULT_ROLES;
  }
}

/**
 * Delete role
 */
export function deleteRole(id: string): void {
  const roles = loadAllRoles().filter((r) => r.id !== id);
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
}

/**
 * Assign role to user
 */
export function assignRoleToUser(assignment: RoleAssignment): void {
  const assignments = loadAllAssignments();
  // Remove existing assignment
  const filtered = assignments.filter((a) => a.userId !== assignment.userId);
  filtered.push(assignment);
  localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Get user's roles
 */
export function getUserRoles(userId: string): Role[] {
  const assignments = loadAllAssignments();
  const userAssignments = assignments.filter((a) => {
    if (a.userId !== userId) return false;
    if (a.expiresAt && new Date(a.expiresAt) < new Date()) return false;
    return true;
  });

  return userAssignments.map((a) => loadRole(a.roleId)).filter((r): r is Role => r !== null);
}

/**
 * Get user's highest role in hierarchy
 */
export function getUserHighestRole(userId: string): Role | null {
  const roles = getUserRoles(userId);
  if (roles.length === 0) return null;
  return roles.reduce((highest, current) =>
    current.hierarchy > highest.hierarchy ? current : highest
  );
}

/**
 * Load all role assignments
 */
export function loadAllAssignments(): RoleAssignment[] {
  try {
    const data = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Check if user has permission
 */
export function userHasPermission(
  userId: string,
  permissionId: string
): boolean {
  const roles = getUserRoles(userId);
  return roles.some((role) =>
    role.permissions.some((p) => p.id === permissionId)
  );
}

/**
 * Check if user has any permission in category
 */
export function userHasPermissionCategory(
  userId: string,
  category: string
): boolean {
  const roles = getUserRoles(userId);
  return roles.some((role) =>
    role.permissions.some((p) => p.category === category)
  );
}

/**
 * Get user's permissions
 */
export function getUserPermissions(userId: string): Permission[] {
  const roles = getUserRoles(userId);
  const permissions = new Map<string, Permission>();

  for (const role of roles) {
    for (const perm of role.permissions) {
      permissions.set(perm.id, perm);
    }
  }

  return Array.from(permissions.values());
}

/**
 * Check if user can perform action on resource
 */
export function userCanAccessResource(
  userId: string,
  resourceType: string,
  action: 'view' | 'edit' | 'approve' | 'override' | 'export' | 'delete'
): boolean {
  const highestRole = getUserHighestRole(userId);
  if (!highestRole) return false;

  // Admin can do everything
  if (highestRole.id === 'admin') return true;

  // Check permissions
  return highestRole.permissions.some(
    (p) =>
      p.category === action &&
      (resourceType === '*' || p.name.toLowerCase().includes(resourceType.toLowerCase()))
  );
}

/**
 * Create permission
 */
export function createPermission(
  name: string,
  category: 'view' | 'edit' | 'approve' | 'override' | 'export' | 'delete' | 'admin',
  description?: string
): Permission {
  return {
    id: `perm_${Date.now()}`,
    name,
    category,
    description: description || '',
  };
}

/**
 * Get role hierarchy level as string
 */
export function getRoleHierarchyLabel(hierarchy: number): string {
  const labels: { [key: number]: string } = {
    1: 'Entry Level',
    2: 'Staff',
    3: 'Supervisor',
    4: 'Manager',
    5: 'Administrator',
  };
  return labels[hierarchy] || 'Unknown';
}

/**
 * Validate role hierarchy (can user manage another user's role)
 */
export function canManageRole(userId: string, targetRoleId: string): boolean {
  const userHighestRole = getUserHighestRole(userId);
  const targetRole = loadRole(targetRoleId);

  if (!userHighestRole || !targetRole) return false;

  // Can only manage roles lower in hierarchy
  return userHighestRole.hierarchy > targetRole.hierarchy;
}
