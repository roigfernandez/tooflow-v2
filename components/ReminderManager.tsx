'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Reminder {
  id: string;
  user_id: string;
  task_id?: string;
  project_id?: string;
  title: string;
  description?: string;
  reminder_date: string;
  reminder_type: 'task_due' | 'project_deadline' | 'meeting' | 'custom';
  status: 'active' | 'sent' | 'paused' | 'completed';
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  channels: string[];
  created_at: string;
  task?: { title: string };
  project?: { name: string };
}

// Demo reminders data
const DEMO_REMINDERS: any[] = [
  {
    id: 'rem1',
    user_id: 'demo-user',
    task_id: '2',
    title: 'Revisar implementación de autenticación',
    description: 'Verificar que todos los endpoints estén seguros',
    reminder_date: '2024-01-25T09:00:00Z',
    reminder_type: 'task_due',
    status: 'active',
    frequency: 'once',
    channels: ['notification', 'email'],
    created_at: '2024-01-20T10:00:00Z',
    task: { title: 'Implementar autenticación' }
  },
  {
    id: 'rem2',
    user_id: 'demo-user',
    task_id: '3',
    title: 'Reunión de revisión de base de datos',
    description: 'Discutir el esquema final antes de implementar',
    reminder_date: '2024-02-10T14:00:00Z',
    reminder_type: 'meeting',
    status: 'active',
    frequency: 'once',
    channels: ['notification'],
    created_at: '2024-01-18T15:00:00Z',
    task: { title: 'Configurar base de datos' }
  },
  {
    id: 'rem3',
    user_id: 'demo-user',
    project_id: '1',
    title: 'Deadline del Proyecto Alpha',
    description: 'Fecha límite para entregar el proyecto completo',
    reminder_date: '2024-02-28T23:59:00Z',
    reminder_type: 'project_deadline',
    status: 'active',
    frequency: 'once',
    channels: ['notification', 'email'],
    created_at: '2024-01-05T12:00:00Z',
    project: { name: 'Proyecto Alpha' }
  },
  {
    id: 'rem4',
    user_id: 'demo-user',
    title: 'Revisión semanal de progreso',
    description: 'Revisar el avance de todas las tareas',
    reminder_date: '2024-01-22T10:00:00Z',
    reminder_type: 'custom',
    status: 'sent',
    frequency: 'weekly',
    channels: ['notification'],
    created_at: '2024-01-01T08:00:00Z'
  }
];

export default function ReminderManager() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'sent' | 'paused'>('all');

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminder_date: '',
    reminder_type: 'custom' as const,
    frequency: 'once' as const,
    channels: ['notification'] as string[]
  });

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = () => {
    setLoading(true);
    // Load demo reminders
    setReminders(DEMO_REMINDERS);
    setLoading(false);
  };

  const createReminder = () => {
    if (!user || !newReminder.title || !newReminder.reminder_date) return;

    const reminder = {
      id: `rem${Date.now()}`,
      user_id: user.id,
      title: newReminder.title,
      description: newReminder.description,
      reminder_date: newReminder.reminder_date,
      reminder_type: newReminder.reminder_type,
      frequency: newReminder.frequency,
      channels: newReminder.channels,
      status: 'active' as const,
      created_at: new Date().toISOString()
    };

    DEMO_REMINDERS.push(reminder);
    setReminders([...DEMO_REMINDERS]);

    setNewReminder({
      title: '',
      description: '',
      reminder_date: '',
      reminder_type: 'custom',
      frequency: 'once',
      channels: ['notification']
    });
    setShowCreateForm(false);
  };

  const updateReminderStatus = (id: string, status: string) => {
    const index = DEMO_REMINDERS.findIndex(r => r.id === id);
    if (index !== -1) {
      DEMO_REMINDERS[index].status = status;
      setReminders([...DEMO_REMINDERS]);
    }
  };

  const deleteReminder = (id: string) => {
    const index = DEMO_REMINDERS.findIndex(r => r.id === id);
    if (index !== -1) {
      DEMO_REMINDERS.splice(index, 1);
      setReminders([...DEMO_REMINDERS]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_due': return 'ri-task-line';
      case 'project_deadline': return 'ri-folder-line';
      case 'meeting': return 'ri-calendar-event-line';
      default: return 'ri-alarm-line';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'sent': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'paused': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'completed': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const filteredReminders = reminders.filter(reminder =>
    filter === 'all' || reminder.status === filter
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recordatorios</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          <span className="hidden sm:inline">Nuevo Recordatorio</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'Activos' },
          { key: 'sent', label: 'Enviados' },
          { key: 'paused', label: 'Pausados' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 sm:px-4 py-2 font-medium border-b-2 whitespace-nowrap ${filter === key
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reminders list */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-alarm-line text-4xl text-gray-300 dark:text-gray-600 mb-4 block"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {filter === 'all' ? 'No hay recordatorios' : `No hay recordatorios ${filter}`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Crea tu primer recordatorio para no olvidar tareas importantes
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder) => (
            <div key={reminder.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(reminder.status)}`}>
                    <i className={`${getTypeIcon(reminder.reminder_type)} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {reminder.title}
                    </h3>
                    {reminder.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{reminder.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        <i className="ri-calendar-line mr-1"></i>
                        {new Date(reminder.reminder_date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reminder.status)}`}>
                        {reminder.status}
                      </span>
                      <span>
                        <i className="ri-repeat-line mr-1"></i>
                        {reminder.frequency}
                      </span>
                    </div>
                    {(reminder.task?.title || reminder.project?.name) && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {reminder.task?.title && (
                          <span className="mr-4">
                            <i className="ri-task-line mr-1"></i>
                            {reminder.task.title}
                          </span>
                        )}
                        {reminder.project?.name && (
                          <span>
                            <i className="ri-folder-line mr-1"></i>
                            {reminder.project.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {reminder.status === 'active' && (
                    <button
                      onClick={() => updateReminderStatus(reminder.id, 'paused')}
                      className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                      title="Pausar"
                    >
                      <i className="ri-pause-line text-lg"></i>
                    </button>
                  )}
                  {reminder.status === 'paused' && (
                    <button
                      onClick={() => updateReminderStatus(reminder.id, 'active')}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      title="Activar"
                    >
                      <i className="ri-play-line text-lg"></i>
                    </button>
                  )}
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    title="Eliminar"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create reminder modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Nuevo Recordatorio</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Título del recordatorio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha y hora *
                </label>
                <input
                  type="datetime-local"
                  value={newReminder.reminder_date}
                  onChange={(e) => setNewReminder({ ...newReminder, reminder_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={newReminder.reminder_type}
                  onChange={(e) => setNewReminder({ ...newReminder, reminder_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="custom">Personalizado</option>
                  <option value="task_due">Vencimiento de tarea</option>
                  <option value="project_deadline">Fecha límite de proyecto</option>
                  <option value="meeting">Reunión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frecuencia
                </label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="once">Una vez</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="hidden sm:inline">Cancelar</span>
                <span className="sm:hidden">✕</span>
              </button>
              <button
                onClick={createReminder}
                disabled={!newReminder.title || !newReminder.reminder_date}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i className="ri-add-line sm:hidden"></i>
                <span className="hidden sm:inline">Crear Recordatorio</span>
                <span className="sm:hidden">Crear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
