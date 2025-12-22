import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component for conditional rendering based on user role
 * Use this to show/hide UI elements based on permissions
 */
export function RoleGuard({ 
  children, 
  allowedRoles,
  requireAdmin = false,
  fallback = null 
}: RoleGuardProps) {
  const { role, isAdmin } = useAuth();

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  // Check allowed roles
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // If no role restrictions specified and user is not admin when required
  if (!allowedRoles && !requireAdmin) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

/**
 * Hook for checking user permissions
 */
export function usePermissions() {
  const { role, isAdmin, user } = useAuth();

  return {
    // Basic role checks
    isAdmin,
    isUser: !!user && !isAdmin,
    
    // Permission checks
    canCreatePO: !!user, // All authenticated users can create POs
    canViewAllPOs: isAdmin,
    canApprovePO: isAdmin,
    canEditPO: isAdmin,
    canDeletePO: isAdmin,
    canCreateShipment: isAdmin,
    canManageShipments: isAdmin,
    canManageUsers: isAdmin,
    canAccessSettings: isAdmin,
    canViewDashboard: !!user,
    
    // Helper function
    hasRole: (roles: AppRole[]) => role && roles.includes(role),
  };
}
