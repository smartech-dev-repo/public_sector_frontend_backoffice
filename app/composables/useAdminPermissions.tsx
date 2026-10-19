"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfile } from './modules/useProfile';

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
  | 'loan-terms:manage'
  | 'loan-requests:review'
  | 'client-loans:read'
  | 'clients:read'
  | 'agents:onboarding-access:manage'
  | 'clients:analytics:read'
  | 'agents:analytics:read'
  | 'departments:manage'
  | 'agents:recruitment:read'
  | 'agents:recruitment:analytics:read'
  | 'agents:recruitment:manage'
  | 'reconciliation:read'
  | 'clients:onboard'
  | 'loan-products:manage'
  | 'loan-settings:manage';

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
  'loan-terms:manage',
  'loan-requests:review',
  'client-loans:read',
  'clients:read',
  'agents:onboarding-access:manage',
  'clients:analytics:read',
  'agents:analytics:read',
  'departments:manage',
  'agents:recruitment:read',
  'agents:recruitment:analytics:read',
  'agents:recruitment:manage',
  'reconciliation:read',
  'clients:onboard',
  'loan-products:manage',
  'loan-settings:manage',
];

/**
 * Route to Permission mappings for top-level pages & sub-routes
 */
export const ROUTE_PERMISSIONS: Record<string, AdminPermission[]> = {
  '/dashboard/broadsheet': ['loans:upload', 'repayments:upload', 'ippis:upload', 'client-loans:read'],
  '/dashboard/uploads': ['documents:read', 'loans:upload', 'repayments:upload', 'ippis:upload'],
  '/dashboard/loan-terms': ['loan-terms:manage', 'loan-products:manage', 'loan-settings:manage'],
  '/dashboard/loan-products': ['loan-products:manage'],
  '/dashboard/invites': ['agents:recruitment:read', 'agents:recruitment:manage', 'agents:recruitment:analytics:read'],
  '/dashboard/agent': ['agents:read', 'agents:review'],
  '/dashboard/agent-management': ['agents:read', 'agents:review', 'agents:sessions:revoke', 'agents:onboarding-access:manage', 'agents:analytics:read'],
  '/dashboard/agent-security': ['agents:sessions:revoke', 'agents:review'],
  '/dashboard/loan-requests': ['loan-requests:review', 'client-loans:read'],
  '/dashboard/client-loans': ['client-loans:read'],
  '/dashboard/clients': ['clients:read', 'clients:review', 'clients:onboard', 'clients:analytics:read'],
  '/dashboard/customer-details': ['clients:read', 'clients:review'],
  '/dashboard/reports': ['audit:read', 'reconciliation:read', 'clients:analytics:read', 'agents:analytics:read'],
  '/dashboard/audit-logs': ['audit:read'],
  '/dashboard/reconciliation': ['reconciliation:read'],
  '/dashboard/analytics': ['clients:analytics:read', 'agents:analytics:read'],
  '/dashboard/team': ['roles:manage', 'admins:create', 'permissions:manage', 'departments:manage'],
  '/dashboard/roles': ['roles:manage', 'permissions:manage'],
  '/dashboard/admins': ['admins:create', 'roles:manage'],
};

export const useAdminPermissions = () => {
  const { profile, fetchProfile, loading } = useProfile();

  const [cachedPermissions, setCachedPermissions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('public_sector_permissions');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  const [cachedRole, setCachedRole] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('public_sector_role') || '';
    }
    return '';
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('public_sector_permissions');
          if (stored) setCachedPermissions(JSON.parse(stored));
          const r = localStorage.getItem('public_sector_role');
          if (r) setCachedRole(r);
        } catch {}
      }
    };

    window.addEventListener('public_sector_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('public_sector_profile_updated', handleProfileUpdate);
  }, []);

  const permissions = useMemo(() => {
    if (profile) {
      if (Array.isArray(profile.permissions) && profile.permissions.length > 0) {
        return profile.permissions;
      }
      if (Array.isArray(profile.role?.permissions) && profile.role.permissions.length > 0) {
        return profile.role.permissions;
      }
    }
    return cachedPermissions;
  }, [profile, cachedPermissions]);

  const roleName = useMemo(() => {
    return profile?.role?.name || cachedRole || '';
  }, [profile, cachedRole]);

  const isSuperAdmin = useMemo(() => {
    const name = roleName.toUpperCase().trim();
    return name === 'SUPER_ADMIN' || name === 'SUPERADMIN' || name.includes('SUPER_ADMIN');
  }, [roleName]);

  const hasPermission = useCallback((permission: AdminPermission | AdminPermission[]): boolean => {
    if (isSuperAdmin) return true;
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    }
    return permissions.includes(permission);
  }, [isSuperAdmin, permissions]);

  const hasAnyPermission = useCallback((perms: AdminPermission[]): boolean => {
    if (isSuperAdmin) return true;
    return perms.some(p => permissions.includes(p));
  }, [isSuperAdmin, permissions]);

  const hasAllPermissions = useCallback((perms: AdminPermission[]): boolean => {
    if (isSuperAdmin) return true;
    return perms.every(p => permissions.includes(p));
  }, [isSuperAdmin, permissions]);

  const canAccessRoute = useCallback((pathname: string): boolean => {
    if (isSuperAdmin) return true;
    for (const [route, requiredPerms] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        return requiredPerms.some(p => permissions.includes(p));
      }
    }
    // Default open for generic dashboard / settings
    return true;
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
