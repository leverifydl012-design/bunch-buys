import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Package, Calendar, User } from 'lucide-react';
import type { PurchaseOrderWithDetails } from '@/hooks/usePurchaseOrders';
import { useInboundShipments } from '@/hooks/useInboundShipments';

interface PODetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrderWithDetails | null;
  canApprove: boolean;
  canCreateShipment: boolean;
  onApprove: () => void;
  onCreateShipment: () => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  submitted: { label: 'Pending Approval', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  received: { label: 'Received', variant: 'default' },
  cancelled: { label: 'Rejected', variant: 'destructive' },
};

const shipmentStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  created: { label: 'Created', variant: 'outline' },
  in_transit: { label: 'In Transit', variant: 'secondary' },
  delivered: { label: 'Delivered', variant: 'default' },
};

export function PODetailSheet({
  open,
  onOpenChange,
  purchaseOrder,
  canApprove,
  canCreateShipment,
  onApprove,
  onCreateShipment,
}: PODetailSheetProps) {
  const { data: shipments } = useInboundShipments(purchaseOrder?.id);

  if (!purchaseOrder) return null;

  const config = statusConfig[purchaseOrder.status] || statusConfig.draft;
  const isApproved = purchaseOrder.status === 'approved';
  const isPending = purchaseOrder.status === 'submitted';
  const hasShipment = shipments && shipments.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>PO-{purchaseOrder.id.slice(0, 8).toUpperCase()}</span>
            <Badge 
              variant={config.variant}
              className={isApproved ? 'bg-success text-success-foreground' : ''}
            >
              {config.label}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Supplier</div>
              <div className="font-medium">{purchaseOrder.supplier?.name || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Cost</div>
              <div className="font-medium">${purchaseOrder.total_cost.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(purchaseOrder.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created By</span>
            </div>
          </div>

          {/* Approval Info */}
          {purchaseOrder.approved_by && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-success font-medium">
                <CheckCircle className="h-4 w-4" />
                Approved on {purchaseOrder.approved_at ? new Date(purchaseOrder.approved_at).toLocaleDateString() : 'N/A'}
              </div>
              {purchaseOrder.approval_notes && (
                <p className="text-sm mt-1 text-muted-foreground">{purchaseOrder.approval_notes}</p>
              )}
            </div>
          )}

          {purchaseOrder.status === 'cancelled' && purchaseOrder.approval_notes && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <XCircle className="h-4 w-4" />
                Rejected
              </div>
              <p className="text-sm mt-1 text-muted-foreground">{purchaseOrder.approval_notes}</p>
            </div>
          )}

          <Separator />

          {/* Items */}
          <div>
            <h4 className="font-medium mb-3">Items ({purchaseOrder.items?.length || 0})</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.sku?.sku || 'N/A'}</TableCell>
                    <TableCell className="text-sm">{item.sku?.product?.title || 'N/A'}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unit_cost}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${(item.quantity * item.unit_cost).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Shipments */}
          {shipments && shipments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Shipments
                </h4>
                <div className="space-y-2">
                  {shipments.map((shipment) => {
                    const shipConfig = shipmentStatusConfig[shipment.status] || shipmentStatusConfig.created;
                    return (
                      <div key={shipment.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{shipment.shipment_reference}</span>
                          <Badge variant={shipConfig.variant}>{shipConfig.label}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {shipment.cartons} cartons • {shipment.weight_per_carton} lbs each
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex gap-3">
            {isPending && canApprove && (
              <Button onClick={onApprove} className="flex-1 gap-2">
                <CheckCircle className="h-4 w-4" />
                Review & Approve
              </Button>
            )}
            {isApproved && canCreateShipment && !hasShipment && (
              <Button onClick={onCreateShipment} className="flex-1 gap-2">
                <Package className="h-4 w-4" />
                Create Shipment
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
