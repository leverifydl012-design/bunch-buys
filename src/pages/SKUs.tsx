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
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { SKU } from '@/types';

// Demo data
const demoSKUs: (SKU & { productTitle: string })[] = [
  { id: '1', productId: '1', sku: 'WGT-001-BLK', asin: 'B08X1234AB', fnsku: 'X001ABC123', cost: 12.99, createdAt: '2024-01-15', productTitle: 'Premium Widget Set' },
  { id: '2', productId: '1', sku: 'WGT-001-WHT', asin: 'B08X1234AC', fnsku: 'X001ABC124', cost: 12.99, createdAt: '2024-01-15', productTitle: 'Premium Widget Set' },
  { id: '3', productId: '2', sku: 'GDT-002-LRG', asin: 'B08Y5678DE', fnsku: 'X002DEF456', cost: 24.50, createdAt: '2024-01-20', productTitle: 'Industrial Gadget Pack' },
  { id: '4', productId: '3', sku: 'TLK-003-PRO', asin: 'B08Z9012FG', fnsku: 'X003GHI789', cost: 45.00, createdAt: '2024-02-01', productTitle: 'Professional Tool Kit' },
  { id: '5', productId: '4', sku: 'ELC-004-STD', asin: 'B09A3456HI', fnsku: 'X004JKL012', cost: 8.75, createdAt: '2024-02-10', productTitle: 'Electronic Component Bundle' },
];

export default function SKUs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skus] = useState(demoSKUs);

  const filteredSKUs = skus.filter(
    (sku) =>
      sku.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.asin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SKUs</h1>
          <p className="text-muted-foreground mt-1">Manage your stock keeping units</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add SKU
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SKUs, ASINs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SKUs Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">All SKUs ({filteredSKUs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>ASIN</TableHead>
                <TableHead>FNSKU</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSKUs.map((sku) => (
                <TableRow key={sku.id}>
                  <TableCell className="font-mono font-medium">{sku.sku}</TableCell>
                  <TableCell>{sku.productTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {sku.asin || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {sku.fnsku || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${sku.cost.toFixed(2)}
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
