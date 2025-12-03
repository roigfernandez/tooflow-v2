
'use client';

interface ExportProgressProps {
  progress: number;
}

export default function ExportProgress({ progress }: ExportProgressProps) {
  const getProgressMessage = (progress: number) => {
    if (progress <= 25) return 'Recopilando datos...';
    if (progress <= 50) return 'Aplicando filtros...';
    if (progress <= 75) return 'Generando reporte...';
    if (progress < 100) return 'Preparando descarga...';
    return 'Exportación lista. Descargando...';
  };

  const getProgressIcon = (progress: number) => {
    if (progress <= 25) return 'ri-database-2-line';
    if (progress <= 50) return 'ri-filter-2-line';
    if (progress <= 75) return 'ri-file-line';
    if (progress < 100) return 'ri-download-cloud-line';
    return 'ri-check-line';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-lg">
              <i className={`${getProgressIcon(progress)} text-blue-500 dark:text-blue-400 text-3xl ${progress < 100 ? 'animate-pulse' : ''}`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Exportando reporte</h3>
            <p className="text-gray-600 dark:text-gray-400">{getProgressMessage(progress)}</p>
          </div>

          {/* Barra de progreso mejorada */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progreso</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Pasos del proceso mejorados */}
          <div className="space-y-4">
            {[
              { threshold: 25, label: 'Recopilar datos', icon: 'ri-database-2-line' },
              { threshold: 50, label: 'Aplicar filtros', icon: 'ri-filter-2-line' },
              { threshold: 75, label: 'Generar reporte', icon: 'ri-file-line' },
              { threshold: 100, label: 'Preparar descarga', icon: 'ri-download-cloud-line' }
            ].map((step, index) => {
              const isCompleted = progress >= step.threshold;
              const isActive = progress >= (index > 0 ? [25, 50, 75, 100][index - 1] : 0) && progress < step.threshold;
              
              return (
                <div key={index} className={`flex items-center gap-4 text-sm transition-all duration-300 ${
                  isCompleted ? 'text-green-600 dark:text-green-400' : 
                  isActive ? 'text-blue-600 dark:text-blue-400' : 
                  'text-gray-400 dark:text-gray-500'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 
                    isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {isCompleted ? (
                      <i className="ri-check-line text-sm"></i>
                    ) : isActive ? (
                      <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                    ) : (
                      <i className={`${step.icon} text-xs`}></i>
                    )}
                  </div>
                  <span className="font-medium">{step.label}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {progress >= 100 && (
            <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                  <i className="ri-check-circle-line text-white"></i>
                </div>
                <div>
                  <p className="font-bold">¡Exportación completada!</p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Tu reporte se ha descargado automáticamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
