
'use client';
import { useState, useEffect } from 'react';

interface ProductivityInsightsProps {
  data: {
    totalTasks: number;
    completedPercentage: number;
    overdueTasks: number;
    dueSoonTasks: number;
    activeProjects: number;
    activeUsers: number;
  };
}

export default function ProductivityInsights({ data }: ProductivityInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Cambiar insight cada 5 segundos
    const interval = setInterval(() => {
      setSelectedInsight((prev) => (prev + 1) % insights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const insights = [
    {
      type: 'success',
      icon: 'ri-trophy-line',
      title: 'Excelente Productividad',
      description: `Tu equipo completó ${data.completedPercentage}% de las tareas esta semana`,
      recommendation: 'Mantén este ritmo y considera aumentar la complejidad de los proyectos',
      color: 'green',
      show: data.completedPercentage >= 75
    },
    {
      type: 'warning',
      icon: 'ri-alarm-warning-line',
      title: 'Atención Requerida',
      description: `${data.overdueTasks} tareas están vencidas`,
      recommendation: 'Prioriza estas tareas y revisa la planificación del equipo',
      color: 'red',
      show: data.overdueTasks > 0
    },
    {
      type: 'info',
      icon: 'ri-calendar-check-line',
      title: 'Planificación Proactiva',
      description: `${data.dueSoonTasks} tareas vencen en los próximos 3 días`,
      recommendation: 'Organiza sesiones de seguimiento para estas tareas prioritarias',
      color: 'orange',
      show: data.dueSoonTasks > 0
    },
    {
      type: 'growth',
      icon: 'ri-team-line',
      title: 'Colaboración Activa',
      description: `${data.activeUsers} miembros trabajando en ${data.activeProjects} proyectos`,
      recommendation: 'Fomenta la comunicación entre equipos para mayor sinergia',
      color: 'blue',
      show: data.activeUsers > 1
    },
    {
      type: 'efficiency',
      icon: 'ri-line-chart-line',
      title: 'Optimización de Procesos',
      description: 'Identifica patrones en las tareas completadas',
      recommendation: 'Implementa templates para tareas recurrentes',
      color: 'purple',
      show: data.completedPercentage > 50
    }
  ].filter(insight => insight.show);

  if (insights.length === 0) {
    return null;
  }

  const currentInsight = insights[selectedInsight] || insights[0];

  const getColorClasses = (color: string) => {
    const colors = {
      green: {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'bg-gradient-to-br from-green-500 to-emerald-600',
        text: 'text-green-700 dark:text-green-400',
        accent: 'text-green-900 dark:text-green-100'
      },
      red: {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: 'bg-gradient-to-br from-red-500 to-rose-600',
        text: 'text-red-700 dark:text-red-400',
        accent: 'text-red-900 dark:text-red-100'
      },
      orange: {
        bg: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'bg-gradient-to-br from-orange-500 to-amber-600',
        text: 'text-orange-700 dark:text-orange-400',
        accent: 'text-orange-900 dark:text-orange-100'
      },
      blue: {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        text: 'text-blue-700 dark:text-blue-400',
        accent: 'text-blue-900 dark:text-blue-100'
      },
      purple: {
        bg: 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'bg-gradient-to-br from-purple-500 to-violet-600',
        text: 'text-purple-700 dark:text-purple-400',
        accent: 'text-purple-900 dark:text-purple-100'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(currentInsight.color);

  return (
    <div className={`relative ${colorClasses.bg} rounded-xl border ${colorClasses.border} p-6 transition-all duration-500 overflow-hidden ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform rotate-45 translate-x-16 -translate-y-16"></div>
      </div>

      <div className="relative flex items-start gap-4">
        <div className={`w-12 h-12 ${colorClasses.icon} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}>
          <i className={`${currentInsight.icon} text-white text-xl`}></i>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${colorClasses.accent}`}>
              {currentInsight.title}
            </h3>
            
            {/* Indicadores de insights */}
            <div className="flex items-center gap-1">
              {insights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedInsight(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedInsight 
                      ? `${colorClasses.icon} scale-125` 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                ></button>
              ))}
            </div>
          </div>

          <p className={`text-sm ${colorClasses.text} leading-relaxed`}>
            {currentInsight.description}
          </p>

          <div className={`bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 ${colorClasses.border} border backdrop-blur-sm`}>
            <div className="flex items-start gap-2">
              <i className={`ri-lightbulb-line ${colorClasses.text} mt-0.5 flex-shrink-0`}></i>
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Recomendación
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {currentInsight.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center gap-2 pt-2">
            {currentInsight.type === 'warning' && (
              <button className="flex items-center gap-1 px-3 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <i className="ri-eye-line"></i>
                Ver tareas vencidas
              </button>
            )}
            
            {currentInsight.type === 'info' && (
              <button className="flex items-center gap-1 px-3 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <i className="ri-calendar-line"></i>
                Abrir calendario
              </button>
            )}
            
            {currentInsight.type === 'success' && (
              <button className="flex items-center gap-1 px-3 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <i className="ri-share-line"></i>
                Compartir logro
              </button>
            )}

            <button className="flex items-center gap-1 px-3 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors ml-auto">
              <i className="ri-more-line"></i>
              Más detalles
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar para el ciclo automático */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className={`h-full ${colorClasses.icon} transition-all duration-75 ease-linear`}
          style={{ 
            width: '100%',
            animation: 'progress 5s linear infinite'
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
