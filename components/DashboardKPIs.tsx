
'use client';

interface DashboardKPIsProps {
  data?: {
    totalTasks: number;
    completedPercentage: number;
    overdueTasks: number;
    dueSoonTasks: number;
    activeProjects: number;
    activeUsers: number;
    avgCompletionTime: number;
    weeklyProductivity: number;
    criticalTasks: number;
  };
  stats?: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
    projects: number;
    activeProjects: number;
  } | null;
}

export default function DashboardKPIs({ data, stats }: DashboardKPIsProps) {
  // Si tenemos datos de admin, usamos esos
  if (data) {
    const kpis = [
      {
        title: 'Total de Tareas',
        value: data.totalTasks,
        icon: 'ri-task-line',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        change: null
      },
      {
        title: 'Completadas',
        value: Math.round((data.totalTasks * data.completedPercentage) / 100),
        icon: 'ri-check-double-line',
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        change: `${data.completedPercentage}%`
      },
      {
        title: 'En Progreso',
        value: data.totalTasks - Math.round((data.totalTasks * data.completedPercentage) / 100) - data.overdueTasks,
        icon: 'ri-time-line',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        change: null
      },
      {
        title: 'Proyectos Activos',
        value: data.activeProjects,
        icon: 'ri-folder-line',
        color: 'text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        change: `${data.activeProjects} activos`
      },
      {
        title: 'Usuarios Activos',
        value: data.activeUsers,
        icon: 'ri-team-line',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
        change: 'En línea'
      },
      {
        title: 'Productividad',
        value: `${data.weeklyProductivity}%`,
        icon: 'ri-bar-chart-2-line',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
        change: 'Esta semana'
      }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {kpi.value}
                </p>
                {kpi.change && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {kpi.change}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ml-4`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${kpi.icon} ${kpi.color} text-lg`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Si no hay stats, mostrar skeleton
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Para stats normales
  const kpis = [
    {
      title: 'Total de Tareas',
      value: stats.total,
      icon: 'ri-task-line',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: null
    },
    {
      title: 'Completadas',
      value: stats.completed,
      icon: 'ri-check-double-line',
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: `${stats.completionRate}%`
    },
    {
      title: 'En Progreso',
      value: stats.inProgress,
      icon: 'ri-time-line',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      change: null
    },
    {
      title: 'Proyectos Activos',
      value: stats.activeProjects,
      icon: 'ri-folder-line',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: `${stats.projects} total`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">
                {kpi.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {kpi.value}
              </p>
              {kpi.change && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {kpi.change}
                </p>
              )}
            </div>
            <div className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ml-4`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${kpi.icon} ${kpi.color} text-lg`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
