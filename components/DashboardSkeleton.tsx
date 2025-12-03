
'use client';

export default function DashboardSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Encabezado skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-80 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* KPIs skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
            
            {index === 1 && (
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gráficos skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico circular */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          </div>
          
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 animate-pulse flex items-center justify-center">
            <div className="w-32 h-32 border-8 border-gray-200 dark:border-gray-700 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-end justify-around p-4">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="bg-gray-200 dark:bg-gray-700 rounded-t w-8 animate-pulse"
                style={{ height: `${40 + Math.random() * 60}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Rendimiento por usuario */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto animate-pulse"></div>
                </div>
                <div className="mt-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 mx-auto animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos rápidos skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animación de carga adicional */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm">Cargando panel de control...</span>
        </div>
      </div>
    </div>
  );
}
