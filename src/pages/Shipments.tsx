import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Truck, CheckCircle, Clock, Loader2, ExternalLink, Plus } from 'lucide-react';
import { useInboundShipments, useUpdateShipmentStatus } from '@/hooks/useInboundShipments';
import { usePurchaseOrders, type PurchaseOrderWithDetails } from '@/hooks/usePurchaseOrders';
import { CreateShipmentDialog } from '@/components/purchase-orders/CreateShipmentDialog';
import { format } from 'date-fns';

const statusConfig = {
  created: { label: 'Created', variant: 'secondary' as const, icon: Clock },
  in_transit: { label: 'In Transit', variant: 'default' as const, icon: Truck },
  delivered: { label: 'Delivered', variant: 'outline' as const, icon: CheckCircle },
};

const carrierConfig: Record<string, { label: string; trackingUrl: string }> = {
  fedex: { label: 'FedEx', trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=' },
  ups: { label: 'UPS', trackingUrl: 'https://www.ups.com/track?tracknum=' },
  usps: { label: 'USPS', trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' },
  dhl: { label: 'DHL', trackingUrl: 'https://www.dhl.com/us-en/home/tracking.html?tracking-id=' },
  other: { label: 'Other', trackingUrl: '' },
};

export default function Shipments() {
  const { data: shipments, isLoading, error } = useInboundShipments();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const updateStatus = useUpdateShipmentStatus();
  const [filter, setFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderWithDetails | null>(null);
  const [selectPODialogOpen, setSelectPODialogOpen] = useState(false);

  // Get approved POs that can be used for shipment creation
  const approvedPOs = purchaseOrders.filter(po => po.status === 'approved');

  const filteredShipments = shipments?.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  }) || [];

  const handleStatusChange = (shipmentId: string, status: 'created' | 'in_transit' | 'delivered') => {
    updateStatus.mutate({ shipmentId, status });
  };

  const handleCreateShipment = () => {
    if (approvedPOs.length === 0) {
      return;
    }
    setSelectPODialogOpen(true);
  };

  const handleSelectPO = (po: PurchaseOrderWithDetails) => {
    setSelectedPO(po);
    setSelectPODialogOpen(false);
    setCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-destructive">
          Error loading shipments: {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipments</h1>
          <p className="text-muted-foreground mt-1">Track and manage inbound shipments</p>
        </div>
        <Button className="gap-2" onClick={handleCreateShipment} disabled={approvedPOs.length === 0}>
          <Plus className="h-4 w-4" />
          Create Shipment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Shipments</div>
            <div className="text-2xl font-bold text-foreground">{shipments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="text-2xl font-bold text-warning">
              {shipments?.filter(s => s.status === 'created').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">In Transit</div>
            <div className="text-2xl font-bold text-primary">
              {shipments?.filter(s => s.status === 'in_transit').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Delivered</div>
            <div className="text-2xl font-bold text-success">
              {shipments?.filter(s => s.status === 'delivered').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approved POs for Shipment */}
      {approvedPOs.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Approved POs Ready for Shipment
            </CardTitle>
            <CardDescription>
              Select a PO to create an inbound shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {approvedPOs.map((po) => (
                <Card 
                  key={po.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectPO(po)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono font-medium">
                          PO-{po.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {po.supplier?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {po.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items • ${(po.total_cost || 0).toLocaleString()}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Truck className="h-4 w-4 mr-1" />
                        Ship
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inbound Shipments
          </CardTitle>
          <CardDescription>
            {filteredShipments.length} shipment{filteredShipments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shipments found</p>
              <p className="text-sm">Create shipments from approved purchase orders above</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cartons</TableHead>
                  <TableHead>Weight/Carton</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => {
                  const config = statusConfig[shipment.status as keyof typeof statusConfig] || statusConfig.created;
                  const StatusIcon = config.icon;
                  const carrierInfo = shipment.carrier ? carrierConfig[shipment.carrier] : null;
                  
                  return (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono font-medium">
                        {shipment.shipment_reference}
                      </TableCell>
                      <TableCell>
                        {carrierInfo ? (
                          <Badge variant="outline">{carrierInfo.label}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {shipment.tracking_number ? (
                          carrierInfo?.trackingUrl ? (
                            <a
                              href={`${carrierInfo.trackingUrl}${shipment.tracking_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              {shipment.tracking_number}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-mono">{shipment.tracking_number}</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.cartons}</TableCell>
                      <TableCell>{shipment.weight_per_carton} lbs</TableCell>
                      <TableCell>
                        {shipment.length}" × {shipment.width}" × {shipment.height}"
                      </TableCell>
                      <TableCell>
                        {shipment.created_at ? format(new Date(shipment.created_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={shipment.status}
                          onValueChange={(value) => 
                            handleStatusChange(shipment.id, value as 'created' | 'in_transit' | 'delivered')
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created">Created</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Shipment Dialog */}
      {selectedPO && (
        <CreateShipmentDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          purchaseOrder={selectedPO}
        />
      )}
    </div>
  );
}
