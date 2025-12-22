import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  name: string;
  contact_email: string | null;
  payment_terms: string | null;
  organization_id: string;
  created_at: string | null;
}

export function useSuppliers() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ['suppliers', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('name');

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      return data as Supplier[];
    },
    enabled: !!currentOrg?.id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      contactEmail,
      paymentTerms,
    }: {
      name: string;
      contactEmail?: string;
      paymentTerms?: string;
    }) => {
      if (!currentOrg?.id) throw new Error('No organization selected');

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          organization_id: currentOrg.id,
          name,
          contact_email: contactEmail || null,
          payment_terms: paymentTerms || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', currentOrg?.id] });
      toast({
        title: 'Supplier created',
        description: 'New supplier has been added successfully',
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
