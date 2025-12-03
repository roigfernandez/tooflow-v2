'use client';
import { useTheme } from '@/lib/theme-context';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {/* Toggle slider */}
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {/* Icon dentro del slider */}
        <i
          className={`text-xs transition-all duration-300 ${
            isDark 
              ? 'ri-moon-fill text-gray-700' 
              : 'ri-sun-fill text-yellow-500'
          }`}
        />
      </div>

      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <i className={`ri-sun-line text-xs transition-opacity duration-300 ${
          isDark ? 'text-gray-400 opacity-50' : 'text-yellow-400 opacity-100'
        }`} />
        <i className={`ri-moon-line text-xs transition-opacity duration-300 ${
          isDark ? 'text-blue-300 opacity-100' : 'text-gray-400 opacity-50'
        }`} />
      </div>
    </button>
  );
}