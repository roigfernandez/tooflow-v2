
'use client';
import { useState } from 'react';

interface FilterProps {
  filters: {
    dateRange: { start: string; end: string };
    status: string[];
    assignees: string[];
    projects: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableUsers: { id: string; name: string; avatar: string }[];
  availableProjects: { id: string; name: string; color: string }[];
}

export default function ReportFilters({ filters, onFiltersChange, availableUsers, availableProjects }: FilterProps) {
  const [expandedSections, setExpandedSections] = useState({
    dateRange: true,
    status: true,
    assignees: false,
    projects: false
  });

  const statusOptions = [
    { id: 'pending', label: 'Pendiente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
    { id: 'in-progress', label: 'En progreso', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    { id: 'completed', label: 'Completada', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
    { id: 'cancelled', label: 'Cancelada', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateDateRange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const updateMultiSelect = (field: 'status' | 'assignees' | 'projects', value: string) => {
    const currentValues = filters[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [field]: newValues
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getThirtyDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  const setQuickDateRange = (type: 'today' | 'week' | 'month' | 'quarter') => {
    const today = new Date();
    let start: Date;
    
    switch (type) {
      case 'today':
        start = new Date(today);
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case 'quarter':
        start = new Date(today);
        start.setDate(today.getDate() - 90);
        break;
      default:
        start = new Date(today);
    }
    
    onFiltersChange({
      ...filters,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Rango de fechas */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <button
          onClick={() => toggleSection('dateRange')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className="ri-calendar-line text-white"></i>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Rango de fechas</span>
              {(filters.dateRange.start || filters.dateRange.end) && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    Activo
                  </span>
                </div>
              )}
            </div>
          </div>
          <i className={`ri-arrow-${expandedSections.dateRange ? 'up' : 'down'}-s-line text-gray-400 dark:text-gray-500 transition-transform duration-200`}></i>
        </button>
        
        {expandedSections.dateRange && (
          <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
            {/* Filtros rápidos */}
            <div className="mb-4 pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filtros rápidos</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'today', label: 'Hoy' },
                  { key: 'week', label: 'Última semana' },
                  { key: 'month', label: 'Último mes' },
                  { key: 'quarter', label: 'Último trimestre' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setQuickDateRange(option.key as any)}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha inicio</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateDateRange('start', e.target.value)}
                  max={getTodayDate()}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha fin</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateDateRange('end', e.target.value)}
                  min={filters.dateRange.start}
                  max={getTodayDate()}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estados */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <button
          onClick={() => toggleSection('status')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className="ri-flag-line text-white"></i>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Estado de tareas</span>
              {filters.status.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    {filters.status.length} seleccionados
                  </span>
                </div>
              )}
            </div>
          </div>
          <i className={`ri-arrow-${expandedSections.status ? 'up' : 'down'}-s-line text-gray-400 dark:text-gray-500 transition-transform duration-200`}></i>
        </button>
        
        {expandedSections.status && (
          <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="space-y-3">
              {statusOptions.map(status => (
                <label key={status.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.id)}
                    onChange={() => updateMultiSelect('status', status.id)}
                    className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usuarios asignados */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <button
          onClick={() => toggleSection('assignees')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className="ri-user-line text-white"></i>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Usuarios asignados</span>
              {filters.assignees.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    {filters.assignees.length} seleccionados
                  </span>
                </div>
              )}
            </div>
          </div>
          <i className={`ri-arrow-${expandedSections.assignees ? 'up' : 'down'}-s-line text-gray-400 dark:text-gray-500 transition-transform duration-200`}></i>
        </button>
        
        {expandedSections.assignees && (
          <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="space-y-3">
              {availableUsers.map(user => (
                <label key={user.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.assignees.includes(user.id)}
                    onChange={() => updateMultiSelect('assignees', user.id)}
                    className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full flex items-center justify-center shadow-sm">
                      {user.avatar}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Proyectos */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <button
          onClick={() => toggleSection('projects')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className="ri-folder-line text-white"></i>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Proyectos</span>
              {filters.projects.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    {filters.projects.length} seleccionados
                  </span>
                </div>
              )}
            </div>
          </div>
          <i className={`ri-arrow-${expandedSections.projects ? 'up' : 'down'}-s-line text-gray-400 dark:text-gray-500 transition-transform duration-200`}></i>
        </button>
        
        {expandedSections.projects && (
          <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="space-y-3">
              {availableProjects.map(project => (
                <label key={project.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.projects.includes(project.id)}
                    onChange={() => updateMultiSelect('projects', project.id)}
                    className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{project.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
