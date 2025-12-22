import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface PurchaseOrderWithDetails {
  id: string;
  organization_id: string;
  supplier_id: string;
  status: string;
  total_cost: number;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  created_at: string;
  supplier: {
    id: string;
    name: string;
  } | null;
  items: Array<{
    id: string;
    sku_id: string;
    quantity: number;
    unit_cost: number;
    sku: {
      id: string;
      sku: string;
      asin: string | null;
      product: {
        title: string;
      } | null;
    } | null;
  }>;
}

export function usePurchaseOrders() {
  const { currentOrg, user, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['purchaseOrders', currentOrg?.id, user?.id, isAdmin],
    queryFn: async () => {
      if (!currentOrg?.id) return [];

      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(id, name),
          items:purchase_order_items(
            id,
            sku_id,
            quantity,
            unit_cost,
            sku:skus(
              id,
              sku,
              asin,
              product:products(title)
            )
          )
        `)
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });

      // Non-admin users can only see their own POs
      if (!isAdmin && user?.id) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching purchase orders:', error);
        throw error;
      }

      return data as unknown as PurchaseOrderWithDetails[];
    },
    enabled: !!currentOrg?.id,
  });
}

export function useUpdatePOStatus() {
  const queryClient = useQueryClient();
  const { currentOrg, user, isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({
      poId,
      status,
      approvalNotes,
      approvedBy,
    }: {
      poId: string;
      status: string;
      approvalNotes?: string;
      approvedBy?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (approvalNotes !== undefined) {
        updateData.approval_notes = approvalNotes;
      }
      
      if (approvedBy) {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', poId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders', currentOrg?.id, user?.id, isAdmin] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { currentOrg, user, isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({
      supplierId,
      items,
      status = 'draft',
    }: {
      supplierId: string;
      items: Array<{ skuId: string; quantity: number; unitCost: number }>;
      status?: string;
    }) => {
      if (!currentOrg?.id || !user?.id) throw new Error('Not authenticated');

      const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          organization_id: currentOrg.id,
          supplier_id: supplierId,
          status,
          total_cost: totalCost,
          created_by: user.id,
        })
        .select()
        .single();

      if (poError) throw poError;

      const poItems = items.map((item) => ({
        purchase_order_id: po.id,
        sku_id: item.skuId,
        quantity: item.quantity,
        unit_cost: item.unitCost,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(poItems);

      if (itemsError) throw itemsError;

      return po;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders', currentOrg?.id, user?.id, isAdmin] });
      toast({
        title: 'Success',
        description: 'Purchase order created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
