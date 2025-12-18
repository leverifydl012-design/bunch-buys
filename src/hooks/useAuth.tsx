import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  currentOrg: Organization | null;
  currentRole: UserRole | null;
  organizations: Organization[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  switchOrg: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo data
const DEMO_USER: User = {
  id: '1',
  email: 'demo@fbawholesale.com',
  fullName: 'John Smith',
};

const DEMO_ORGS: Organization[] = [
  { id: '1', name: 'Acme Wholesale', createdAt: '2024-01-01' },
  { id: '2', name: 'Global Imports LLC', createdAt: '2024-02-15' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('fba_user');
    const savedOrg = localStorage.getItem('fba_current_org');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setOrganizations(DEMO_ORGS);
      setCurrentOrg(savedOrg ? JSON.parse(savedOrg) : DEMO_ORGS[0]);
      setCurrentRole('admin'); // Demo role
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Demo login - accepts any credentials
    setUser(DEMO_USER);
    setOrganizations(DEMO_ORGS);
    setCurrentOrg(DEMO_ORGS[0]);
    setCurrentRole('admin');
    localStorage.setItem('fba_user', JSON.stringify(DEMO_USER));
    localStorage.setItem('fba_current_org', JSON.stringify(DEMO_ORGS[0]));
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const newUser = { ...DEMO_USER, email, fullName };
    setUser(newUser);
    setOrganizations(DEMO_ORGS);
    setCurrentOrg(DEMO_ORGS[0]);
    setCurrentRole('admin');
    localStorage.setItem('fba_user', JSON.stringify(newUser));
    localStorage.setItem('fba_current_org', JSON.stringify(DEMO_ORGS[0]));
  };

  const logout = () => {
    setUser(null);
    setCurrentOrg(null);
    setCurrentRole(null);
    setOrganizations([]);
    localStorage.removeItem('fba_user');
    localStorage.removeItem('fba_current_org');
  };

  const switchOrg = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('fba_current_org', JSON.stringify(org));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      currentOrg,
      currentRole,
      organizations,
      isLoading,
      login,
      signup,
      logout,
      switchOrg,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
