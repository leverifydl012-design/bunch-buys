import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Truck, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useInboundShipments, useUpdateShipmentStatus } from '@/hooks/useInboundShipments';
import { format } from 'date-fns';

const statusConfig = {
  created: { label: 'Created', variant: 'secondary' as const, icon: Clock },
  in_transit: { label: 'In Transit', variant: 'default' as const, icon: Truck },
  delivered: { label: 'Delivered', variant: 'outline' as const, icon: CheckCircle },
};

export default function Shipments() {
  const { data: shipments, isLoading, error } = useInboundShipments();
  const updateStatus = useUpdateShipmentStatus();
  const [filter, setFilter] = useState<string>('all');

  const filteredShipments = shipments?.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  }) || [];

  const handleStatusChange = (shipmentId: string, status: 'created' | 'in_transit' | 'delivered') => {
    updateStatus.mutate({ shipmentId, status });
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
      </div>

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
              <p className="text-sm">Create shipments from approved purchase orders</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cartons</TableHead>
                  <TableHead>Weight/Carton</TableHead>
                  <TableHead>Dimensions (L×W×H)</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => {
                  const config = statusConfig[shipment.status as keyof typeof statusConfig] || statusConfig.created;
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono font-medium">
                        {shipment.shipment_reference}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.cartons}</TableCell>
                      <TableCell>{shipment.weight_per_carton} kg</TableCell>
                      <TableCell>
                        {shipment.length} × {shipment.width} × {shipment.height} cm
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
    </div>
  );
}
