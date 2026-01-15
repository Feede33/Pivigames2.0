'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithDiscord: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 [AuthContext] Initializing...');
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 [AuthContext] Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: error
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        console.log('✅ [AuthContext] User logged in:', {
          id: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata?.provider,
          metadata: session.user.user_metadata
        });
      } else {
        console.log('❌ [AuthContext] No user session found');
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 [AuthContext] Auth state changed:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === 'SIGNED_IN') {
        console.log('✅ [AuthContext] User SIGNED_IN:', {
          id: session?.user?.id,
          email: session?.user?.email,
          provider: session?.user?.app_metadata?.provider
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ [AuthContext] User SIGNED_OUT');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 [AuthContext] Token refreshed');
      } else if (event === 'USER_UPDATED') {
        console.log('📝 [AuthContext] User updated');
      }
    });

    return () => {
      console.log('🔐 [AuthContext] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signInWithDiscord = async () => {
    console.log('🔐 [AuthContext] Starting Discord OAuth...');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          // Solicitar explícitamente el scope de email
          scopes: 'identify email',
          skipBrowserRedirect: false,
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      console.log('🔐 [AuthContext] Discord OAuth response:', { data, error });
      
      if (error) {
        console.error('❌ [AuthContext] OAuth error:', error);
        throw error;
      }
      
      console.log('✅ [AuthContext] Discord OAuth initiated successfully');
    } catch (error) {
      console.error('❌ [AuthContext] Error signing in with Discord:', error);
      alert('Error al iniciar sesión con Discord. Asegúrate de que tu email de Discord esté verificado.');
    }
  };

  const signOut = async () => {
    console.log('🔐 [AuthContext] Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ [AuthContext] Signed out successfully');
    } catch (error) {
      console.error('❌ [AuthContext] Error signing out:', error);
      alert('Error al cerrar sesión');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithDiscord,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
