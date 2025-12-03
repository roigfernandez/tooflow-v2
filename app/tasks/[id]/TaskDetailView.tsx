
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import TaskDetailHeader from '@/components/TaskDetailHeader';
import TaskDescription from '@/components/TaskDescription';
import TaskComments from '@/components/TaskComments';
import TaskHistory from '@/components/TaskHistory';
import TaskSubtasks from '@/components/TaskSubtasks';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import AttachmentList from '@/components/AttachmentList';

interface TaskDetailViewProps {
  taskId: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  created_at: string;
  project: {
    id: string;
    name: string;
    color: string;
  };
  assignee: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  creator: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('comments');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);

  useEffect(() => {
    loadTaskData();
    getCurrentUser();
    loadAttachments();
  }, [taskId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadTaskData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          due_date,
          created_at,
          project:projects(id, name, color),
          assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url)
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error cargando tarea:', error);
        return;
      }

      setTask(data);
    } catch (error) {
      console.error('Error cargando tarea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttachments = () => {
    // Demo attachments data
    const DEMO_ATTACHMENTS: any[] = [
      {
        id: 'att1',
        task_id: '1',
        name: 'wireframes_v1.pdf',
        url: 'https://example.com/files/wireframes_v1.pdf',
        size: 2457600,
        type: 'application/pdf',
        created_at: '2024-01-05T10:00:00Z',
        created_by: 'demo-user',
        created_by_name: 'Usuario Demostración'
      },
      {
        id: 'att2',
        task_id: '1',
        name: 'design_mockup.png',
        url: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Design+Mockup',
        size: 1024000,
        type: 'image/png',
        created_at: '2024-01-08T14:30:00Z',
        created_by: 'demo-user',
        created_by_name: 'Usuario Demostración'
      },
      {
        id: 'att3',
        task_id: '2',
        name: 'auth_spec.docx',
        url: 'https://example.com/files/auth_spec.docx',
        size: 512000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        created_at: '2024-01-16T09:15:00Z',
        created_by: 'demo-user',
        created_by_name: 'Usuario Demostración'
      },
      {
        id: 'att4',
        task_id: '2',
        name: 'security_checklist.xlsx',
        url: 'https://example.com/files/security_checklist.xlsx',
        size: 256000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        created_at: '2024-01-17T11:00:00Z',
        created_by: 'demo-user',
        created_by_name: 'Usuario Demostración'
      }
    ];

    const taskAttachments = DEMO_ATTACHMENTS.filter(att => att.task_id === taskId);
    setAttachments(taskAttachments);
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task || !currentUserId) return;

    const canEdit = currentUserId === task.assignee.id || currentUserId === task.creator.id;
    if (!canEdit) {
      alert('Solo el asignado o creador de la tarea puede cambiar su estado');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error actualizando estado:', error);
        alert('Error al actualizar el estado de la tarea');
        return;
      }

      setTask(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado de la tarea');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Cargando..." showSearch={false} />
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Tarea no encontrada" showSearch={false} />
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="ri-task-line text-4xl text-gray-400 dark:text-gray-500"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Tarea no encontrada</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">La tarea que buscas no existe o no tienes permisos para verla.</p>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <i className="ri-arrow-left-line"></i>
              <span className="hidden sm:inline">Volver a Tareas</span>
              <span className="sm:hidden">Volver</span>
            </Link>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const canEdit = currentUserId === task.assignee.id || currentUserId === task.creator.id;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Detalle de Tarea" showSearch={false} />

      <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Navegación breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/tasks" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium whitespace-nowrap flex-shrink-0">
              Tareas
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 flex-shrink-0"></i>
            <Link
              href={`/projects/${task.project.id}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium truncate max-w-[150px] sm:max-w-none"
              title={task.project.name}
            >
              {task.project.name}
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 flex-shrink-0"></i>
            <span className="text-gray-900 dark:text-gray-100 font-semibold truncate max-w-[200px] sm:max-w-none" title={task.title}>
              {task.title}
            </span>
          </nav>

          {/* Header principal de la tarea */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Información principal */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                    {task.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {/* Estado */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                        {task.status === 'completed' ? 'Completada' :
                          task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </div>

                    {/* Prioridad */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.priority === 'urgent'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : task.priority === 'high'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {task.priority === 'urgent' ? 'Urgente' :
                          task.priority === 'high' ? 'Alta' :
                            task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>

                    {/* Fecha de vencimiento */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vence:</span>
                      <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <i className="ri-calendar-event-line text-gray-600 dark:text-gray-400"></i>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(task.due_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Asignación */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Asignado a:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                          {task.assignee.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {task.assignee.full_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Creado por:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                          {task.creator.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {task.creator.full_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  <Link
                    href={`/tasks/${taskId}/edit`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Editar Tarea
                  </Link>

                  {canEdit && task.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                    >
                      <i className="ri-check-circle-line"></i>
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción de la tarea */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <i className="ri-file-text-line"></i>
              Descripción
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
              <p className="whitespace-pre-wrap leading-relaxed">
                {task.description || 'No hay descripción disponible para esta tarea.'}
              </p>
            </div>
          </div>

          {/* Cambios rápidos de estado */}
          {canEdit && task.status !== 'completed' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <i className="ri-refresh-line"></i>
                Cambiar Estado
              </h3>
              <div className="flex flex-wrap gap-3">
                {task.status !== 'pending' && (
                  <button
                    onClick={() => handleStatusChange('pending')}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    <i className="ri-pause-circle-line"></i>
                    Marcar como Pendiente
                  </button>
                )}
                {task.status !== 'in-progress' && (
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    <i className="ri-play-circle-line"></i>
                    Marcar en Progreso
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  <i className="ri-check-circle-line"></i>
                  Marcar como Completada
                </button>
              </div>
            </div>
          )}

          {/* Pestañas de contenido */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'comments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <i className="ri-chat-3-line"></i>
                    <span className="font-semibold">Comentarios</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <i className="ri-history-line"></i>
                    <span className="font-semibold">Historial</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('subtasks')}
                  className={`flex-1 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'subtasks'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <i className="ri-list-check"></i>
                    <span className="font-semibold">Subtareas</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'comments' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Comentarios de la Tarea</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Conversación y colaboración sobre esta tarea
                    </p>
                  </div>
                  <TaskComments taskId={taskId} />
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Historial de Cambios</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Registro completo de todas las modificaciones realizadas
                    </p>
                  </div>
                  <TaskHistory taskId={taskId} />
                </div>
              )}

              {activeTab === 'subtasks' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Subtareas</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Divide esta tarea en pasos más pequeños y manejables
                    </p>
                  </div>
                  <TaskSubtasks taskId={taskId} />
                </div>
              )}
            </div>
          </div>

          {/* Archivos adjuntos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Archivos adjuntos
              </h3>
              <button
                onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors whitespace-nowrap"
              >
                <i className="ri-attachment-line"></i>
                Adjuntar archivo
              </button>
            </div>

            {showAttachmentUpload && (
              <div className="mb-6">
                <FileUpload
                  onUpload={(url, name, size) => {
                    const newAttachment = {
                      id: Date.now().toString(),
                      name,
                      url,
                      size,
                      type: 'application/octet-stream',
                      created_at: new Date().toISOString(),
                      created_by: user!.id,
                      created_by_name: user!.user_metadata?.full_name || 'Usuario'
                    };
                    setAttachments(prev => [...prev, newAttachment]);
                    setShowAttachmentUpload(false);
                  }}
                  accept="*/*"
                  maxSize={25}
                  multiple={true}
                  bucket="attachments"
                  folder={`tasks/${task.id}`}
                />
              </div>
            )}

            <AttachmentList
              attachments={attachments}
              onDelete={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}
              canDelete={canEdit}
            />
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
