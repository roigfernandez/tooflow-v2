
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Tu email no está confirmado. Revisa tu bandeja de entrada.');
        } else if (error.message.includes('Invalid email')) {
          setError('Email inválido. Verifica que esté bien escrito.');
        } else {
          setError('Error al enviar el email. Inténtalo de nuevo.');
        }
      } else {
        setSent(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-check-line text-2xl text-green-600 dark:text-green-400"></i>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Email enviado
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>

              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line"></i>
                  Volver al login
                </Link>

                <button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 px-4 transition-colors whitespace-nowrap"
                >
                  Usar otro email
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            ¿No recibiste el email? Revisa tu carpeta de spam o inténtalo de nuevo en unos minutos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-lock-line text-2xl text-blue-600 dark:text-blue-400"></i>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Recuperar contraseña
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-gray-400"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <i className="ri-error-warning-line text-red-500 flex-shrink-0"></i>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line"></i>
                  Enviar enlace de recuperación
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
            >
              ← Volver al login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link
              href="/auth/register"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
