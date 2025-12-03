
'use client';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  dueDate?: string;
  project?: any;
  project_id?: string;
  assignee?: string;
  assigned_to_profile?: any;
  status: 'pending' | 'in_progress' | 'completed';
  avatar?: string;
  daysUntilDue?: number;
}

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  variant?: 'default' | 'compact';
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onChangeDate?: (taskId: string, currentDate: string) => void;
}

export default function TaskCard({ task, compact = false, variant = 'default', onComplete, onEdit, onChangeDate }: TaskCardProps) {
  // Extraer datos de forma segura
  const projectName = task.project?.name || task.project || 'Sin proyecto';
  const projectColor = task.project?.color || '#3B82F6';
  const assigneeName = task.assigned_to_profile?.name || task.assigned_to_profile?.full_name || task.assignee || 'Sin asignar';
  const dueDate = task.due_date || task.dueDate;
  const description = task.description || '';

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'pending': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En progreso';
      case 'pending': return 'Pendiente';
      default: return 'Sin estado';
    }
  };

  const getDueDateBadge = (dueDate?: string, daysUntilDue?: number) => {
    if (!dueDate && daysUntilDue === undefined) return null;

    if (daysUntilDue !== undefined) {
      if (daysUntilDue < 0) {
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
            Vencida ({Math.abs(daysUntilDue)} días)
          </span>
        );
      } else if (daysUntilDue === 0) {
        return (
          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">
            Vence hoy
          </span>
        );
      } else if (daysUntilDue <= 3) {
        return (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-medium">
            {daysUntilDue} días
          </span>
        );
      }
    }

    return (
      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
        {dueDate ? new Date(dueDate).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short'
        }) : 'Sin fecha'}
      </span>
    );
  };

  if (compact || variant === 'compact') {
    return (
      <Link href={`/tasks/${task.id}`}>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 leading-5">
              {task.title}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: projectColor }}
              ></div>
              <span className="truncate">{projectName}</span>
            </div>
            <div className="flex-shrink-0">
              {getDueDateBadge(dueDate, task.daysUntilDue)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <Link href={`/tasks/${task.id}`}>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer leading-6">
                  {task.title}
                </h3>
              </Link>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-5">
                  {description}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                <span className="hidden sm:inline">{getPriorityText(task.priority)}</span>
                <span className="sm:hidden">{getPriorityText(task.priority).charAt(0)}</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                <span className="hidden sm:inline">{getStatusText(task.status)}</span>
                <span className="sm:hidden">
                  {task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '→' : '○'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {getDueDateBadge(dueDate, task.daysUntilDue)}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: projectColor }}
              ></div>
              <span className="truncate">{projectName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
            {assigneeName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{assigneeName}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {task.status !== 'completed' && (
            <>
              {onChangeDate && (
                <button
                  onClick={() => onChangeDate(task.id, dueDate || '')}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                  title="Cambiar fecha"
                >
                  <i className="ri-calendar-event-line text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 text-sm"></i>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(task.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Editar"
                >
                  <i className="ri-edit-line text-gray-400 dark:text-gray-500 text-sm"></i>
                </button>
              )}
              {onComplete && (
                <button
                  onClick={() => onComplete(task.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  title="Marcar como completada"
                >
                  <i className="ri-check-line text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 text-sm"></i>
                </button>
              )}
            </>
          )}
          {task.status === 'completed' && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <i className="ri-check-line"></i>
              Completada
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
