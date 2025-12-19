import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface InboundShipment {
  id: string;
  purchase_order_id: string;
  organization_id: string;
  status: string;
  shipment_reference: string;
  cartons: number;
  weight_per_carton: number;
  length: number;
  width: number;
  height: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useInboundShipments(poId?: string) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ['inboundShipments', currentOrg?.id, poId],
    queryFn: async () => {
      if (!currentOrg?.id) return [];

      let query = supabase
        .from('inbound_shipments')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });

      if (poId) {
        query = query.eq('purchase_order_id', poId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching shipments:', error);
        throw error;
      }

      return data as InboundShipment[];
    },
    enabled: !!currentOrg?.id,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  const { currentOrg, user } = useAuth();

  return useMutation({
    mutationFn: async ({
      purchaseOrderId,
      cartons,
      weightPerCarton,
      length,
      width,
      height,
    }: {
      purchaseOrderId: string;
      cartons: number;
      weightPerCarton: number;
      length: number;
      width: number;
      height: number;
    }) => {
      if (!currentOrg?.id || !user?.id) throw new Error('Not authenticated');

      // Generate shipment reference
      const shipmentReference = `SHIP-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase
        .from('inbound_shipments')
        .insert({
          purchase_order_id: purchaseOrderId,
          organization_id: currentOrg.id,
          shipment_reference: shipmentReference,
          cartons,
          weight_per_carton: weightPerCarton,
          length,
          width,
          height,
          created_by: user.id,
          status: 'created',
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inboundShipments', currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ['inboundShipments', currentOrg?.id, variables.purchaseOrderId] });
      toast({
        title: 'Success',
        description: 'Shipment created successfully',
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

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async ({
      shipmentId,
      status,
    }: {
      shipmentId: string;
      status: 'created' | 'in_transit' | 'delivered';
    }) => {
      const { error } = await supabase
        .from('inbound_shipments')
        .update({ status })
        .eq('id', shipmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inboundShipments', currentOrg?.id] });
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
