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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle } from 'lucide-react';

// Demo data
const demoInventory = [
  { id: '1', sku: 'WGT-001-BLK', productTitle: 'Premium Widget Set', warehouse: 'Warehouse A', quantity: 450, minStock: 100 },
  { id: '2', sku: 'WGT-001-WHT', productTitle: 'Premium Widget Set', warehouse: 'Warehouse A', quantity: 85, minStock: 100 },
  { id: '3', sku: 'GDT-002-LRG', productTitle: 'Industrial Gadget Pack', warehouse: 'Warehouse B', quantity: 320, minStock: 50 },
  { id: '4', sku: 'TLK-003-PRO', productTitle: 'Professional Tool Kit', warehouse: 'Warehouse A', quantity: 45, minStock: 75 },
  { id: '5', sku: 'ELC-004-STD', productTitle: 'Electronic Component Bundle', warehouse: 'Warehouse B', quantity: 890, minStock: 200 },
];

const warehouses = ['All Warehouses', 'Warehouse A', 'Warehouse B'];

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouses');
  const [inventory] = useState(demoInventory);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse =
      selectedWarehouse === 'All Warehouses' || item.warehouse === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock * 0.5) return 'critical';
    if (quantity <= minStock) return 'low';
    return 'healthy';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground mt-1">Monitor stock levels across warehouses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Stock</div>
            <div className="text-2xl font-bold text-foreground">
              {inventory.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()} units
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Low Stock Items</div>
            <div className="text-2xl font-bold text-warning">
              {inventory.filter((i) => i.quantity <= i.minStock).length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Unique SKUs</div>
            <div className="text-2xl font-bold text-foreground">{inventory.length}</div>
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
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh} value={wh}>
                    {wh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Stock Levels ({filteredInventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const status = getStockStatus(item.quantity, item.minStock);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium">{item.sku}</TableCell>
                    <TableCell>{item.productTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.warehouse}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {status === 'critical' && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Critical
                        </Badge>
                      )}
                      {status === 'low' && (
                        <Badge className="bg-warning text-warning-foreground gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      )}
                      {status === 'healthy' && (
                        <Badge className="bg-success text-success-foreground">Healthy</Badge>
                      )}
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
