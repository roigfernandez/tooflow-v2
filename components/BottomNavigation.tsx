
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useRouter } from 'next/navigation';

const navigationItems = [
  { href: '/', icon: 'ri-home-line', label: 'Inicio' },
  { href: '/tasks', icon: 'ri-task-line', label: 'Tareas' },
  { href: '/projects', icon: 'ri-folder-line', label: 'Proyectos' },
  { href: '/calendar', icon: 'ri-calendar-line', label: 'Calendario' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header con logo en móvil */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 md:hidden z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-4 h-0.5 bg-white/80 mx-1 rounded-full"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TooFlow
            </span>
          </Link>

          {/* Menú hamburguesa */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl text-gray-600 dark:text-gray-400`}></i>
          </button>
        </div>

        {/* Menú desplegable */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 z-40 mt-16"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
              <div className="p-4">
                {user ? (
                  <div className="space-y-4">
                    {/* Información del usuario */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Enlaces de navegación */}
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="ri-user-line text-gray-500"></i>
                        <span className="text-gray-700 dark:text-gray-300">Mi Perfil</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="ri-settings-line text-gray-500"></i>
                        <span className="text-gray-700 dark:text-gray-300">Configuración</span>
                      </Link>
                      <Link
                        href="/notifications"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="ri-notification-line text-gray-500"></i>
                        <span className="text-gray-700 dark:text-gray-300">Notificaciones</span>
                      </Link>
                      <Link
                        href="/files"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="ri-file-line text-gray-500"></i>
                        <span className="text-gray-700 dark:text-gray-300">Archivos</span>
                      </Link>
                      <Link
                        href="/reminders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="ri-alarm-line text-gray-500"></i>
                        <span className="text-gray-700 dark:text-gray-300">Recordatorios</span>
                      </Link>
                      <Link
                        href="/reports"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="ri-bar-chart-line text-gray-500"></i>
                        <span className="text-gray-700 dark:text-gray-300">Reportes</span>
                      </Link>
                    </div>

                    {/* Toggle tema */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
                    >
                      <i className={`${theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} text-gray-500`}></i>
                      <span className="text-gray-700 dark:text-gray-300">
                        {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                      </span>
                    </button>

                    {/* Cerrar sesión */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-red-600 dark:text-red-400"
                      >
                        <i className="ri-logout-box-line"></i>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="ri-login-box-line"></i>
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="ri-user-add-line"></i>
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Navegación inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden transition-colors">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-1 p-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`ri-home-line text-lg ${isActive('/') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}></i>
            </div>
            <span className={`text-xs font-medium ${isActive('/') ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>Inicio</span>
          </Link>
          
          <Link href="/tasks" className="flex flex-col items-center gap-1 p-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`ri-task-line text-lg ${isActive('/tasks') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}></i>
            </div>
            <span className={`text-xs font-medium ${isActive('/tasks') ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>Tareas</span>
          </Link>
          
          <Link href="/projects" className="flex flex-col items-center gap-1 p-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`ri-folder-line text-lg ${isActive('/projects') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}></i>
            </div>
            <span className={`text-xs font-medium ${isActive('/projects') ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>Proyectos</span>
          </Link>
          
          <Link href="/calendar" className="flex flex-col items-center gap-1 p-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`ri-calendar-line text-lg ${isActive('/calendar') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}></i>
            </div>
            <span className={`text-xs font-medium ${isActive('/calendar') ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>Calendario</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
