import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Warehouse } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Demo data
const salesData = [
  { month: 'Jan', sales: 45000, cost: 32000, profit: 13000 },
  { month: 'Feb', sales: 52000, cost: 35000, profit: 17000 },
  { month: 'Mar', sales: 48000, cost: 33000, profit: 15000 },
  { month: 'Apr', sales: 61000, cost: 41000, profit: 20000 },
  { month: 'May', sales: 55000, cost: 37000, profit: 18000 },
  { month: 'Jun', sales: 67000, cost: 44000, profit: 23000 },
];

const categoryData = [
  { name: 'Electronics', value: 35 },
  { name: 'Home & Garden', value: 25 },
  { name: 'Office', value: 20 },
  { name: 'Tools', value: 15 },
  { name: 'Other', value: 5 },
];

const topProducts = [
  { name: 'Premium Widget Set', units: 1250, revenue: 24375 },
  { name: 'Industrial Gadget Pack', units: 890, revenue: 21780 },
  { name: 'Professional Tool Kit', units: 675, revenue: 30375 },
  { name: 'Electronic Component Bundle', units: 2100, revenue: 18375 },
  { name: 'Office Supply Collection', units: 540, revenue: 8100 },
];

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(215, 16%, 47%)'];

export default function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="6months">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">$328,000</p>
                <p className="text-sm text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% vs last period
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-foreground">$106,000</p>
                <p className="text-sm text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.3% vs last period
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Units Sold</p>
                <p className="text-2xl font-bold text-foreground">5,455</p>
                <p className="text-sm text-destructive flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -2.1% vs last period
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-foreground">$60.12</p>
                <p className="text-sm text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +4.7% vs last period
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Cost Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Revenue & Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="hsl(221, 83%, 53%)" fill="url(#salesGradient)" name="Revenue" />
                  <Area type="monotone" dataKey="cost" stroke="hsl(0, 84%, 60%)" fill="url(#costGradient)" name="Cost" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-muted-foreground" />
                <YAxis type="category" dataKey="name" className="text-muted-foreground" width={180} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : 'Units',
                  ]}
                />
                <Bar dataKey="revenue" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
