"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useProfile } from '@/app/composables/modules/useProfile';

export type Permission =
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

export const ALL_PERMISSIONS: Permission[] = [
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

export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard/broadsheet': ['ippis:upload', 'loans:upload', 'repayments:upload'],
  '/dashboard/uploads': ['loans:upload', 'repayments:upload', 'ippis:upload'],
  '/dashboard/ippis': ['ippis:upload'],
  '/dashboard/loan-terms': ['loan-products:manage', 'loan-terms:manage', 'loan-settings:manage'],
  '/dashboard/loan-products': ['loan-products:manage', 'loan-terms:manage'],
  '/dashboard/invites': ['agents:recruitment:read', 'agents:recruitment:manage', 'agents:recruitment:analytics:read'],
  '/dashboard/agent-management': ['agents:read', 'agents:review', 'agents:sessions:revoke', 'agents:onboarding-access:manage', 'agents:analytics:read'],
  '/dashboard/agent': ['agents:read', 'agents:review'],
  '/dashboard/agent-security': ['agents:review', 'agents:sessions:revoke'],
  '/dashboard/loan-requests': ['loan-requests:review', 'client-loans:read'],
  '/dashboard/client-loans': ['client-loans:read', 'loan-requests:review'],
  '/dashboard/clients': ['clients:read', 'clients:review', 'clients:onboard', 'clients:sessions:revoke'],
  '/dashboard/reports': ['audit:read', 'reconciliation:read', 'clients:analytics:read', 'agents:analytics:read'],
  '/dashboard/team': ['roles:manage', 'admins:create', 'permissions:manage', 'departments:manage'],
  '/dashboard/roles': ['roles:manage', 'permissions:manage'],
  '/dashboard/admins': ['admins:create'],
};

export const usePermissions = () => {
  const { profile } = useProfile();

  const [storedPermissions, setStoredPermissions] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('public_sector_permissions');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((p: any) => (typeof p === 'string' ? p : (p?.permission?.key || p?.key || ''))).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  });

  const [storedRole, setStoredRole] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('public_sector_role') || '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('public_sector_permissions');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setStoredPermissions(parsed.map((p: any) => (typeof p === 'string' ? p : (p?.permission?.key || p?.key || ''))).filter(Boolean));
          }
        }
        const r = localStorage.getItem('public_sector_role');
        if (r) setStoredRole(r);
      } catch {}
    }
  }, []);

  const permissions = useMemo<string[]>(() => {
    let list: any[] = [];
    if (profile) {
      const live = profile.permissions || profile.role?.permissions;
      if (Array.isArray(live) && live.length > 0) list = live;
    }
    if (list.length === 0) list = storedPermissions;
    return list.map((p: any) => (typeof p === 'string' ? p : (p?.permission?.key || p?.key || ''))).filter(Boolean);
  }, [profile, storedPermissions]);

  const roleName = useMemo<string>(() => {
    return (profile?.role?.name || (typeof profile?.role === 'string' ? profile.role : '') || storedRole || '').trim();
  }, [profile, storedRole]);

  const isSuperAdmin = useMemo<boolean>(() => {
    const r = roleName.toUpperCase();
    if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN') return true;
    if (permissions.includes('*')) return true;
    return false;
  }, [roleName, permissions]);

  const hasPermission = useCallback((permission: Permission | Permission[] | string | string[]): boolean => {
    if (isSuperAdmin) return true;
    if (!permissions || permissions.length === 0) return false;

    if (Array.isArray(permission)) {
      if (permission.length === 0) return true;
      return permission.some(p => permissions.includes(p));
    }
    return permissions.includes(permission);
  }, [isSuperAdmin, permissions]);

  const hasAllPermissions = useCallback((requiredPermissions: (Permission | string)[]): boolean => {
    if (isSuperAdmin) return true;
    if (!permissions || permissions.length === 0) return false;
    return requiredPermissions.every(p => permissions.includes(p));
  }, [isSuperAdmin, permissions]);

  const canAccessRoute = useCallback((route: string): boolean => {
    if (isSuperAdmin) return true;
    const matchingKey = Object.keys(ROUTE_PERMISSIONS).find(prefix => route.startsWith(prefix));
    if (!matchingKey) return true; // Unrestricted or public dashboard route
    const required = ROUTE_PERMISSIONS[matchingKey];
    return hasPermission(required);
  }, [isSuperAdmin, hasPermission]);

  return {
    permissions,
    roleName,
    isSuperAdmin,
    hasPermission,
    hasAllPermissions,
    canAccessRoute,
    loading: false,
  };
};

export interface CanProps {
  permission?: Permission | Permission[] | string | string[];
  permissions?: Permission | Permission[] | string | string[];
  allPermissions?: (Permission | string)[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  permission,
  permissions,
  allPermissions,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAllPermissions } = usePermissions();

  let allowed = true;
  const targetPermission = permission !== undefined ? permission : permissions;

  if (targetPermission !== undefined) {
    allowed = hasPermission(targetPermission);
  }

  if (allowed && allPermissions !== undefined && allPermissions.length > 0) {
    allowed = hasAllPermissions(allPermissions);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default usePermissions;
