
'use client';
import { useState, useEffect } from 'react';
import BottomNavigation from '../../components/BottomNavigation';
import DashboardKPIs from '../../components/DashboardKPIs';
import DashboardCharts from '../../components/DashboardCharts';
import ProductivityInsights from '../../components/ProductivityInsights';
import AdminTaskTable from '../../components/AdminTaskTable';
import DashboardSkeleton from '../../components/DashboardSkeleton';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Datos mejorados del dashboard
  const kpiData = {
    totalTasks: 284,
    completedPercentage: 72,
    overdueTasks: 8,
    dueSoonTasks: 23,
    activeProjects: 15,
    activeUsers: 32,
    avgCompletionTime: 2.8,
    weeklyProductivity: 85,
    criticalTasks: 12
  };

  const chartData = {
    tasksByStatus: [
      { name: 'Completadas', value: 205, color: '#10B981' },
      { name: 'En Progreso', value: 48, color: '#3B82F6' },
      { name: 'Pendientes', value: 23, color: '#F59E0B' },
      { name: 'Atrasadas', value: 8, color: '#EF4444' }
    ],
    tasksByProject: [
      { name: 'Rediseño Web', tasks: 45, completed: 35, color: '#8B5CF6' },
      { name: 'App Móvil', tasks: 38, completed: 32, color: '#06B6D4' },
      { name: 'Marketing Q4', tasks: 29, completed: 26, color: '#F59E0B' },
      { name: 'Sistema CRM', tasks: 52, completed: 38, color: '#EF4444' },
      { name: 'Optimización', tasks: 24, completed: 22, color: '#10B981' },
      { name: 'Testing QA', tasks: 31, completed: 25, color: '#EC4899' },
      { name: 'Documentación', tasks: 18, completed: 16, color: '#8B5CF6' },
      { name: 'DevOps', tasks: 22, completed: 19, color: '#06B6D4' }
    ],
    tasksByUser: [
      { name: 'Ana García', tasks: 28, completed: 26, avatar: 'AG' },
      { name: 'Carlos López', tasks: 32, completed: 22, avatar: 'CL' },
      { name: 'María Rodríguez', tasks: 25, completed: 23, avatar: 'MR' },
      { name: 'Juan Pérez', tasks: 30, completed: 21, avatar: 'JP' },
      { name: 'Laura Martín', tasks: 22, completed: 20, avatar: 'LM' },
      { name: 'Diego Silva', tasks: 26, completed: 24, avatar: 'DS' },
      { name: 'Sofia Herrera', tasks: 19, completed: 18, avatar: 'SH' },
      { name: 'Miguel Torres', tasks: 24, completed: 19, avatar: 'MT' }
    ],
    productivityTrend: [
      { day: 'Lun', completed: 28, created: 22, efficiency: 88 },
      { day: 'Mar', completed: 35, created: 25, efficiency: 92 },
      { day: 'Mié', completed: 22, created: 28, efficiency: 78 },
      { day: 'Jue', completed: 42, created: 24, efficiency: 95 },
      { day: 'Vie', completed: 31, created: 26, efficiency: 85 },
      { day: 'Sáb', completed: 18, created: 12, efficiency: 90 },
      { day: 'Dom', completed: 12, created: 8, efficiency: 94 }
    ],
    timeDistribution: [
      { category: 'Desarrollo', hours: 45, color: '#3B82F6' },
      { category: 'Reuniones', hours: 18, color: '#EF4444' },
      { category: 'Documentación', hours: 12, color: '#F59E0B' },
      { category: 'Testing', hours: 22, color: '#10B981' },
      { category: 'Planificación', hours: 8, color: '#8B5CF6' },
      { category: 'Revisión de Código', hours: 15, color: '#EC4899' }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="pb-20 pt-4">
          <DashboardSkeleton />
        </div>
        <BottomNavigation currentPath="/admin" />
      </div>
    );
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="px-4 py-6 pb-24">
        {/* Encabezado mejorado del dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Panel de Control Administrativo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Análisis completo del rendimiento y gestión avanzada del equipo
              </p>
            </div>
            
            <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Sistema operativo</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedView('overview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedView === 'overview' 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-dashboard-line text-sm"></i>
                    </div>
                    Vista General
                  </button>
                  <button 
                    onClick={() => setSelectedView('tasks')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedView === 'tasks' 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-table-line text-sm"></i>
                    </div>
                    Tabla Maestro
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores de estado mejorados */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-refresh-line text-sm"></i>
                </div>
                <span>Última actualización: hace 45 segundos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-database-2-line text-sm"></i>
                </div>
                <span>Base de datos sincronizada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-shield-check-line text-sm"></i>
                </div>
                <span>Todas las conexiones seguras</span>
              </div>
            </div>
            
            <button className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium text-sm transition-colors">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-refresh-line text-sm"></i>
              </div>
              Actualizar datos
            </button>
          </div>
        </div>

        {selectedView === 'overview' && (
          <div className="space-y-8">
            {/* KPIs mejorados */}
            <DashboardKPIs data={kpiData} />

            {/* Insights de productividad */}
            <ProductivityInsights data={kpiData} />

            {/* Gráficos avanzados */}
            <DashboardCharts data={chartData} />

            {/* Acciones administrativas mejoradas */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-settings-3-line text-blue-500 text-sm"></i>
                </div>
                Herramientas Administrativas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-file-download-line text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        Exportar Reportes
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        PDF, Excel, CSV
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Generar informes completos del sistema
                  </div>
                </button>

                <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-team-line text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                        Gestión de Usuarios
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {kpiData.activeUsers} activos
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Administrar roles y permisos del equipo
                  </div>
                </button>

                <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-bar-chart-2-line text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                        Análisis Avanzado
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Métricas detalladas
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Insights de productividad y rendimiento
                  </div>
                </button>

                <button className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-settings-4-line text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                        Configuración
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Sistema y preferencias
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Ajustes globales y personalizaciones
                  </div>
                </button>
              </div>
            </div>

            {/* Alertas y notificaciones importantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-alert-line text-white text-sm"></i>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100">Tareas Críticas</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{kpiData.overdueTasks} tareas requieren atención</p>
                  </div>
                </div>
                <button className="text-sm text-red-700 dark:text-red-300 font-medium hover:text-red-800 dark:hover:text-red-200 transition-colors">
                  Revisar tareas vencidas →
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-trophy-line text-white text-sm"></i>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Rendimiento Excelente</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Productividad del {kpiData.weeklyProductivity}% esta semana</p>
                  </div>
                </div>
                <button className="text-sm text-green-700 dark:text-green-300 font-medium hover:text-green-800 dark:hover:text-green-200 transition-colors">
                  Ver detalles del progreso →
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'tasks' && (
          <AdminTaskTable />
        )}
      </div>

      <BottomNavigation currentPath="/admin" />
    </div>
  );
}
