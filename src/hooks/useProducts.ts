import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  title: string;
  brand: string | null;
  organization_id: string;
  created_at: string | null;
}

export function useProducts() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ['products', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('title');

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data as Product[];
    },
    enabled: !!currentOrg?.id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async ({
      title,
      brand,
    }: {
      title: string;
      brand?: string;
    }) => {
      if (!currentOrg?.id) throw new Error('No organization selected');

      const { data, error } = await supabase
        .from('products')
        .insert({
          organization_id: currentOrg.id,
          title,
          brand: brand || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', currentOrg?.id] });
      toast({
        title: 'Product created',
        description: 'New product has been added successfully',
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
