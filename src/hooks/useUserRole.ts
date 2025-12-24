import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export function useUserRole() {
  const { user, currentOrg } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ['userRole', user?.id, currentOrg?.id],
    queryFn: async () => {
      if (!user?.id || !currentOrg?.id) return null;

      const { data, error } = await supabase
        .rpc('get_user_org_role', {
          _user_id: user.id,
          _org_id: currentOrg.id,
        });

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data as AppRole | null;
    },
    enabled: !!user?.id && !!currentOrg?.id,
  });

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isPurchasing = role === 'purchasing';
  const isViewer = role === 'viewer';
  const canApprove = isAdmin || isManager;
  const canCreatePO = !!role; // All members can create POs
  const canCreateShipment = !!role; // All members can create shipments for their approved POs

  return {
    role,
    isLoading,
    isAdmin,
    isManager,
    isPurchasing,
    isViewer,
    canApprove,
    canCreatePO,
    canCreateShipment,
  };
}
