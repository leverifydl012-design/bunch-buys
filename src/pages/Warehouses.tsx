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
import { Plus, Search, MoreHorizontal, Edit, Trash2, MapPin } from 'lucide-react';
import { Warehouse } from '@/types';

// Demo data
const demoWarehouses: Warehouse[] = [
  { id: '1', organizationId: '1', name: 'Warehouse A', location: 'Los Angeles, CA', createdAt: '2024-01-01' },
  { id: '2', organizationId: '1', name: 'Warehouse B', location: 'Dallas, TX', createdAt: '2024-01-15' },
  { id: '3', organizationId: '1', name: 'East Coast Hub', location: 'Newark, NJ', createdAt: '2024-02-01' },
  { id: '4', organizationId: '1', name: 'FBA Prep Center', location: 'Phoenix, AZ', createdAt: '2024-02-20' },
];

export default function Warehouses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouses] = useState(demoWarehouses);

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouses</h1>
          <p className="text-muted-foreground mt-1">Manage your storage locations</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <Card key={warehouse.id} className="shadow-soft">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{warehouse.location}</span>
                </div>
              </div>
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKUs Stored</p>
                  <p className="text-xl font-semibold">{Math.floor(Math.random() * 500) + 100}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="text-xl font-semibold">{(Math.floor(Math.random() * 10000) + 1000).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="outline" className="text-success border-success">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warehouses Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">All Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>SKUs</TableHead>
                <TableHead>Total Units</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell>{warehouse.location}</TableCell>
                  <TableCell>{Math.floor(Math.random() * 500) + 100}</TableCell>
                  <TableCell>{(Math.floor(Math.random() * 10000) + 1000).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
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
