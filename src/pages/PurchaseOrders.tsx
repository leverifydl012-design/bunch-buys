import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Eye, CheckCircle, Package, Loader2 } from 'lucide-react';
import { usePurchaseOrders, useUpdatePOStatus, type PurchaseOrderWithDetails } from '@/hooks/usePurchaseOrders';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { PODetailSheet } from '@/components/purchase-orders/PODetailSheet';
import { ApprovalDialog } from '@/components/purchase-orders/ApprovalDialog';
import { CreateShipmentDialog } from '@/components/purchase-orders/CreateShipmentDialog';
import { CreatePODialog } from '@/components/purchase-orders/CreatePODialog';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  submitted: { label: 'Pending Approval', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  received: { label: 'Received', variant: 'default' },
  cancelled: { label: 'Rejected', variant: 'destructive' },
};

export default function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderWithDetails | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const [createPOOpen, setCreatePOOpen] = useState(false);

  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const updateStatus = useUpdatePOStatus();
  const { canApprove, canCreatePO, canCreateShipment } = useUserRole();
  const { user } = useAuth();

  const filteredPOs = purchaseOrders.filter((po) => {
    const poNumber = `PO-${po.id.slice(0, 8).toUpperCase()}`;
    const matchesSearch =
      poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (po: PurchaseOrderWithDetails) => {
    setSelectedPO(po);
    setDetailOpen(true);
  };

  const handleOpenApproval = (po: PurchaseOrderWithDetails) => {
    setSelectedPO(po);
    setApprovalOpen(true);
  };

  const handleApprove = (notes: string) => {
    if (!selectedPO || !user?.id) return;
    updateStatus.mutate(
      { poId: selectedPO.id, status: 'approved', approvalNotes: notes, approvedBy: user.id },
      { onSuccess: () => setApprovalOpen(false) }
    );
  };

  const handleReject = (notes: string) => {
    if (!selectedPO || !user?.id) return;
    updateStatus.mutate(
      { poId: selectedPO.id, status: 'cancelled', approvalNotes: notes, approvedBy: user.id },
      { onSuccess: () => setApprovalOpen(false) }
    );
  };

  const handleOpenShipment = (po: PurchaseOrderWithDetails) => {
    setSelectedPO(po);
    setShipmentOpen(true);
  };

  const pendingCount = purchaseOrders.filter((po) => po.status === 'submitted').length;
  const approvedCount = purchaseOrders.filter((po) => po.status === 'approved').length;
  const totalValue = purchaseOrders.reduce((sum, po) => sum + (po.total_cost || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track purchase orders</p>
        </div>
        <Button className="gap-2" onClick={() => setCreatePOOpen(true)}>
          <Plus className="h-4 w-4" />
          Create PO
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total POs</div>
            <div className="text-2xl font-bold text-foreground">{purchaseOrders.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending Approval</div>
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-success">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold text-foreground">
              ${totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search POs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PO Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Purchase Orders ({filteredPOs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No purchase orders found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.map((po) => {
                  const config = statusConfig[po.status] || statusConfig.draft;
                  const isApproved = po.status === 'approved';
                  const isPending = po.status === 'submitted';
                  
                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono font-medium">
                        PO-{po.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>{po.supplier?.name || 'Unknown'}</TableCell>
                      <TableCell>{po.items?.length || 0} items</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(po.total_cost || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={config.variant}
                          className={isApproved ? 'bg-success text-success-foreground' : ''}
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(po.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(po)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {isPending && canApprove && (
                              <>
                                <DropdownMenuItem 
                                  className="text-success"
                                  onClick={() => handleOpenApproval(po)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve / Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {isApproved && canCreateShipment && (
                              <DropdownMenuItem onClick={() => handleOpenShipment(po)}>
                                <Package className="mr-2 h-4 w-4" />
                                Create Shipment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PODetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        purchaseOrder={selectedPO}
        canApprove={canApprove}
        canCreateShipment={canCreateShipment}
        onApprove={() => {
          setDetailOpen(false);
          setApprovalOpen(true);
        }}
        onCreateShipment={() => {
          setDetailOpen(false);
          setShipmentOpen(true);
        }}
      />

      {selectedPO && (
        <>
          <ApprovalDialog
            open={approvalOpen}
            onOpenChange={setApprovalOpen}
            poId={selectedPO.id}
            poNumber={`PO-${selectedPO.id.slice(0, 8).toUpperCase()}`}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={updateStatus.isPending}
          />

          <CreateShipmentDialog
            open={shipmentOpen}
            onOpenChange={setShipmentOpen}
            purchaseOrder={selectedPO}
          />
        </>
      )}

      <CreatePODialog
        open={createPOOpen}
        onOpenChange={setCreatePOOpen}
      />
    </div>
  );
}
