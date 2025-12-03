'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsChartsProps {
  data: {
    productivity: any[];
    tasks: any[];
    projects: any[];
    timeline: any[];
  };
  dateRange: string;
}

export default function ReportsCharts({ data, dateRange }: ReportsChartsProps) {
  const [activeChart, setActiveChart] = useState('productivity');

  const chartColors = {
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const productivityData = data.productivity || [
    { name: 'Lun', completadas: 12, pendientes: 8, vencidas: 2 },
    { name: 'Mar', completadas: 19, pendientes: 5, vencidas: 1 },
    { name: 'Mié', completadas: 15, pendientes: 7, vencidas: 3 },
    { name: 'Jue', completadas: 22, pendientes: 4, vencidas: 0 },
    { name: 'Vie', completadas: 18, pendientes: 6, vencidas: 2 },
    { name: 'Sáb', completadas: 8, pendientes: 3, vencidas: 1 },
    { name: 'Dom', completadas: 5, pendientes: 2, vencidas: 0 }
  ];

  const projectsData = data.projects || [
    { name: 'Backend API', progreso: 85, tareas: 24 },
    { name: 'Frontend Web', progreso: 72, tareas: 18 },
    { name: 'Mobile App', progreso: 45, tareas: 32 },
    { name: 'Database', progreso: 90, tareas: 12 },
    { name: 'DevOps', progreso: 60, tareas: 15 }
  ];

  const timelineData = data.timeline || [
    { fecha: '01 Ene', tareas: 45, proyectos: 8 },
    { fecha: '08 Ene', tareas: 52, proyectos: 9 },
    { fecha: '15 Ene', tareas: 48, proyectos: 10 },
    { fecha: '22 Ene', tareas: 61, proyectos: 11 },
    { fecha: '29 Ene', tareas: 58, proyectos: 12 }
  ];

  const statusDistribution = [
    { name: 'Completadas', value: 65, color: chartColors.success },
    { name: 'En Progreso', value: 20, color: chartColors.info },
    { name: 'Pendientes', value: 12, color: chartColors.warning },
    { name: 'Vencidas', value: 3, color: chartColors.danger }
  ];

  const chartTabs = [
    { id: 'productivity', label: 'Productividad', icon: 'ri-line-chart-line' },
    { id: 'projects', label: 'Proyectos', icon: 'ri-bar-chart-box-line' },
    { id: 'timeline', label: 'Línea Temporal', icon: 'ri-timeline-view' },
    { id: 'distribution', label: 'Distribución', icon: 'ri-pie-chart-line' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Analytics y Tendencias
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Análisis detallado de tu productividad - {dateRange}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeChart === tab.id
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
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
      </div>

      <div className="h-80">
        {activeChart === 'productivity' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="completadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="pendientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.warning} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.warning} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="completadas"
                stackId="1"
                stroke={chartColors.success}
                fill="url(#completadas)"
                name="Completadas"
              />
              <Area
                type="monotone"
                dataKey="pendientes"
                stackId="1"
                stroke={chartColors.warning}
                fill="url(#pendientes)"
                name="Pendientes"
              />
              <Area
                type="monotone"
                dataKey="vencidas"
                stackId="1"
                stroke={chartColors.danger}
                fill={chartColors.danger}
                fillOpacity={0.6}
                name="Vencidas"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'projects' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                type="number" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#6b7280"
                fontSize={12}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Bar 
                dataKey="progreso" 
                fill={chartColors.primary}
                radius={[0, 4, 4, 0]}
                name="Progreso %"
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="fecha" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tareas"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 6 }}
                name="Total Tareas"
              />
              <Line
                type="monotone"
                dataKey="proyectos"
                stroke={chartColors.secondary}
                strokeWidth={3}
                dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 6 }}
                name="Proyectos Activos"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {productivityData.reduce((sum, day) => sum + day.completadas, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completadas</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {productivityData.reduce((sum, day) => sum + day.pendientes, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">En Progreso</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {Math.round((productivityData.reduce((sum, day) => sum + day.completadas, 0) / 
              productivityData.reduce((sum, day) => sum + day.completadas + day.pendientes + day.vencidas, 0)) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Eficiencia</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(projectsData.reduce((sum, project) => sum + project.progreso, 0) / projectsData.length)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Progreso Promedio</div>
        </div>
      </div>
    </div>
  );
}