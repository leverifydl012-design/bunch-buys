import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Zap, Building2, Users } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for small operations',
    features: [
      '1 Organization',
      'Up to 500 SKUs',
      '2 Team Members',
      'Basic Reports',
      'Email Support',
    ],
    current: false,
  },
  {
    name: 'Professional',
    price: 149,
    description: 'For growing businesses',
    features: [
      '3 Organizations',
      'Up to 5,000 SKUs',
      '10 Team Members',
      'Advanced Reports',
      'Priority Support',
      'API Access',
    ],
    current: true,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 399,
    description: 'For large scale operations',
    features: [
      'Unlimited Organizations',
      'Unlimited SKUs',
      'Unlimited Team Members',
      'Custom Reports',
      'Dedicated Support',
      'API Access',
      'Custom Integrations',
    ],
    current: false,
  },
];

const invoices = [
  { id: 'INV-2024-003', date: '2024-03-01', amount: 149, status: 'paid' },
  { id: 'INV-2024-002', date: '2024-02-01', amount: 149, status: 'paid' },
  { id: 'INV-2024-001', date: '2024-01-01', amount: 149, status: 'paid' },
];

export default function Billing() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">Professional Plan</span>
                  <Badge className="bg-success text-success-foreground">Active</Badge>
                </div>
                <p className="text-muted-foreground">$149/month • Renews on April 1, 2024</p>
              </div>
            </div>
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-xl font-semibold">2 / 3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SKUs</p>
                <p className="text-xl font-semibold">1,284 / 5,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-xl font-semibold">5 / 10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`shadow-soft relative ${plan.popular ? 'border-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm">{invoice.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">${invoice.amount}</span>
                  <Badge className="bg-success text-success-foreground">Paid</Badge>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
