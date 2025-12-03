'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import TaskTable from '@/components/TaskTable';
import ProjectComments from '@/components/ProjectComments';
import DateChangeModal from '@/components/DateChangeModal';
import Link from 'next/link';

interface ProjectDetailProps {
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  start_date: string;
  end_date: string;
  budget?: string;
  client?: string;
  created_by: string;
}

interface ProjectMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [dateChangeModal, setDateChangeModal] = useState<{
    isOpen: boolean;
    taskId: string;
    currentDate: string;
  }>({ isOpen: false, taskId: '', currentDate: '' });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      // Cargar datos del proyecto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error cargando proyecto:', projectError);
        return;
      }

      setProject(projectData);

      // Cargar miembros del proyecto
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          profiles:user_id(id, full_name, email, avatar_url)
        `)
        .eq('project_id', projectId);

      if (!membersError && membersData) {
        const formattedMembers: ProjectMember[] = membersData.map(member => ({
          id: member.profiles.id,
          full_name: member.profiles.full_name,
          email: member.profiles.email,
          avatar_url: member.profiles.avatar_url,
          role: member.role
        }));
        setProjectMembers(formattedMembers);
      }

      // Cargar tareas del proyecto
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          priority,
          due_date,
          status,
          assignee:profiles(id, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (!tasksError && tasksData) {
        setProjectTasks(tasksData);
      }

    } catch (error) {
      console.error('Error cargando datos del proyecto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getTaskCounts = () => {
    return {
      pending: projectTasks.filter(task => task.status === 'pending').length,
      in_progress: projectTasks.filter(task => task.status === 'in-progress').length,
      completed: projectTasks.filter(task => task.status === 'completed').length
    };
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId);

      if (error) {
        console.error('Error completando tarea:', error);
        return;
      }

      setProjectTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const }
          : task
      ));
    } catch (error) {
      console.error('Error completando tarea:', error);
    }
  };

  const handleTaskEdit = (taskId: string) => {
    router.push(`/tasks/${taskId}/edit`);
  };

  const handleTaskChangeDate = (taskId: string, currentDate: string) => {
    setDateChangeModal({
      isOpen: true,
      taskId,
      currentDate: currentDate.split('/').reverse().join('-')
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTasksForTable = (tasks: Task[]) => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: new Date(task.due_date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      project: project?.name || '',
      assignee: task.assignee.full_name,
      status: task.status,
      avatar: getInitials(task.assignee.full_name),
      daysUntilDue: Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Cargando..." showSearch={false} />
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
          <div className="animate-pulse space-y-6">
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

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Proyecto no encontrado" showSearch={false} />
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6 flex items-center justify-center">
          <div className="text-center">
            <i className="ri-folder-line text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Proyecto no encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">El proyecto que buscas no existe o no tienes permisos para verlo.</p>
            <Link 
              href="/projects"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i className="ri-arrow-left-line"></i>
              Volver a Proyectos
            </Link>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const progress = calculateProgress();
  const taskCounts = getTaskCounts();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Detalle del Proyecto" showSearch={false} />
      
      <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
        {/* Navegación breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link href="/projects" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Proyectos
          </Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{project.name}</span>
        </div>

        {/* Header del proyecto */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                ></div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {project.status}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {project.description}
              </p>

              {/* Información del proyecto */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha inicio</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatDate(project.start_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha fin estimada</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatDate(project.end_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progreso</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{progress}%</div>
                </div>
                {project.budget && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Presupuesto</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{project.budget}</div>
                  </div>
                )}
              </div>

              {/* Participantes */}
              {projectMembers.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Participantes del proyecto</div>
                  <div className="flex flex-wrap gap-3">
                    {projectMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                        <div className="w-8 h-8 flex-shrink-0">
                          {member.avatar_url ? (
                            <img 
                              src={member.avatar_url} 
                              alt={member.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                              {getInitials(member.full_name)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/tasks/new?project=${projectId}`}
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <i className="ri-add-line text-lg"></i>
                Nueva Tarea
              </Link>
              
              <Link
                href={`/projects/${project.id}/invite`}
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <i className="ri-user-add-line text-lg"></i>
                Invitar Miembros
              </Link>
              
              <Link
                href={`/projects/${project.id}/edit`}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <i className="ri-edit-line text-lg"></i>
                Editar
              </Link>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso del proyecto</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: project.color
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <i className="ri-task-line"></i>
                  Tareas
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {projectTasks.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <i className="ri-chat-3-line"></i>
                  Comentarios
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Tareas */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tareas del Proyecto</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Gestiona todas las tareas relacionadas con este proyecto
                    </p>
                  </div>
                  <Link
                    href={`/tasks/new?project=${projectId}`}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    <i className="ri-add-line"></i>
                    Nueva Tarea
                  </Link>
                </div>
                
                {projectTasks.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                    <i className="ri-task-line text-4xl text-gray-400 dark:text-gray-500 mb-4 block"></i>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay tareas en este proyecto</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Comienza agregando la primera tarea del proyecto</p>
                    <Link
                      href={`/tasks/new?project=${projectId}`}
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-6   0 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <i className="ri-add-line"></i>
                      Crear Primera Tarea
                    </Link>
                  </div>
                ) : (
                  <TaskTable 
                    tasks={formatTasksForTable(projectTasks)}
                    onComplete={handleTaskComplete}
                    onEdit={handleTaskEdit}
                    onChangeDate={handleTaskChangeDate}
                  />
                )}
              </div>
            )}

            {/* Tab: Comentarios */}
            {activeTab === 'comments' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comentarios del Proyecto</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Conversación del equipo sobre el progreso y decisiones del proyecto
                  </p>
                </div>
                
                <ProjectComments projectId={projectId} />
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNavigation />

      {/* Modal de cambio de fecha */}
      <DateChangeModal
        isOpen={dateChangeModal.isOpen}
        onClose={() => setDateChangeModal({ isOpen: false, taskId: '', currentDate: '' })}
        taskId={dateChangeModal.taskId}
        currentDate={dateChangeModal.currentDate}
      />
    </div>
  );
}
