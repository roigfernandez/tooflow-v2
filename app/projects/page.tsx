
'use client';
import { useState, useEffect } from 'react';
import FloatingActionButton from '@/components/FloatingActionButton';
import ProjectCard from '@/components/ProjectCard';
import AuthGuard from '@/components/AuthGuard';
import BottomNavigation from '@/components/BottomNavigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  tasks: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  nextDeadline: string;
  team: string[];
  priority: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      // Obtener proyectos donde el usuario es miembro
      const { data: projectMemberships } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id);

      const projectIds = projectMemberships?.map(pm => pm.project_id) || [];

      if (projectIds.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Obtener proyectos
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds);

      // Obtener tareas para cada proyecto
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .in('project_id', projectIds);

      // Obtener miembros de cada proyecto
      const { data: membersData } = await supabase
        .from('project_members')
        .select(`
          project_id,
          profiles (full_name)
        `)
        .in('project_id', projectIds);

      // Formatear proyectos
      const formattedProjects = await Promise.all(
        (projectsData || []).map(async (project) => {
          const projectTasks = tasksData?.filter(task => task.project_id === project.id) || [];
          
          const pendingTasks = projectTasks.filter(task => task.status === 'pendiente').length;
          const inProgressTasks = projectTasks.filter(task => task.status === 'en_progreso').length;
          const completedTasks = projectTasks.filter(task => task.status === 'completada').length;
          const totalTasks = projectTasks.length;
          
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          // Obtener próxima fecha límite
          const upcomingTasks = projectTasks
            .filter(task => task.due_date && task.status !== 'completada')
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
          
          const nextDeadline = upcomingTasks.length > 0 ? upcomingTasks[0].due_date : 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +30 días por defecto

          // Obtener miembros del equipo
          const projectMembers = membersData?.filter(member => member.project_id === project.id) || [];
          const team = projectMembers.map(member => member.profiles?.full_name || 'Usuario').filter(Boolean);

          // Determinar prioridad basada en fechas límite y tareas pendientes
          let priority = 'Media';
          const daysUntilDeadline = Math.ceil(
            (new Date(nextDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilDeadline <= 3 || pendingTasks > 10) {
            priority = 'Urgente';
          } else if (daysUntilDeadline <= 7 || pendingTasks > 5) {
            priority = 'Alta';
          } else if (pendingTasks <= 2 && progress > 80) {
            priority = 'Baja';
          }

          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            color: project.color,
            progress,
            tasks: {
              pending: pendingTasks,
              in_progress: inProgressTasks,
              completed: completedTasks
            },
            nextDeadline,
            team,
            priority
          };
        })
      );

      setProjects(formattedProjects);

    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const getSortedAndFilteredProjects = () => {
    let filtered = projects;
    
    if (filterPriority !== 'all') {
      filtered = projects.filter(project => 
        project.priority.toLowerCase() === filterPriority
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'deadline':
          return new Date(a.nextDeadline).getTime() - new Date(b.nextDeadline).getTime();
        case 'priority':
          const priorityOrder = { 'Urgente': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
          <main className="flex-1 p-6 pb-24 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
          <BottomNavigation />
        </div>
      </AuthGuard>
    );
  }

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.progress < 100).length;
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.pending + p.tasks.in_progress + p.tasks.completed, 0);
  const avgProgress = totalProjects > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects) : 0;

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6 pb-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header consistente */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Proyectos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Administra y supervisa todos tus proyectos
                </p>
              </div>
              
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                      showFilters 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-filter-3-line text-sm"></i>
                    </div>
                    Filtros
                  </button>
                  
                  <Link 
                    href="/projects/new"
                    className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-folder-add-line text-sm"></i>
                    </div>
                    Nuevo Proyecto
                  </Link>
                </div>
              </div>
            </div>

            {/* KPIs mejorados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-folder-line text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalProjects}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Proyectos</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-play-circle-line text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeProjects}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Proyectos Activos</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-task-line text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tareas</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-progress-3-line text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgProgress}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Progreso Promedio</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros mejorados */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordenar por</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 pr-8 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="name">Nombre</option>
                      <option value="progress">Progreso</option>
                      <option value="deadline">Fecha límite</option>
                      <option value="priority">Prioridad</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por prioridad</label>
                    <select 
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-4 py-3 pr-8 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Todas las prioridades</option>
                      <option value="urgente">Urgente</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getSortedAndFilteredProjects().map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {getSortedAndFilteredProjects().length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-folder-line text-gray-400 dark:text-gray-500 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No hay proyectos</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {filterPriority !== 'all' ? 
                    'No se encontraron proyectos con los filtros seleccionados' :
                    'Aún no tienes proyectos asignados. Contacta con tu equipo para que te agreguen a un proyecto.'
                  }
                </p>
                <Link 
                  href="/projects/new"
                  className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  <i className="ri-add-line text-lg"></i>
                  Crear Primer Proyecto
                </Link>
              </div>
            )}
          </div>
        </main>

        <FloatingActionButton />
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
