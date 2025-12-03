'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-3 h-0.5 bg-white/80 mx-1 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white dark:border-gray-900"></div>
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TooFlow
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Gestión de tareas</span>
            </div>
          </div>

          {/* Derechos reservados */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © {currentYear} TooFlow. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Desarrollado con ❤️ para equipos productivos
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}