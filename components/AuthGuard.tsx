
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode; 
  requireAdmin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Verificación instantánea desde localStorage
  if (loading) {
    if (typeof window !== 'undefined') {
      const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
      const storedSession = localStorage.getItem(storageKey);
      
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          const now = Math.floor(Date.now() / 1000);
          
          // Si la sesión es válida, mostrar contenido inmediatamente
          if (sessionData.access_token && sessionData.expires_at > now) {
            return <>{children}</>;
          }
        } catch (e) {
          // Formato inválido, mostrar spinner
        }
      }
    }

    // Spinner minimalista solo cuando realmente necesario
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Verificar permisos de admin si es requerido
  if (requireAdmin && user.email !== 'demo@tooflow.com' && user.email !== 'admin@tooflow.com') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-lock-line text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Acceso restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
