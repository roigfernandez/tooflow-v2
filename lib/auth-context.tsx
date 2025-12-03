'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is configured
        // Force local mode for development
        const isSupabaseConfigured = false;

        /* Original logic
        const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                                   !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo');
        */

        // Verificación instantánea desde localStorage
        const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);

        if (!storedSession) {
          if (!isSupabaseConfigured) {
            // AUTO-LOGIN FOR LOCAL DEV / DEMO MODE
            if (mounted) {
              const mockUser: User = {
                id: 'demo-user',
                app_metadata: {},
                user_metadata: { full_name: 'Usuario Demo' },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
                email: 'demo@tooflow.com',
                phone: '',
                role: 'authenticated',
                updated_at: new Date().toISOString()
              };

              const mockSession: Session = {
                access_token: 'mock-token',
                token_type: 'bearer',
                expires_in: 3600,
                refresh_token: 'mock-refresh-token',
                user: mockUser
              };

              setSession(mockSession);
              setUser(mockUser);
              setLoading(false);
            }
            return;
          }

          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // Parsear sesión guardada para verificación inmediata
        try {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.access_token && sessionData.user) {
            const now = Math.floor(Date.now() / 1000);
            if (sessionData.expires_at > now) {
              // Sesión válida - mostrar inmediatamente
              if (mounted) {
                setSession(sessionData);
                setUser(sessionData.user);
                setLoading(false);
              }

              // Verificar con Supabase en segundo plano
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (mounted && session) {
                  setSession(session);
                  setUser(session.user);
                  createOrUpdateProfile(session.user).catch(console.error);
                }
              });
              return;
            }
          }
        } catch (e) {
          // Formato inválido, continuar con verificación normal
        }

        // Verificación con Supabase como fallback
        const { data: { session }, error } = await supabase.auth.getSession();

        if (mounted) {
          if (!error && session) {
            setSession(session);
            setUser(session.user);
            createOrUpdateProfile(session.user).catch(console.error);
          } else {
            setSession(null);
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.log('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            createOrUpdateProfile(session.user).catch(console.error);
          }

          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const createOrUpdateProfile = async (user: User) => {
    try {
      const cacheKey = `profile_${user.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      const profileData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        updated_at: new Date().toISOString()
      };

      if (existingProfile) {
        await supabase
          .from('profiles')
          .update({
            email: profileData.email,
            name: profileData.name,
            full_name: profileData.full_name,
            updated_at: profileData.updated_at
          })
          .eq('id', user.id);
      } else {
        await supabase
          .from('profiles')
          .insert(profileData);
      }

      sessionStorage.setItem(cacheKey, 'processed');
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    // Check if Supabase is configured (using the same logic as in database.ts)
    const isSupabaseConfigured = false; // Force local mode

    if (!isSupabaseConfigured) {
      // Mock login for local dev
      setTimeout(() => {
        const mockUser: User = {
          id: 'demo-user',
          app_metadata: {},
          user_metadata: { full_name: 'Usuario Demo' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email,
          phone: '',
          role: 'authenticated',
          updated_at: new Date().toISOString()
        };

        const mockSession: Session = {
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser
        };

        setSession(mockSession);
        setUser(mockUser);
        setLoading(false);
      }, 500);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setLoading(false);
        return { error: { message: 'Credenciales incorrectas. Verifica tu email y contraseña.' } };
      }

      return { error: null };

    } catch (error) {
      console.error('Error in signIn:', error);
      setLoading(false);
      return { error: { message: 'Error de conexión. Inténtalo de nuevo.' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);

    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo');

    if (!isSupabaseConfigured) {
      // Mock signup for local dev
      setTimeout(() => {
        const mockUser: User = {
          id: 'demo-user',
          app_metadata: {},
          user_metadata: { full_name: fullName },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email,
          phone: '',
          role: 'authenticated',
          updated_at: new Date().toISOString()
        };

        const mockSession: Session = {
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser
        };

        setSession(mockSession);
        setUser(mockUser);
        setLoading(false);
      }, 500);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        setLoading(false);

        if (error.message.includes('already registered')) {
          return { error: { message: 'Este email ya está registrado. Intenta iniciar sesión.' } };
        } else if (error.message.includes('Password')) {
          return { error: { message: 'La contraseña debe tener al menos 6 caracteres.' } };
        } else {
          return { error: { message: 'Error al crear la cuenta. Inténtalo con otro email.' } };
        }
      }

      setLoading(false);
      return { error: null };

    } catch (error) {
      console.error('Error in signUp:', error);
      setLoading(false);
      return { error: { message: 'Error al crear la cuenta. Inténtalo de nuevo.' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.clear();
      localStorage.removeItem(`profile_${user?.id}`);
    } catch (error) {
      console.log('Supabase signout error:', error);
    }

    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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
