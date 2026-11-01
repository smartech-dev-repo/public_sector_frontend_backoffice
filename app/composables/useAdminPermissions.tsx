"use client";

import { useLayoutEffect, useState, useEffect, useCallback, useMemo } from 'react';
import { useProfile } from './modules/useProfile';
import { decodeJwtPayload } from './core/useAuth';

export type AdminPermission =
  | 'admins:create'
  | 'roles:manage'
  | 'agents:read'
  | 'agents:review'
  | 'clients:review'
  | 'ippis:upload'
  | 'agents:sessions:revoke'
  | 'clients:sessions:revoke'
  | 'audit:read'
  | 'loans:upload'
  | 'repayments:upload'
  | 'documents:read'
  | 'permissions:manage'
  | 'wallets:read'
  | 'wallets:manage'
  | 'loan-products:manage'
  | 'management-fees:manage'
  | 'loan-settings:manage'
  | 'loan-requests:review'
  | 'client-loans:read'
  | 'clients:read'
  | 'departments:manage'
  | 'clients:onboard'
  | 'agents:onboarding-access:manage'
  | 'clients:analytics:read'
  | 'agents:analytics:read'
  | 'agents:recruitment:read'
  | 'agents:recruitment:analytics:read'
  | 'agents:recruitment:manage'
  | 'reconciliation:read';

export const ALL_PERMISSIONS: AdminPermission[] = [
  'admins:create',
  'roles:manage',
  'agents:read',
  'agents:review',
  'clients:review',
  'ippis:upload',
  'agents:sessions:revoke',
  'clients:sessions:revoke',
  'audit:read',
  'loans:upload',
  'repayments:upload',
  'documents:read',
  'permissions:manage',
  'wallets:read',
  'wallets:manage',
  'loan-products:manage',
  'management-fees:manage',
  'loan-settings:manage',
  'loan-requests:review',
  'client-loans:read',
  'clients:read',
  'departments:manage',
  'clients:onboard',
  'agents:onboarding-access:manage',
  'clients:analytics:read',
  'agents:analytics:read',
  'agents:recruitment:read',
  'agents:recruitment:analytics:read',
  'agents:recruitment:manage',
  'reconciliation:read',
];

/**
 * Route to Permission mappings for top-level pages & sub-routes
 */
export const ROUTE_PERMISSIONS: Record<string, AdminPermission[]> = {
  '/dashboard/broadsheet': ['loans:upload', 'repayments:upload', 'ippis:upload', 'documents:read'],
  '/dashboard/uploads': ['documents:read', 'loans:upload', 'repayments:upload', 'ippis:upload'],
  '/dashboard/ippis': ['ippis:upload'],
  '/dashboard/loan-terms': ['loan-products:manage', 'loan-settings:manage', 'loans:upload'],
  '/dashboard/loan-products': ['loan-products:manage'],
  '/dashboard/management-fees': ['management-fees:manage'],
  '/dashboard/invites': ['agents:recruitment:read', 'agents:recruitment:manage', 'agents:recruitment:analytics:read'],
  '/dashboard/agent': ['agents:read', 'agents:review'],
  '/dashboard/agent-details': ['agents:read', 'agents:review'],
  '/dashboard/agent-management': ['agents:read', 'agents:review', 'agents:sessions:revoke', 'agents:onboarding-access:manage', 'agents:analytics:read'],
  '/dashboard/agent-security': ['agents:sessions:revoke', 'agents:read', 'agents:review'],
  '/dashboard/loan-requests': ['loan-requests:review', 'client-loans:read', 'clients:read'],
  '/dashboard/client-loans': ['client-loans:read', 'clients:read'],
  '/dashboard/clients': ['clients:read', 'clients:review', 'clients:onboard', 'clients:analytics:read', 'ippis:upload', 'wallets:read', 'wallets:manage'],
  '/dashboard/customer-details': ['clients:read', 'clients:review'],
  '/dashboard/reports': ['audit:read', 'reconciliation:read', 'clients:analytics:read', 'agents:analytics:read'],
  '/dashboard/audit-logs': ['audit:read'],
  '/dashboard/reconciliation': ['reconciliation:read'],
  '/dashboard/analytics': ['clients:analytics:read', 'agents:analytics:read'],
  '/dashboard/team': ['roles:manage', 'admins:create', 'permissions:manage', 'departments:manage'],
  '/dashboard/roles': ['roles:manage', 'permissions:manage'],
  '/dashboard/admins': ['admins:create', 'roles:manage'],
};

export const normalizePermissionList = (raw: any): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((p: any) => {
    if (typeof p === 'string') return p.trim();
    if (p && typeof p === 'object') {
      return (
        p.key ||
        p.permission?.key ||
        p.name ||
        p.permission?.name ||
        p.slug ||
        p.permission?.slug ||
        ''
      );
    }
    return '';
  }).filter((s: string) => s.length > 0);
};

const readCachedPermissions = (): string[] => {
  try {
    const token = localStorage.getItem('token');
    const decoded = token ? decodeJwtPayload(token) : null;
    if (Array.isArray(decoded?.permissions)) {
      return normalizePermissionList(decoded.permissions);
    }
    const stored = localStorage.getItem('public_sector_permissions');
    return stored ? normalizePermissionList(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
};

export const useAdminPermissions = () => {
  const { profile, fetchProfile, loading } = useProfile();

  // Both start empty so the first browser render matches the server's, which has no
  // localStorage. The layout effect fills them in before the page is painted.
  const [cachedPermissions, setCachedPermissions] = useState<string[]>([]);
  const [cachedRole, setCachedRole] = useState<string>('');

  useLayoutEffect(() => {
    const readCachedSession = () => {
      setCachedPermissions(readCachedPermissions());
      setCachedRole(localStorage.getItem('public_sector_role') || '');
    };

    readCachedSession();
    window.addEventListener('public_sector_profile_updated', readCachedSession);
    return () => window.removeEventListener('public_sector_profile_updated', readCachedSession);
  }, []);

  const permissions = useMemo(() => {
    let list: any[] = [];
    if (profile) {
      if (Array.isArray(profile.permissions) && profile.permissions.length > 0) {
        list = profile.permissions;
      } else if (Array.isArray(profile.role?.permissions) && profile.role.permissions.length > 0) {
        list = profile.role.permissions;
      }
    }
    if (list.length === 0 && cachedPermissions.length > 0) {
      list = cachedPermissions;
    }
    return normalizePermissionList(list);
  }, [profile, cachedPermissions]);

  const roleName = useMemo(() => {
    const fromProfile = typeof profile?.role === 'string' ? profile.role : profile?.role?.name;
    return (fromProfile || cachedRole || '').trim();
  }, [profile, cachedRole]);

  // isSuperAdmin is ONLY true if roleName is strictly SUPER_ADMIN (never arbitrary substring)
  const isSuperAdmin = useMemo(() => {
    const name = roleName.toUpperCase().trim();
    return name === 'SUPER_ADMIN' || name === 'SUPERADMIN';
  }, [roleName]);

  const hasPermission = useCallback((permission: AdminPermission | AdminPermission[]): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.length === 0) return false;
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    }
    return permissions.includes(permission);
  }, [isSuperAdmin, permissions]);

  const hasAnyPermission = useCallback((perms: AdminPermission[]): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.length === 0) return false;
    return perms.some(p => permissions.includes(p));
  }, [isSuperAdmin, permissions]);

  const hasAllPermissions = useCallback((perms: AdminPermission[]): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.length === 0) return false;
    return perms.every(p => permissions.includes(p));
  }, [isSuperAdmin, permissions]);

  const canAccessRoute = useCallback((pathname: string): boolean => {
    if (isSuperAdmin) return true;
    // Allow basic non-permission authenticated pages
    if (pathname === '/dashboard' || pathname === '/dashboard/settings' || pathname === '/dashboard/me') {
      return true;
    }
    if (permissions.length === 0) return false;

    for (const [route, requiredPerms] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        return requiredPerms.some(p => permissions.includes(p));
      }
    }
    // Strict default deny for any unrecognized dashboard route
    return false;
  }, [isSuperAdmin, permissions]);

  return {
    permissions,
    isSuperAdmin,
    roleName,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    refreshPermissions: fetchProfile,
  };
};

/**
 * Declarative component to conditionally render UI based on required permissions.
 */
export function PermissionGate({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null,
}: {
  permission?: AdminPermission;
  anyPermission?: AdminPermission[];
  allPermissions?: AdminPermission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = useAdminPermissions();

  if (isSuperAdmin) return <>{children}</>;

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (anyPermission && !hasAnyPermission(anyPermission)) {
    return <>{fallback}</>;
  }

  if (allPermissions && !hasAllPermissions(allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
