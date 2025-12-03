
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function QuickActions() {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      id: 'new-task',
      title: 'Nueva Tarea',
      description: 'Crear tarea rápidamente',
      icon: 'ri-add-line',
      color: 'blue',
      href: '/tasks/new',
      hotkey: 'N'
    },
    {
      id: 'new-project',
      title: 'Nuevo Proyecto',
      description: 'Iniciar proyecto',
      icon: 'ri-folder-add-line',
      color: 'green',
      href: '/projects/new',
      hotkey: 'P'
    },
    {
      id: 'calendar',
      title: 'Ver Calendario',
      description: 'Revisar fechas límite',
      icon: 'ri-calendar-line',
      color: 'purple',
      href: '/calendar',
      hotkey: 'C'
    },
    {
      id: 'reports',
      title: 'Generar Reporte',
      description: 'Análisis detallado',
      icon: 'ri-file-chart-line',
      color: 'orange',
      href: '/reports',
      hotkey: 'R'
    },
    {
      id: 'chat',
      title: 'Chat del Equipo',
      description: 'Comunicación rápida',
      icon: 'ri-chat-3-line',
      color: 'indigo',
      href: '/chat',
      hotkey: 'T'
    },
    {
      id: 'admin',
      title: 'Panel Admin',
      description: 'Vista de administrador',
      icon: 'ri-dashboard-3-line',
      color: 'red',
      href: '/admin',
      hotkey: 'A'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
        icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
        icon: 'bg-gradient-to-br from-green-500 to-green-600',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
        icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
        icon: 'bg-gradient-to-br from-orange-500 to-orange-600',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        hover: 'hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30'
      },
      indigo: {
        bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
        icon: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
        hover: 'hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-800/30 dark:hover:to-indigo-700/30'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
        icon: 'bg-gradient-to-br from-red-500 to-red-600',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="ri-flashlight-line text-white"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Acciones Rápidas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accesos directos para mayor productividad
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <i className={`ri-${isExpanded ? 'contract' : 'expand'}-up-down-line`}></i>
        </button>
      </div>

      <div className={`grid gap-3 transition-all duration-300 ${
        isExpanded 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
      }`}>
        {actions.map((action) => {
          const colorClasses = getColorClasses(action.color);

          return (
            <Link key={action.id} href={action.href}>
              <div className={`${colorClasses.bg} ${colorClasses.hover} ${colorClasses.border} border rounded-lg p-4 transition-all duration-200 cursor-pointer group hover:shadow-md`}>
                <div className={`flex ${isExpanded ? 'items-start gap-3' : 'flex-col items-center gap-2'}`}>
                  <div className={`${colorClasses.icon} w-10 h-10 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 relative flex-shrink-0`}>
                    <i className={`${action.icon} text-white text-lg`}></i>
                    
                    {/* Hotkey indicator */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900/80 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {action.hotkey}
                    </div>
                  </div>

                  <div className={`${isExpanded ? 'flex-1 min-w-0' : 'text-center'}`}>
                    <h4 className={`font-medium ${colorClasses.text} text-sm mb-1 leading-5 ${isExpanded ? '' : 'min-h-[40px] flex items-center justify-center'}`}>
                      {action.title}
                    </h4>
                    {isExpanded && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-4">
                        {action.description}
                      </p>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="flex-shrink-0">
                      <i className="ri-arrow-right-line text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"></i>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Keyboard shortcuts info */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <i className="ri-keyboard-line"></i>
          <span>Tip: Usa</span>
          <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
            Tecla
          </kbd>
          <span>para acceso rápido</span>
        </div>
      </div>

      {/* Recent activity indicator */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Sistema activo • {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <i className="ri-refresh-line"></i>
        </button>
      </div>
    </div>
  );
}
