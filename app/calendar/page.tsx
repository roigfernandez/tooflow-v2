
'use client';
import { useState, useEffect } from 'react';
import FloatingActionButton from '@/components/FloatingActionButton';
import CalendarView from '@/components/CalendarView';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState('Todos los proyectos');
  const [selectedAssignee, setSelectedAssignee] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [projects, setProjects] = useState<string[]>(['Todos los proyectos']);
  const [assignees, setAssignees] = useState<string[]>(['Todos']);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const statuses = ['Todos', 'Pendiente', 'En progreso', 'Completada'];

  useEffect(() => {
    if (user) {
      fetchFilterOptions();
    }
  }, [user]);

  const fetchFilterOptions = async () => {
    if (!user) return;

    try {
      // Obtener proyectos del usuario
      const { data: projectsData } = await supabase
        .from('project_members')
        .select('projects(name)')
        .eq('user_id', user.id);

      const projectNames = [
        'Todos los proyectos',
        ...new Set(projectsData?.map(pm => pm.projects?.name).filter(Boolean) || []),
      ];
      setProjects(projectNames);

      // Obtener usuarios asignados
      const { data: assigneesData } = await supabase
        .from('profiles')
        .select('full_name')
        .not('full_name', 'is', null);

      const assigneeNames = [
        'Todos',
        ...new Set(assigneesData?.map(p => p.full_name).filter(Boolean) || []),
      ];
      setAssignees(assigneeNames);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const getDateTitle = () => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return `${weekStart.getDate()} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
    } else {
      return `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const clearFilters = () => {
    setSelectedProject('Todos los proyectos');
    setSelectedAssignee('Todos');
    setSelectedStatus('Todos');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchFilterOptions();
    setRefreshing(false);
  };

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
        <main className="flex-1 p-6 pb-24 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header consistente con dashboard */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Calendario
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Visualiza y gestiona tus tareas en el tiempo
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-refresh-line text-sm ${refreshing ? 'animate-spin' : ''}`}></i>
                  </div>
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-calendar-todo-line text-sm"></i>
                    </div>
                    Hoy
                  </button>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                      showFilters
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-filter-3-line text-sm"></i>
                    </div>
                    Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Controles de vista mejorados */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('month')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'month'
                          ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-calendar-line text-sm"></i>
                      </div>
                      Mes
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'week'
                          ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-calendar-2-line text-sm"></i>
                      </div>
                      Semana
                    </button>
                    <button
                      onClick={() => setViewMode('day')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'day'
                          ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-calendar-event-line text-sm"></i>
                      </div>
                      Día
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getDateTitle()}</h2>

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => navigateDate('prev')}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-arrow-left-s-line text-gray-600 dark:text-gray-300 text-sm"></i>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateDate('next')}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-arrow-right-s-line text-gray-600 dark:text-gray-300 text-sm"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de filtros mejorado */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtros de Calendario</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    <div className="w-4 h-4 flex items-center justify-center inline-block mr-1">
                      <i className="ri-close-circle-line text-sm"></i>
                    </div>
                    Limpiar filtros
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proyecto</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-3 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      {projects.map(project => (
                        <option key={project} value={project}>{project}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asignado a</label>
                    <select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      className="w-full px-4 py-3 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      {assignees.map(assignee => (
                        <option key={assignee} value={assignee}>{assignee}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-3 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Vista del calendario */}
            <CalendarView
              currentDate={currentDate}
              viewMode={viewMode}
              filters={{
                project: selectedProject,
                assignee: selectedAssignee,
                status: selectedStatus,
              }}
            />
          </div>
        </main>

        <FloatingActionButton />
      </div>
    </AuthGuard>
  );
}
