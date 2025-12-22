import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';
import { usePurchaseOrders, useUpdatePOStatus } from '@/hooks/usePurchaseOrders';
import { useAuth } from '@/hooks/useAuth';
import { ApprovalDialog } from '@/components/purchase-orders/ApprovalDialog';
import type { PurchaseOrderWithDetails } from '@/hooks/usePurchaseOrders';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-warning/10 text-warning' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function Approvals() {
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const updateStatus = useUpdatePOStatus();
  const { user } = useAuth();
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderWithDetails | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);

  const pendingApprovals = purchaseOrders.filter((po) => po.status === 'submitted');
  const completedApprovals = purchaseOrders.filter((po) => po.status === 'approved' || po.status === 'cancelled');

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

  const getStatusFromPOStatus = (status: string): 'pending' | 'approved' | 'rejected' => {
    if (status === 'submitted') return 'pending';
    if (status === 'approved') return 'approved';
    return 'rejected';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve pending requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-foreground">{pendingApprovals.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="text-2xl font-bold text-foreground">
                  {purchaseOrders.filter((po) => po.status === 'approved').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rejected</div>
                <div className="text-2xl font-bold text-foreground">
                  {purchaseOrders.filter((po) => po.status === 'cancelled').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Pending Approvals ({pendingApprovals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {po.supplier?.name} - ${(po.total_cost || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Purchase Order • PO-{po.id.slice(0, 8).toUpperCase()} • {po.items?.length || 0} items
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedPO(po);
                        handleReject('');
                      }}
                      disabled={updateStatus.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-success hover:bg-success/90 text-success-foreground"
                      onClick={() => handleOpenApproval(po)}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Approvals */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">History</CardTitle>
        </CardHeader>
        <CardContent>
          {completedApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No approval history
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedApprovals.map((po) => {
                  const status = getStatusFromPOStatus(po.status);
                  const config = statusConfig[status];
                  return (
                    <TableRow key={po.id}>
                      <TableCell>
                        <Badge variant="outline">Purchase Order</Badge>
                      </TableCell>
                      <TableCell className="font-mono">PO-{po.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{po.supplier?.name} - ${(po.total_cost || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={config.className}>
                          <config.icon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {po.approved_at ? new Date(po.approved_at).toLocaleDateString() : new Date(po.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedPO && (
        <ApprovalDialog
          open={approvalOpen}
          onOpenChange={setApprovalOpen}
          poId={selectedPO.id}
          poNumber={`PO-${selectedPO.id.slice(0, 8).toUpperCase()}`}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={updateStatus.isPending}
        />
      )}
    </div>
  );
}
