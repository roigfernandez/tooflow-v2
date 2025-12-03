
'use client';

interface PreviewData {
  id: string;
  task: string;
  project: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
  completedDate: string | null;
  duration: string;
}

interface ReportPreviewProps {
  data: PreviewData[];
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completada': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'en progreso': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'pendiente': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'cancelada': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgente': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'alta': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'media': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'baja': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Estadísticas del reporte
  const stats = {
    total: data.length,
    completed: data.filter(item => item.status.toLowerCase() === 'completada').length,
    inProgress: data.filter(item => item.status.toLowerCase() === 'en progreso').length,
    pending: data.filter(item => item.status.toLowerCase() === 'pendiente').length
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
      {/* Encabezado del preview mejorado */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-eye-line text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Vista previa del reporte
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.length} {data.length === 1 ? 'registro encontrado' : 'registros encontrados'}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas mejoradas */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: 'ri-file-list-3-line' },
            { label: 'Completadas', value: stats.completed, color: 'green', icon: 'ri-checkbox-circle-line' },
            { label: 'En progreso', value: stats.inProgress, color: 'blue', icon: 'ri-loader-4-line' },
            { label: 'Pendientes', value: stats.pending, color: 'yellow', icon: 'ri-time-line' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-br ${
                stat.color === 'green' ? 'from-green-500 to-green-600' :
                stat.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                'from-blue-500 to-blue-600'
              } rounded-lg flex items-center justify-center shadow-sm`}>
                <i className={`${stat.icon} text-white text-lg`}></i>
              </div>
              <div className={`text-2xl font-bold ${
                stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-blue-600 dark:text-blue-400'
              }`}>{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de datos mejorada */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {[
                { label: 'Tarea', icon: 'ri-task-line' },
                { label: 'Proyecto', icon: 'ri-folder-line' },
                { label: 'Asignado', icon: 'ri-user-line' },
                { label: 'Estado', icon: 'ri-flag-line' },
                { label: 'Prioridad', icon: 'ri-alarm-warning-line' },
                { label: 'Vencimiento', icon: 'ri-calendar-line' },
                { label: 'Completada', icon: 'ri-checkbox-circle-line' },
                { label: 'Duración', icon: 'ri-time-line' }
              ].map((header, index) => (
                <th key={index} className={`text-left py-4 ${index === 0 ? 'px-6' : 'px-4'} text-sm font-semibold text-gray-700 dark:text-gray-300`}>
                  <div className="flex items-center gap-2">
                    <i className={`${header.icon} text-gray-500 dark:text-gray-400`}></i>
                    {header.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'
              }`}>
                <td className="py-4 px-6">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                    {item.task}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.project}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {item.assignee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.assignee}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{formatDate(item.dueDate)}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{formatDate(item.completedDate)}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.duration}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nota informativa mejorada */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
        <div className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-400">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-white"></i>
          </div>
          <div>
            <p className="font-medium">Vista previa limitada</p>
            <p className="text-blue-600 dark:text-blue-300 text-xs">
              El reporte completo incluirá todos los registros que coincidan con tus filtros configurados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
