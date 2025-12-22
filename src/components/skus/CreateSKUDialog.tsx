import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Barcode } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CreateSKUDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSKUDialog({ open, onOpenChange }: CreateSKUDialogProps) {
  const [productId, setProductId] = useState('');
  const [sku, setSku] = useState('');
  const [asin, setAsin] = useState('');
  const [fnsku, setFnsku] = useState('');
  const [cost, setCost] = useState('');

  const { data: products = [] } = useProducts();
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();

  const createSKU = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('skus')
        .insert({
          product_id: productId,
          sku,
          asin: asin || null,
          fnsku: fnsku || null,
          cost: parseFloat(cost) || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus', currentOrg?.id] });
      toast({
        title: 'SKU created',
        description: 'New SKU has been added successfully',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSKU.mutate();
  };

  const resetForm = () => {
    setProductId('');
    setSku('');
    setAsin('');
    setFnsku('');
    setCost('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5" />
            Add New SKU
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select value={productId} onValueChange={setProductId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.title} {product.brand && `(${product.brand})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {products.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No products found. Create a product first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU Code *</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g., WGT-001-BLK"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asin">ASIN</Label>
              <Input
                id="asin"
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
                placeholder="e.g., B08X1234AB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fnsku">FNSKU</Label>
              <Input
                id="fnsku"
                value={fnsku}
                onChange={(e) => setFnsku(e.target.value)}
                placeholder="e.g., X001ABC123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSKU.isPending || !productId || !sku.trim()}
            >
              {createSKU.isPending ? 'Creating...' : 'Create SKU'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
