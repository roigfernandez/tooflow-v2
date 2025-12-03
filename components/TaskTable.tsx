'use client';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  project: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  avatar?: string;
  daysUntilDue?: number;
}

interface TaskTableProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onChangeDate?: (taskId: string, currentDate: string) => void;
}

export default function TaskTable({ tasks, onComplete, onEdit, onChangeDate }: TaskTableProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
    }
  };

  const getDueDateBadge = (daysUntilDue?: number) => {
    if (daysUntilDue === undefined) return null;
    
    if (daysUntilDue < 0) {
      return (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
          Vencida
        </span>
      );
    } else if (daysUntilDue === 0) {
      return (
        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">
          Hoy
        </span>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-medium">
          {daysUntilDue}d
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
          {daysUntilDue}d
        </span>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tarea</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Vencimiento</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Proyecto</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Asignado</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="py-3 px-4">
                  <div className="max-w-xs">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 leading-5">{task.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-4">{task.description}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                    {getPriorityText(task.priority)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{task.dueDate}</span>
                    {getDueDateBadge(task.daysUntilDue)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{task.project}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {task.avatar && (
                      <div className="w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
                        {task.avatar}
                      </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{task.assignee}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    {task.status !== 'completed' && (
                      <>
                        <button 
                          onClick={() => onChangeDate?.(task.id, task.dueDate)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                          title="Cambiar fecha"
                        >
                          <i className="ri-calendar-event-line text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 text-sm"></i>
                        </button>
                        <button 
                          onClick={() => onEdit?.(task.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Editar"
                        >
                          <i className="ri-edit-line text-gray-400 dark:text-gray-500 text-sm"></i>
                        </button>
                        <button 
                          onClick={() => onComplete?.(task.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                          title="Marcar como completada"
                        >
                          <i className="ri-check-line text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 text-sm"></i>
                        </button>
                      </>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">✓ Completada</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
