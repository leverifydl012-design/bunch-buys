import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useUserDisplay } from '@/hooks/useAuth';
import {
  Package,
  Barcode,
  Warehouse,
  ClipboardList,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
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
} from 'recharts';
import { usePermissions } from '@/components/auth/RoleGuard';

// Demo data
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const inventoryData = [
  { name: 'Widget A', stock: 450 },
  { name: 'Widget B', stock: 320 },
  { name: 'Gadget X', stock: 280 },
  { name: 'Gadget Y', stock: 190 },
  { name: 'Tool Z', stock: 150 },
];

const recentActivities = [
  {
    id: 1,
    action: 'PO #1234 approved',
    user: 'John Manager',
    time: '2 hours ago',
    status: 'success',
  },
  {
    id: 2,
    action: 'Low stock alert: Widget A',
    user: 'System',
    time: '4 hours ago',
    status: 'warning',
  },
  {
    id: 3,
    action: 'Inventory received at Warehouse 1',
    user: 'Sarah Warehouse',
    time: '6 hours ago',
    status: 'success',
  },
  {
    id: 4,
    action: 'New supplier added: Global Parts',
    user: 'Mike Purchasing',
    time: '1 day ago',
    status: 'info',
  },
];

export default function Dashboard() {
  const { currentOrg } = useAuth();
  const { fullName } = useUserDisplay();
  const { isAdmin } = usePermissions();

  const kpiCards = isAdmin
    ? [
        { title: 'Total Products', value: '248', change: '+12%', trend: 'up', icon: Package },
        { title: 'Active SKUs', value: '1,284', change: '+8%', trend: 'up', icon: Barcode },
        { title: 'Total Inventory Value', value: '$847,200', change: '+15%', trend: 'up', icon: DollarSign },
        { title: 'Pending POs', value: '12', change: '-3', trend: 'down', icon: ClipboardList },
      ]
    : [
        { title: 'My POs', value: '5', change: '+2', trend: 'up', icon: ClipboardList },
        { title: 'Pending Approval', value: '2', change: '0', trend: 'up', icon: AlertCircle },
        { title: 'Approved', value: '3', change: '+1', trend: 'up', icon: CheckCircle },
      ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {fullName.split(' ')[0]}!{' '}
          {currentOrg ? `Here's what's happening at ${currentOrg.name}.` : ''}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <p
                    className={`text-sm mt-1 flex items-center gap-1 ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-destructive'
                    }`}
                  >
                    <TrendingUp
                      className={`h-3 w-3 ${kpi.trend === 'down' ? 'rotate-180' : ''}`}
                    />
                    {kpi.change} from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row - Only for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
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
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(221 83% 53%)"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Products by Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-muted-foreground" />
                    <YAxis type="category" dataKey="name" className="text-muted-foreground" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value, 'Units']}
                    />
                    <Bar dataKey="stock" fill="hsl(142 76% 36%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity - Only for Admin */}
      {isAdmin && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success'
                        ? 'bg-green-100 text-green-600'
                        : activity.status === 'warning'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : activity.status === 'warning' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Warehouse className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
