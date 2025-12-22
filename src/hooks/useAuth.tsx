import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface Organization {
  id: string;
  name: string;
  created_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  currentOrg: Organization | null;
  organizations: Organization[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  switchOrg: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
        return;
      }

      if (data?.role) {
        setRole(data.role);
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      setRole(null);
    }
  }, []);

  const fetchUserOrganizations = useCallback(async (userId: string) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error fetching org memberships:', memberError);
        return;
      }

      if (memberData && memberData.length > 0) {
        const orgIds = memberData.map(m => m.organization_id);
        
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds);

        if (orgsError) {
          console.error('Error fetching organizations:', orgsError);
          return;
        }

        setOrganizations(orgsData || []);
        
        // Set first org as current if none selected
        const savedOrgId = localStorage.getItem('fba_current_org_id');
        const savedOrg = orgsData?.find(o => o.id === savedOrgId);
        setCurrentOrg(savedOrg || orgsData?.[0] || null);
        
        // Set role from org membership if not already set
        if (!role && memberData[0]) {
          setRole(memberData[0].role);
        }
      }
    } catch (err) {
      console.error('Error in fetchUserOrganizations:', err);
    }
  }, [role]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data fetches to avoid Supabase deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            fetchUserOrganizations(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setOrganizations([]);
          setCurrentOrg(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchUserOrganizations(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole, fetchUserOrganizations]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setOrganizations([]);
    setCurrentOrg(null);
    localStorage.removeItem('fba_current_org_id');
  };

  const switchOrg = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('fba_current_org_id', orgId);
    }
  };

  const isAdmin = role === 'admin';

  // Helper to get user's full name from metadata
  const getUserFullName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      isLoading,
      isAdmin,
      currentOrg,
      organizations,
      signIn,
      signUp,
      signOut,
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

// Helper hook to get user display info
export function useUserDisplay() {
  const { user } = useAuth();
  
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  
  return { fullName, email };
}
