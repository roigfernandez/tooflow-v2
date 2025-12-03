
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setError('Este email ya está registrado. Intenta iniciar sesión.');
        } else if (error.message.includes('Password')) {
          setError('La contraseña debe tener al menos 6 caracteres');
        } else {
          setError('Error al crear la cuenta. Inténtalo de nuevo.');
        }
      } else {
        setSuccess(true);
        // Redirigir inmediatamente después del registro exitoso
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ¡Cuenta creada exitosamente!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu cuenta ha sido creada y ya puedes acceder. Serás redirigido al dashboard.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              Accediendo a tu cuenta...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-6 h-1 bg-white/80 mx-2 rounded-full"></div>
              <div className="w-3 h-3 bg-white/60 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            TooFlow
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea tu cuenta nueva
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <i className="ri-error-warning-line text-red-500 text-lg"></i>
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-user-line text-gray-400 dark:text-gray-500"></i>
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-gray-400 dark:text-gray-500"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400 dark:text-gray-500"></i>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300`}></i>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400 dark:text-gray-500"></i>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                required
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                Acepto los{' '}
                <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
                  política de privacidad
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Creando cuenta...
                </div>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/auth/login"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
            ℹ️ Información importante:
          </h3>
          <div className="text-xs text-purple-700 dark:text-purple-400">
            <p>Tu cuenta será activada inmediatamente después del registro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
