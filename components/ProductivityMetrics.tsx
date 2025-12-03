'use client';
import { useState, useEffect } from 'react';

interface ProductivityMetricsProps {
  data?: {
    tasksCompleted: number;
    averageCompletionTime: number;
    productivityScore: number;
    streakDays: number;
    peakHours: string[];
    weeklyGoal: number;
    weeklyProgress: number;
  };
}

export default function ProductivityMetrics({ data }: ProductivityMetricsProps) {
  const [timeframe, setTimeframe] = useState('week');
  
  const defaultData = {
    tasksCompleted: 47,
    averageCompletionTime: 2.5,
    productivityScore: 85,
    streakDays: 12,
    peakHours: ['09:00-11:00', '14:00-16:00'],
    weeklyGoal: 50,
    weeklyProgress: 94
  };

  const metricsData = data || defaultData;

  const productivityLevels = [
    { min: 90, label: 'Excepcional', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { min: 75, label: 'Excelente', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { min: 60, label: 'Bueno', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { min: 40, label: 'Regular', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { min: 0, label: 'Bajo', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
  ];

  const getProductivityLevel = (score: number) => {
    return productivityLevels.find(level => score >= level.min) || productivityLevels[productivityLevels.length - 1];
  };

  const currentLevel = getProductivityLevel(metricsData.productivityScore);

  const timeframeOptions = [
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'quarter', label: 'Trimestre' }
  ];

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Métricas de Productividad
        </h3>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                timeframe === option.value
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score principal */}
      <div className={`${currentLevel.bg} rounded-xl border border-gray-200 dark:border-gray-700 p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Puntuación de Productividad
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Basado en tareas completadas, calidad y consistencia
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${currentLevel.color}`}>
              {metricsData.productivityScore}
            </div>
            <div className={`text-sm font-medium ${currentLevel.color}`}>
              {currentLevel.label}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
              style={{ width: `${metricsData.productivityScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Métricas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <i className="ri-check-circle-line text-white text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metricsData.tasksCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tareas Completadas
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-white text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metricsData.averageCompletionTime}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tiempo Promedio
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <i className="ri-fire-line text-white text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metricsData.streakDays}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Días Consecutivos
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="ri-target-line text-white text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metricsData.weeklyProgress}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Meta Semanal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horarios pico */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <i className="ri-bar-chart-line text-white"></i>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Horarios de Mayor Productividad
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Momentos del día donde eres más eficiente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metricsData.peakHours.map((timeSlot, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <i className="ri-time-line text-white text-sm"></i>
              </div>
              <div>
                <div className="font-semibold text-indigo-700 dark:text-indigo-400">
                  {timeSlot}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-300">
                  Horario pico #{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progreso hacia la meta */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Progreso Semanal
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metricsData.tasksCompleted} de {metricsData.weeklyGoal} tareas completadas
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metricsData.weeklyProgress}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              de la meta
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className="h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 relative"
              style={{ width: `${metricsData.weeklyProgress}%` }}
            >
              <div className="absolute right-0 top-0 h-4 w-4 bg-white rounded-full shadow-md transform translate-x-2"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Quedan {metricsData.weeklyGoal - metricsData.tasksCompleted} tareas
          </span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Meta: {metricsData.weeklyGoal} tareas
          </span>
        </div>
      </div>
    </div>
  );
}