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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { useSKUs } from '@/hooks/useSKUs';
import { CreateSKUDialog } from '@/components/skus/CreateSKUDialog';

export default function SKUs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: skus = [], isLoading } = useSKUs();

  const filteredSKUs = skus.filter(
    (sku) =>
      sku.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sku.asin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sku.product?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SKUs</h1>
          <p className="text-muted-foreground mt-1">Manage your stock keeping units</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSKUs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No SKUs found. Click "Add SKU" to create one.
            </div>
          ) : (
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
                    <TableCell>{sku.product?.title || '-'}</TableCell>
                    <TableCell>
                      {sku.asin ? (
                        <Badge variant="outline" className="font-mono">
                          {sku.asin}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {sku.fnsku || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(sku.cost || 0).toFixed(2)}
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
          )}
        </CardContent>
      </Card>

      <CreateSKUDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
