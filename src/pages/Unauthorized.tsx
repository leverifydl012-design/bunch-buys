import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>
        <Button asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
