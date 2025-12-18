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
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Mail } from 'lucide-react';
import { Supplier } from '@/types';

// Demo data
const demoSuppliers: Supplier[] = [
  { id: '1', organizationId: '1', name: 'Global Parts Inc.', contactEmail: 'orders@globalparts.com', paymentTerms: 'Net 30', createdAt: '2024-01-10' },
  { id: '2', organizationId: '1', name: 'Widget Supply Co.', contactEmail: 'sales@widgetsupply.com', paymentTerms: 'Net 15', createdAt: '2024-01-15' },
  { id: '3', organizationId: '1', name: 'TechParts Direct', contactEmail: 'procurement@techparts.com', paymentTerms: 'Net 45', createdAt: '2024-02-01' },
  { id: '4', organizationId: '1', name: 'Office Supply Hub', contactEmail: 'b2b@officesupplyhub.com', paymentTerms: 'Net 30', createdAt: '2024-02-10' },
  { id: '5', organizationId: '1', name: 'Industrial Goods Ltd.', contactEmail: 'sales@industrialgoods.com', paymentTerms: 'Net 60', createdAt: '2024-02-20' },
];

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers] = useState(demoSuppliers);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage your supplier relationships</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">All Suppliers ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Active POs</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${supplier.contactEmail}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {supplier.contactEmail}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{supplier.paymentTerms}</Badge>
                  </TableCell>
                  <TableCell>{Math.floor(Math.random() * 5)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(supplier.createdAt).toLocaleDateString()}
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
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
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
