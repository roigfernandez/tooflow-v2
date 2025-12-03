
'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import TaskFilters from '@/components/TaskFilters';
import SortOptions from '@/components/SortOptions';
import AuthGuard from '@/components/AuthGuard';
import { getFilteredTasks, sortTasksLocally } from '@/lib/task-filters';
import type { SortOption } from '@/components/SortOptions';
import Link from 'next/link';

interface FilterOptions {
  status: string[];
  priority: string[];
  assignedTo: string[];
  projects: string[];
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

function TasksContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    priority: [],
    assignedTo: [],
    projects: [],
    dateRange: { start: '', end: '' },
    search: ''
  });
  const [sort, setSort] = useState<SortOption>({
    field: 'created_at',
    direction: 'desc',
    label: 'Más recientes'
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const loadTasks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Usar datos demo hasta que Supabase esté configurado
      const demoTasks = [
        {
          id: '1',
          title: 'Revisar código del equipo',
          description: 'Code review de los últimos commits',
          status: 'pendiente',
          priority: 'alta',
          project: 'Backend API',
          assignee: 'Carlos López',
          avatar: 'CL',
          dueDate: '2024-01-15',
          projectId: '1',
          assignedTo: 'user1',
          createdBy: 'admin',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10'
        },
        {
          id: '2',
          title: 'Documentar API endpoints',
          description: 'Crear documentación completa de todos los endpoints',
          status: 'en_progreso',
          priority: 'baja',
          project: 'Backend API',
          assignee: 'María Rodríguez',
          avatar: 'MR',
          dueDate: '2024-01-20',
          projectId: '1',
          assignedTo: 'user2',
          createdBy: 'admin',
          createdAt: '2024-01-08',
          updatedAt: '2024-01-12'
        },
        {
          id: '3',
          title: 'Implementar autenticación',
          description: 'Sistema de login y registro con JWT',
          status: 'completada',
          priority: 'alta',
          project: 'Web Frontend',
          assignee: 'Ana García',
          avatar: 'AG',
          dueDate: '2024-01-12',
          projectId: '2',
          assignedTo: 'user3',
          createdBy: 'admin',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-13'
        },
        {
          id: '4',
          title: 'Optimizar consultas SQL',
          description: 'Mejorar rendimiento de la base de datos',
          status: 'revision',
          priority: 'media',
          project: 'Database',
          assignee: 'Juan Pérez',
          avatar: 'JP',
          dueDate: '2024-01-18',
          projectId: '3',
          assignedTo: 'user4',
          createdBy: 'admin',
          createdAt: '2024-01-07',
          updatedAt: '2024-01-14'
        },
        {
          id: '5',
          title: 'Diseñar interfaz móvil',
          description: 'Crear mockups para la app móvil',
          status: 'pendiente',
          priority: 'media',
          project: 'Mobile App',
          assignee: 'Luis Torres',
          avatar: 'LT',
          dueDate: '2024-01-25',
          projectId: '4',
          assignedTo: 'user5',
          createdBy: 'admin',
          createdAt: '2024-01-09',
          updatedAt: '2024-01-09'
        },
        {
          id: '6',
          title: 'Configurar CI/CD pipeline',
          description: 'Automatizar despliegues con GitHub Actions',
          status: 'vencida',
          priority: 'alta',
          project: 'DevOps',
          assignee: 'Carmen Silva',
          avatar: 'CS',
          dueDate: '2024-01-05',
          projectId: '5',
          assignedTo: 'user6',
          createdBy: 'admin',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-03'
        }
      ];

      setTasks(demoTasks);
      setFilteredTasks(demoTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user, filters, sort]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
  };

  const getTaskStats = () => {
    const total = filteredTasks.length;
    const pendientes = filteredTasks.filter(task => task.status === 'pendiente').length;
    const enProgreso = filteredTasks.filter(task => task.status === 'en_progreso').length;
    const completadas = filteredTasks.filter(task => task.status === 'completada').length;
    const vencidas = filteredTasks.filter(task => task.status === 'vencida').length;

    return { total, pendientes, enProgreso, completadas, vencidas };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Header title="Tareas" showSearch={false} />
        <div className="px-4 py-6 pb-24 pt-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation currentPath="/tasks" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header consistente */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Mis Tareas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona y organiza todas tus tareas
              </p>
            </div>
            
            <div className="flex items-center justify-end">
              <Link
                href="/tasks/new"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line text-sm"></i>
                </div>
                Nueva Tarea
              </Link>
            </div>
          </div>

          {/* KPIs de tareas mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="ri-task-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="ri-time-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.pendientes}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-xl border border-blue-200 dark:border-indigo-800 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="ri-play-circle-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.enProgreso}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En progreso</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="ri-checkbox-circle-fill text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completadas}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="ri-alarm-warning-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.vencidas}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vencidas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda mejorada */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <TaskFilters
              onFiltersChange={handleFiltersChange}
              className="w-full"
            />
          </div>

          {/* Controles de vista y ordenamiento */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <SortOptions
                    currentSort={sort}
                    onSortChange={handleSortChange}
                  />
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-list-check-2 text-sm"></i>
                    </div>
                    <span className="hidden sm:inline">Lista</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-grid-line text-sm"></i>
                    </div>
                    <span className="hidden sm:inline">Cuadrícula</span>
                  </button>
                </div>
              </div>

              {filteredTasks.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                  <span className="whitespace-nowrap">
                    Mostrando {filteredTasks.length} de {tasks.length} tareas
                  </span>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-refresh-line text-sm"></i>
                    </div>
                    <span>Actualizado hace 2m</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de tareas mejorada */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-task-line text-2xl text-gray-400 dark:text-gray-500"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No hay tareas que coincidan
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {filters.search || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f) 
                    ? "Intenta ajustar los filtros para encontrar más tareas" 
                    : "Crea tu primera tarea para comenzar a organizarte"
                  }
                </p>
                <Link
                  href="/tasks/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  Nueva Tarea
                </Link>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={loadTasks}
                  showProject={true}
                  className={viewMode === 'grid' ? '' : 'max-w-none'}
                />
              ))}
            </div>
          )}

          {/* Acciones Rápidas */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-magic-line text-white"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Acciones Rápidas
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Gestiona múltiples tareas de una vez
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm whitespace-nowrap">
                  <i className="ri-download-line flex-shrink-0"></i>
                  <span>Exportar</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm whitespace-nowrap">
                  <i className="ri-group-line flex-shrink-0"></i>
                  <span>Asignar Múltiples</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
          <Header title="Tareas" showSearch={false} />
          <div className="px-4 py-6 pb-24 pt-20">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
          <BottomNavigation currentPath="/tasks" />
        </div>
      }>
        <TasksContent />
      </Suspense>
    </AuthGuard>
  );
}
