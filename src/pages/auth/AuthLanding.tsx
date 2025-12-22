import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Shield, User, ArrowRight } from 'lucide-react';

export default function AuthLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <Package className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">FBA Wholesale</span>
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-8 text-lg">
          Choose your account type to get started
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Card */}
          <Card className="shadow-soft hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">User Account</CardTitle>
              <CardDescription>For team members managing purchase orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Create Purchase Orders
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  View your own POs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Track order status
                </li>
              </ul>
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild className="w-full">
                  <Link to="/auth/login?role=user">
                    Sign In as User
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth/signup?role=user">
                    Create User Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="shadow-soft hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Admin Account</CardTitle>
              <CardDescription>Full system access and management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Approve & manage all POs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Create & manage shipments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Manage users & settings
                </li>
              </ul>
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild variant="destructive" className="w-full">
                  <Link to="/auth/login?role=admin">
                    Sign In as Admin
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth/signup?role=admin">
                    Create Admin Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
