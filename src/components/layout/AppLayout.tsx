import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useUserDisplay } from '@/hooks/useAuth';
import { usePermissions } from '@/components/auth/RoleGuard';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Barcode,
  Warehouse,
  ClipboardList,
  Users,
  Building2,
  CheckSquare,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Package as PackageIcon,
  Shield,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, currentOrg, organizations, signOut, switchOrg, role } = useAuth();
  const { fullName, email } = useUserDisplay();
  const { isAdmin } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  // Define navigation based on role
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Purchase Orders', href: '/purchase-orders', icon: ClipboardList },
    ];

    if (isAdmin) {
      return [
        ...baseNav,
        { name: 'Products', href: '/products', icon: Package },
        { name: 'SKUs', href: '/skus', icon: Barcode },
        { name: 'Inventory', href: '/inventory', icon: Warehouse },
        { name: 'Suppliers', href: '/suppliers', icon: Users },
        { name: 'Warehouses', href: '/warehouses', icon: Building2 },
        { name: 'Approvals', href: '/approvals', icon: CheckSquare },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
      ];
    }

    return baseNav;
  };

  const navigation = getNavigation();

  const bottomNavigation = isAdmin 
    ? [
        { name: 'Billing', href: '/billing', icon: CreditCard },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    : [];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col fixed h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <PackageIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">FBA Wholesale</span>
          </div>
        </div>

        {/* Organization Switcher */}
        {organizations.length > 0 && (
          <div className="p-3 border-b border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-2 px-3 hover:bg-sidebar-accent text-sidebar-foreground"
                >
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 rounded bg-sidebar-accent flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-sidebar-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[140px]">
                        {currentOrg?.name || 'Select Organization'}
                      </span>
                      <span className="text-xs text-muted-foreground">Organization</span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => switchOrg(org.id)}
                    className={cn(
                      'cursor-pointer',
                      currentOrg?.id === org.id && 'bg-accent'
                    )}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {org.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        {bottomNavigation.length > 0 && (
          <div className="p-3 space-y-1 border-t border-sidebar-border">
            {bottomNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* User Menu */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-2 px-3 hover:bg-sidebar-accent"
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-sidebar-foreground truncate">
                      {fullName}
                    </span>
                    {role && (
                      <Badge 
                        variant={isAdmin ? 'default' : 'secondary'} 
                        className="text-[10px] px-1.5 py-0"
                      >
                        {isAdmin ? <Shield className="h-2.5 w-2.5 mr-0.5" /> : null}
                        {role}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
