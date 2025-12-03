
'use client';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface ChartData {
  tasksByStatus: Array<{ name: string; value: number; color: string }>;
  tasksByProject: Array<{ name: string; tasks: number; completed: number; color: string }>;
  tasksByUser: Array<{ name: string; tasks: number; completed: number; avatar: string }>;
  productivityTrend?: Array<{ day: string; completed: number; created: number; efficiency: number }>;
  timeDistribution?: Array<{ category: string; hours: number; color: string }>;
}

interface DashboardChartsProps {
  data?: ChartData;
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const [selectedChart, setSelectedChart] = useState('overview');

  // Datos por defecto cuando no hay datos disponibles
  const defaultData: ChartData = {
    tasksByStatus: [
      { name: 'Completadas', value: 12, color: '#10B981' },
      { name: 'En Progreso', value: 8, color: '#F59E0B' },
      { name: 'Pendientes', value: 15, color: '#EF4444' },
      { name: 'En Revisión', value: 5, color: '#8B5CF6' }
    ],
    tasksByProject: [
      { name: 'Web App', tasks: 15, completed: 12, color: '#3B82F6' },
      { name: 'Mobile', tasks: 10, completed: 7, color: '#10B981' },
      { name: 'API', tasks: 8, completed: 6, color: '#F59E0B' },
      { name: 'Testing', tasks: 6, completed: 4, color: '#EF4444' }
    ],
    tasksByUser: [
      { name: 'Ana García', tasks: 12, completed: 10, avatar: 'AG' },
      { name: 'Carlos López', tasks: 15, completed: 12, avatar: 'CL' },
      { name: 'María Silva', tasks: 8, completed: 6, avatar: 'MS' },
      { name: 'Juan Pérez', tasks: 10, completed: 7, avatar: 'JP' },
      { name: 'Laura Torres', tasks: 6, completed: 5, avatar: 'LT' }
    ]
  };

  // Usar datos proporcionados o datos por defecto
  const chartData = data || defaultData;

  // Datos de ejemplo para tendencia de productividad
  const productivityTrend = chartData.productivityTrend || [
    { day: 'Lun', completed: 12, created: 8, efficiency: 85 },
    { day: 'Mar', completed: 15, created: 10, efficiency: 90 },
    { day: 'Mié', completed: 10, created: 12, efficiency: 75 },
    { day: 'Jue', completed: 18, created: 9, efficiency: 95 },
    { day: 'Vie', completed: 14, created: 11, efficiency: 82 },
    { day: 'Sáb', completed: 8, created: 5, efficiency: 88 },
    { day: 'Dom', completed: 6, created: 3, efficiency: 92 }
  ];

  // Datos de distribución de tiempo
  const timeDistribution = chartData.timeDistribution || [
    { category: 'Desarrollo', hours: 32, color: '#3B82F6' },
    { category: 'Reuniones', hours: 12, color: '#EF4444' },
    { category: 'Documentación', hours: 8, color: '#F59E0B' },
    { category: 'Testing', hours: 14, color: '#10B981' },
    { category: 'Planificación', hours: 6, color: '#8B5CF6' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {entry.value}
                {entry.name === 'Eficiencia' && '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTabs = [
    { id: 'overview', label: 'General', shortLabel: 'Hoy', icon: 'ri-dashboard-line' },
    { id: 'trends', label: 'Tendencias', shortLabel: 'Semana', icon: 'ri-line-chart-line' },
    { id: 'distribution', label: 'Distribución', shortLabel: 'Mes', icon: 'ri-pie-chart-line' }
  ];

  return (
    <div className="space-y-6">
      {/* Selector de gráficos optimizado para móvil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Análisis Avanzado
        </h2>
        
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedChart(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0 ${
                selectedChart === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <i className={`${tab.icon} text-base`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vista General */}
      {selectedChart === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de tareas por estado mejorado */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <i className="ri-pie-chart-line text-blue-500"></i>
                Estado de Tareas
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  Actualizado hace 5m
                </span>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {chartData.tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda mejorada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {chartData.tasksByStatus.map((item, index) => {
                const total = chartData.tasksByStatus.reduce((sum, task) => sum + task.value, 0);
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {item.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico de progreso por proyecto mejorado */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <i className="ri-bar-chart-line text-green-500"></i>
                Progreso por Proyecto
              </h3>
              <button className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1">
                <i className="ri-external-link-line"></i>
                Ver detalles
              </button>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.tasksByProject} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasks" name="Total" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completadas" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Estadísticas del proyecto */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700 dark:text-green-400 font-medium">
                  Proyecto más productivo
                </span>
                <span className="text-green-900 dark:text-green-100 font-bold">
                  {chartData.tasksByProject.length > 0 && 
                    chartData.tasksByProject.reduce((best, project) => 
                      (project.completed / project.tasks) > (best.completed / best.tasks) ? project : best
                    ).name
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Tendencias */}
      {selectedChart === 'trends' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Gráfico de tendencia de productividad */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <i className="ri-line-chart-line text-purple-500"></i>
                Tendencia de Productividad Semanal
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Completadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Creadas</span>
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityTrend}>
                  <defs>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#completedGradient)"
                    name="Completadas"
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="url(#createdGradient)"
                    name="Creadas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Métricas de tendencia */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {productivityTrend.reduce((sum, day) => sum + day.completed, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completadas esta semana</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(productivityTrend.reduce((sum, day) => sum + day.efficiency, 0) / productivityTrend.length)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Eficiencia promedio</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  +15%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Mejora vs semana anterior</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Distribución */}
      {selectedChart === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución de tiempo */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <i className="ri-time-line text-orange-500"></i>
                Distribución de Tiempo
              </h3>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="hours"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rendimiento detallado por usuario */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <i className="ri-team-line text-indigo-500"></i>
                Rendimiento del Equipo
              </h3>
            </div>

            <div className="space-y-4">
              {chartData.tasksByUser.slice(0, 5).map((user, index) => {
                const completionRate = user.tasks > 0 ? Math.round((user.completed / user.tasks) * 100) : 0;
                const isTopPerformer = completionRate >= 80;

                return (
                  <div key={index} className={`p-4 rounded-lg border transition-all relative ${
                    isTopPerformer 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          isTopPerformer 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          {user.avatar}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {user.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.completed} de {user.tasks} tareas completadas
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          isTopPerformer 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {completionRate}%
                        </div>
                        {isTopPerformer && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Top performer
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isTopPerformer 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : completionRate >= 60 ? 'bg-blue-500' :
                              completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>

                    {isTopPerformer && (
                      <i className="ri-medal-line absolute top-2 right-2 text-yellow-400 text-lg"></i>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
