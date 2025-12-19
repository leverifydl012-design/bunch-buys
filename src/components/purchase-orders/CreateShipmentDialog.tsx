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
import { Package } from 'lucide-react';
import { useCreateShipment } from '@/hooks/useInboundShipments';
import type { PurchaseOrderWithDetails } from '@/hooks/usePurchaseOrders';

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrderWithDetails;
}

export function CreateShipmentDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: CreateShipmentDialogProps) {
  const [cartons, setCartons] = useState('1');
  const [weightPerCarton, setWeightPerCarton] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const createShipment = useCreateShipment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createShipment.mutate(
      {
        purchaseOrderId: purchaseOrder.id,
        cartons: parseInt(cartons) || 1,
        weightPerCarton: parseFloat(weightPerCarton) || 0,
        length: parseFloat(length) || 0,
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setCartons('1');
    setWeightPerCarton('');
    setLength('');
    setWidth('');
    setHeight('');
  };

  const totalItems = purchaseOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create FBA Inbound Shipment
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <div className="font-medium">PO: {purchaseOrder.id.slice(0, 8).toUpperCase()}</div>
          <div className="text-muted-foreground">
            {totalItems} items from {purchaseOrder.supplier?.name}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cartons">Number of Cartons</Label>
            <Input
              id="cartons"
              type="number"
              min="1"
              value={cartons}
              onChange={(e) => setCartons(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight per Carton (lbs)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={weightPerCarton}
              onChange={(e) => setWeightPerCarton(e.target.value)}
              placeholder="e.g., 25.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Dimensions per Carton (inches)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                step="0.1"
                min="0"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Length"
                required
              />
              <Input
                type="number"
                step="0.1"
                min="0"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="Width"
                required
              />
              <Input
                type="number"
                step="0.1"
                min="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createShipment.isPending}>
              {createShipment.isPending ? 'Creating...' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
