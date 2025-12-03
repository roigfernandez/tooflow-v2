
'use client';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';

export default function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 md:block hidden">
      <div className="px-3 md:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-8 min-w-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                  <div className="w-3 h-0.5 md:w-4 md:h-0.5 bg-white/80 mx-0.5 md:mx-1 rounded-full"></div>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full"></div>
                </div>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TooFlow
              </span>
            </Link>

            {/* Navegación desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/tasks"
                className="px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Tareas
              </Link>
              <Link
                href="/projects"
                className="px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Proyectos
              </Link>
              <Link
                href="/calendar"
                className="px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Calendario
              </Link>
              <Link
                href="/reports"
                className="px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Reportes
              </Link>
            </nav>
          </div>

          {/* Barra de búsqueda - solo desktop */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-4">
            <SearchBar />
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center gap-1 md:gap-2 lg:gap-3 flex-shrink-0">
            {/* Toggle tema */}
            <button
              onClick={toggleTheme}
              className="p-1.5 md:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              <i className={`${theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} text-base sm:text-lg`}></i>
            </button>

            {/* Notificaciones */}
            <NotificationBell />

            {/* Menú de usuario */}
            <div className="relative group">
              <button className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <i className="ri-arrow-down-s-line text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 hidden sm:block"></i>
              </button>

              {/* Dropdown del usuario */}
              <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <i className="ri-user-line text-gray-500"></i>
                    Mi Perfil
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <i className="ri-settings-line text-gray-500"></i>
                    Configuración
                  </Link>
                  <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <i className="ri-logout-box-line"></i>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
