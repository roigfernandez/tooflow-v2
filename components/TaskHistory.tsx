'use client';
import { useState, useEffect } from 'react';

interface HistoryEntry {
  id: string;
  action: string;
  author: string;
  timestamp: string;
  details: string;
  justification?: string;
}

interface TaskHistoryProps {
  taskId: string;
}

// Demo activity logs
const DEMO_ACTIVITY_LOGS: any[] = [
  {
    id: 'log1',
    task_id: '1',
    user_id: 'demo-user',
    action: 'created',
    entity_type: 'task',
    details: { title: 'Diseñar interfaz de usuario' },
    created_at: '2024-01-01T00:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log2',
    task_id: '1',
    user_id: 'demo-user',
    action: 'status_changed',
    entity_type: 'task',
    details: { from: 'pending', to: 'in_progress' },
    created_at: '2024-01-05T09:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log3',
    task_id: '1',
    user_id: 'demo-user',
    action: 'status_changed',
    entity_type: 'task',
    details: { from: 'in_progress', to: 'completed' },
    created_at: '2024-01-14T10:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log4',
    task_id: '2',
    user_id: 'demo-user',
    action: 'created',
    entity_type: 'task',
    details: { title: 'Implementar autenticación' },
    created_at: '2024-01-10T00:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log5',
    task_id: '2',
    user_id: 'demo-user',
    action: 'status_changed',
    entity_type: 'task',
    details: { from: 'pending', to: 'in_progress' },
    created_at: '2024-01-15T08:30:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log6',
    task_id: '2',
    user_id: 'demo-user',
    action: 'updated',
    entity_type: 'task',
    details: { field: 'description', value: 'Sistema de login y registro' },
    created_at: '2024-01-16T14:20:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  }
];

export default function TaskHistory({ taskId }: TaskHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [taskId]);

  const loadHistory = () => {
    setLoading(true);

    // Filter logs for this task
    const taskLogs = DEMO_ACTIVITY_LOGS.filter(log => log.task_id === taskId);

    // Transform to HistoryEntry format
    const entries: HistoryEntry[] = taskLogs.map(log => {
      let action = '';
      let details = '';

      switch (log.action) {
        case 'created':
          action = 'Tarea creada';
          details = `Se creó la tarea "${log.details.title}"`;
          break;
        case 'status_changed':
          action = 'Estado cambiado';
          const statusMap: any = {
            'pending': 'Pendiente',
            'in_progress': 'En progreso',
            'completed': 'Completada'
          };
          details = `Estado cambiado de "${statusMap[log.details.from]}" a "${statusMap[log.details.to]}"`;
          break;
        case 'updated':
          action = 'Tarea actualizada';
          details = `Se actualizó el campo "${log.details.field}"`;
          break;
        default:
          action = 'Acción realizada';
          details = 'Se realizó una modificación';
      }

      return {
        id: log.id,
        action,
        author: log.profiles.full_name,
        timestamp: log.created_at,
        details
      };
    });

    setHistory(entries);
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Tarea creada': return 'ri-add-circle-line text-green-500';
      case 'Estado cambiado': return 'ri-refresh-line text-blue-500';
      case 'Fecha modificada': return 'ri-calendar-event-line text-orange-500';
      case 'Comentario agregado': return 'ri-chat-3-line text-purple-500';
      case 'Asignación cambiada': return 'ri-user-line text-indigo-500';
      case 'Tarea actualizada': return 'ri-edit-line text-yellow-500';
      default: return 'ri-information-line text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <i className="ri-history-line text-2xl mb-2 block"></i>
          <p className="text-sm">No hay historial disponible</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

          {history.map((entry, index) => (
            <div key={entry.id} className="relative flex gap-4 pb-6">
              {/* Action icon */}
              <div className="relative z-10 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
                <i className={`${getActionIcon(entry.action)} text-lg`}></i>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {entry.action}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {entry.details}
                      </p>

                      {entry.justification && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
                          <h5 className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                            Justificación:
                          </h5>
                          <p className="text-xs text-yellow-700 dark:text-yellow-400">
                            {entry.justification}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{entry.author}</span>
                    <span>•</span>
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}