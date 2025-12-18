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
import { Plus, Search, MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react';
import { POStatus } from '@/types';

// Demo data
const demoPOs = [
  { id: 'PO-001234', supplier: 'Global Parts Inc.', status: 'approved' as POStatus, totalCost: 12500.00, items: 15, createdAt: '2024-03-01', createdBy: 'Mike Purchasing' },
  { id: 'PO-001235', supplier: 'Widget Supply Co.', status: 'submitted' as POStatus, totalCost: 8750.50, items: 8, createdAt: '2024-03-05', createdBy: 'Sarah Buyer' },
  { id: 'PO-001236', supplier: 'TechParts Direct', status: 'draft' as POStatus, totalCost: 3200.00, items: 5, createdAt: '2024-03-08', createdBy: 'Mike Purchasing' },
  { id: 'PO-001237', supplier: 'Global Parts Inc.', status: 'received' as POStatus, totalCost: 18400.75, items: 22, createdAt: '2024-02-15', createdBy: 'Mike Purchasing' },
  { id: 'PO-001238', supplier: 'Office Supply Hub', status: 'cancelled' as POStatus, totalCost: 950.00, items: 3, createdAt: '2024-02-20', createdBy: 'Sarah Buyer' },
];

const statusConfig: Record<POStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  received: { label: 'Received', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purchaseOrders] = useState(demoPOs);

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track purchase orders</p>
        </div>
        <Button className="gap-2">
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
            <div className="text-2xl font-bold text-warning">
              {purchaseOrders.filter((po) => po.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-success">
              {purchaseOrders.filter((po) => po.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold text-foreground">
              ${purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0).toLocaleString()}
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
              {filteredPOs.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono font-medium">{po.id}</TableCell>
                  <TableCell>{po.supplier}</TableCell>
                  <TableCell>{po.items} items</TableCell>
                  <TableCell className="text-right font-medium">
                    ${po.totalCost.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={statusConfig[po.status].variant}
                      className={po.status === 'approved' || po.status === 'received' ? 'bg-success text-success-foreground' : ''}
                    >
                      {statusConfig[po.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(po.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {po.status === 'submitted' && (
                          <>
                            <DropdownMenuItem className="text-success">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
