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
import { Plus, Trash2, ClipboardList, Loader2 } from 'lucide-react';
import { useSuppliers, useCreateSupplier } from '@/hooks/useSuppliers';
import { useSKUs, useCreateProductWithSKU } from '@/hooks/useSKUs';
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrders';

interface CreatePODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface POItem {
  skuId: string;
  quantity: number;
  unitCost: number;
}

export function CreatePODialog({ open, onOpenChange }: CreatePODialogProps) {
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<POItem[]>([{ skuId: '', quantity: 1, unitCost: 0 }]);
  
  // New supplier form
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  
  // New product form
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductSKU, setNewProductSKU] = useState('');
  const [newProductCost, setNewProductCost] = useState('');

  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();
  const { data: skus = [], isLoading: skusLoading } = useSKUs();
  const createSupplier = useCreateSupplier();
  const createProduct = useCreateProductWithSKU();
  const createPO = useCreatePurchaseOrder();

  const handleAddItem = () => {
    setItems([...items, { skuId: '', quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof POItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'skuId') {
      newItems[index].skuId = value as string;
      // Auto-fill cost from SKU
      const sku = skus.find(s => s.id === value);
      if (sku?.cost) {
        newItems[index].unitCost = sku.cost;
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = parseInt(value as string) || 1;
    } else if (field === 'unitCost') {
      newItems[index].unitCost = parseFloat(value as string) || 0;
    }
    setItems(newItems);
  };

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) return;
    
    const result = await createSupplier.mutateAsync({
      name: newSupplierName.trim(),
      contactEmail: newSupplierEmail.trim() || undefined,
    });
    
    setSupplierId(result.id);
    setShowNewSupplier(false);
    setNewSupplierName('');
    setNewSupplierEmail('');
  };

  const handleCreateProduct = async () => {
    if (!newProductTitle.trim() || !newProductSKU.trim()) return;
    
    const result = await createProduct.mutateAsync({
      title: newProductTitle.trim(),
      sku: newProductSKU.trim(),
      cost: parseFloat(newProductCost) || 0,
    });
    
    // Add this SKU to items
    const newItems = [...items];
    const emptyIndex = newItems.findIndex(i => !i.skuId);
    if (emptyIndex >= 0) {
      newItems[emptyIndex].skuId = result.id;
      newItems[emptyIndex].unitCost = result.cost || 0;
    } else {
      newItems.push({ skuId: result.id, quantity: 1, unitCost: result.cost || 0 });
    }
    setItems(newItems);
    
    setShowNewProduct(false);
    setNewProductTitle('');
    setNewProductSKU('');
    setNewProductCost('');
  };

  const handleSubmit = (e: React.FormEvent, status: 'draft' | 'submitted') => {
    e.preventDefault();
    
    const validItems = items.filter(i => i.skuId && i.quantity > 0);
    if (!supplierId || validItems.length === 0) return;

    createPO.mutate(
      {
        supplierId,
        items: validItems,
        status,
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
    setSupplierId('');
    setItems([{ skuId: '', quantity: 1, unitCost: 0 }]);
    setShowNewSupplier(false);
    setShowNewProduct(false);
  };

  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const validItems = items.filter(i => i.skuId && i.quantity > 0);
  const canSubmit = supplierId && validItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Create Purchase Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e, 'submitted')} className="space-y-6">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label>Supplier *</Label>
            {!showNewSupplier ? (
              <div className="flex gap-2">
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={suppliersLoading ? 'Loading...' : 'Select supplier'} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={() => setShowNewSupplier(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="text-sm font-medium">Add New Supplier</div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Supplier Name *"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Contact Email"
                    value={newSupplierEmail}
                    onChange={(e) => setNewSupplierEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateSupplier}
                    disabled={!newSupplierName.trim() || createSupplier.isPending}
                  >
                    {createSupplier.isPending ? 'Adding...' : 'Add Supplier'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewSupplier(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Products *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewProduct(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                New Product
              </Button>
            </div>

            {showNewProduct && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="text-sm font-medium">Add New Product</div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Product Title *"
                    value={newProductTitle}
                    onChange={(e) => setNewProductTitle(e.target.value)}
                  />
                  <Input
                    placeholder="SKU Code *"
                    value={newProductSKU}
                    onChange={(e) => setNewProductSKU(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit Cost"
                    value={newProductCost}
                    onChange={(e) => setNewProductCost(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateProduct}
                    disabled={!newProductTitle.trim() || !newProductSKU.trim() || createProduct.isPending}
                  >
                    {createProduct.isPending ? 'Adding...' : 'Add Product'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewProduct(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={item.skuId}
                    onValueChange={(value) => handleItemChange(index, 'skuId', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={skusLoading ? 'Loading...' : 'Select product'} />
                    </SelectTrigger>
                    <SelectContent>
                      {skus.map((sku) => (
                        <SelectItem key={sku.id} value={sku.id}>
                          {sku.product?.title} - {sku.sku}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    className="w-24"
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-28"
                    placeholder="Unit $"
                    value={item.unitCost || ''}
                    onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-3 w-3 mr-1" />
              Add Line Item
            </Button>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium">Total Cost</span>
            <span className="text-xl font-bold">${totalCost.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={!canSubmit || createPO.isPending}
            >
              Save as Draft
            </Button>
            <Button type="submit" disabled={!canSubmit || createPO.isPending}>
              {createPO.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Submit for Approval'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
