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
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { ApprovalStatus } from '@/types';

// Demo data
const demoApprovals = [
  { id: '1', entityType: 'Purchase Order', entityId: 'PO-001235', description: 'Widget Supply Co. - $8,750.50', requestedBy: 'Mike Purchasing', status: 'pending' as ApprovalStatus, createdAt: '2024-03-05' },
  { id: '2', entityType: 'Purchase Order', entityId: 'PO-001239', description: 'TechParts Direct - $5,200.00', requestedBy: 'Sarah Buyer', status: 'pending' as ApprovalStatus, createdAt: '2024-03-06' },
  { id: '3', entityType: 'Inventory Adjustment', entityId: 'ADJ-0042', description: 'Write-off damaged inventory', requestedBy: 'John Warehouse', status: 'pending' as ApprovalStatus, createdAt: '2024-03-07' },
  { id: '4', entityType: 'Purchase Order', entityId: 'PO-001234', description: 'Global Parts Inc. - $12,500.00', requestedBy: 'Mike Purchasing', status: 'approved' as ApprovalStatus, createdAt: '2024-03-01' },
  { id: '5', entityType: 'New Supplier', entityId: 'SUP-0012', description: 'Pacific Wholesale Co.', requestedBy: 'Sarah Buyer', status: 'rejected' as ApprovalStatus, createdAt: '2024-02-28' },
];

const statusConfig: Record<ApprovalStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-warning/10 text-warning' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function Approvals() {
  const [approvals] = useState(demoApprovals);
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const completedApprovals = approvals.filter((a) => a.status !== 'pending');

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
                  {approvals.filter((a) => a.status === 'approved').length}
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
                  {approvals.filter((a) => a.status === 'rejected').length}
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
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{approval.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {approval.entityType} • {approval.entityId} • Requested by {approval.requestedBy}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedApprovals.map((approval) => {
                const config = statusConfig[approval.status];
                return (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <Badge variant="outline">{approval.entityType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{approval.entityId}</TableCell>
                    <TableCell>{approval.description}</TableCell>
                    <TableCell>{approval.requestedBy}</TableCell>
                    <TableCell>
                      <Badge className={config.className}>
                        <config.icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
