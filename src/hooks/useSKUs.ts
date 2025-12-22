import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface SKUWithProduct {
  id: string;
  sku: string;
  asin: string | null;
  fnsku: string | null;
  cost: number | null;
  product_id: string;
  created_at: string | null;
  product: {
    id: string;
    title: string;
    brand: string | null;
  } | null;
}

export function useSKUs() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ['skus', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];

      const { data, error } = await supabase
        .from('skus')
        .select(`
          *,
          product:products(id, title, brand)
        `)
        .eq('product.organization_id', currentOrg.id)
        .order('sku');

      if (error) {
        console.error('Error fetching SKUs:', error);
        throw error;
      }

      return (data || []).filter(s => s.product !== null) as SKUWithProduct[];
    },
    enabled: !!currentOrg?.id,
  });
}

export function useCreateProductWithSKU() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async ({
      title,
      brand,
      sku,
      asin,
      cost,
    }: {
      title: string;
      brand?: string;
      sku: string;
      asin?: string;
      cost?: number;
    }) => {
      if (!currentOrg?.id) throw new Error('No organization selected');

      // Create product first
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          organization_id: currentOrg.id,
          title,
          brand: brand || null,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Create SKU
      const { data: skuData, error: skuError } = await supabase
        .from('skus')
        .insert({
          product_id: product.id,
          sku,
          asin: asin || null,
          cost: cost || 0,
        })
        .select(`
          *,
          product:products(id, title, brand)
        `)
        .single();

      if (skuError) throw skuError;

      return skuData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus', currentOrg?.id] });
      toast({
        title: 'Product created',
        description: 'New product and SKU have been added successfully',
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
