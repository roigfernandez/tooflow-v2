'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import BottomNavigation from '@/components/BottomNavigation';
import ReportsCharts from '@/components/ReportsCharts';
import ReportGenerator from '@/components/ReportGenerator';
import ProductivityMetrics from '@/components/ProductivityMetrics';
import ReportFilters from '@/components/ReportFilters';
import ReportPreview from '@/components/ReportPreview';

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Simular datos de reporte hasta que Supabase esté configurado
      const mockData = {
        productivity: [
          { name: 'Lun', completadas: 12, pendientes: 8, vencidas: 2 },
          { name: 'Mar', completadas: 19, pendientes: 5, vencidas: 1 },
          { name: 'Mié', completadas: 15, pendientes: 7, vencidas: 3 },
          { name: 'Jue', completadas: 22, pendientes: 4, vencidas: 0 },
          { name: 'Vie', completadas: 18, pendientes: 6, vencidas: 2 },
          { name: 'Sáb', completadas: 8, pendientes: 3, vencidas: 1 },
          { name: 'Dom', completadas: 5, pendientes: 2, vencidas: 0 }
        ],
        projects: [
          { name: 'Backend API', progreso: 85, tareas: 24 },
          { name: 'Frontend Web', progreso: 72, tareas: 18 },
          { name: 'Mobile App', progreso: 45, tareas: 32 },
          { name: 'Database', progreso: 90, tareas: 12 },
          { name: 'DevOps', progreso: 60, tareas: 15 }
        ],
        tasks: [],
        timeline: [
          { fecha: '01 Ene', tareas: 45, proyectos: 8 },
          { fecha: '08 Ene', tareas: 52, proyectos: 9 },
          { fecha: '15 Ene', tareas: 48, proyectos: 10 },
          { fecha: '22 Ene', tareas: 61, proyectos: 11 },
          { fecha: '29 Ene', tareas: 58, proyectos: 12 }
        ]
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: 'ri-line-chart-line' },
    { id: 'metrics', label: 'Métricas', icon: 'ri-dashboard-line' },
    { id: 'export', label: 'Exportar', icon: 'ri-download-line' }
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último año' }
  ];

  const getDateRangeLabel = () => {
    return dateRangeOptions.find(option => option.value === dateRange)?.label || 'Período personalizado';
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="pt-4 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
          <BottomNavigation currentPath="/reports" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <main className="pt-4 pb-24 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header consistente */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Reportes y Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Análisis detallado de tu productividad y rendimiento
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={tab.icon}></i>
                      </div>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    className="px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  >
                    {dateRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {activeTab === 'export' && <ReportGenerator />}
                </div>
              </div>
            </div>

            {/* KPIs principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-task-line text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">159</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tareas Completadas</div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">+12% vs período anterior</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-time-line text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">2.4h</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Promedio</div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">-8% mejor eficiencia</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-trophy-line text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">87%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score Productividad</div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">+5pts este mes</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="ri-folder-line text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Proyectos Activos</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">2 finalizados</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido por pestañas */}
            {activeTab === 'analytics' && reportData && (
              <div className="space-y-6">
                <ReportsCharts 
                  data={reportData} 
                  dateRange={getDateRangeLabel()}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Proyectos por Progreso
                    </h4>
                    <div className="space-y-4">
                      {reportData.projects.slice(0, 5).map((project: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <i className="ri-folder-line text-purple-600 dark:text-purple-400 text-sm"></i>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {project.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {project.tareas} tareas
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 bg-purple-500 rounded-full"
                                style={{ width: `${project.progreso}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-10 text-right">
                              {project.progreso}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Tendencias Recientes
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <i className="ri-arrow-up-line text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              Productividad en alza
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +15% esta semana
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <i className="ri-time-line text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              Mejor tiempo promedio
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              -30min por tarea
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <i className="ri-team-line text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              Colaboración activa
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              85% proyectos en equipo
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <ProductivityMetrics />
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <ReportPreview />
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-download-cloud-line text-green-600 dark:text-green-400 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Exportar Reportes Personalizados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Genera reportes detallados en PDF, Excel o CSV con los datos y métricas que necesites
                  </p>
                  <ReportGenerator />
                </div>
              </div>
            )}
          </div>
        </main>

        <BottomNavigation currentPath="/reports" />
      </div>
    </AuthGuard>
  );
}
