'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

interface TaskFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export default function TaskFilters({ onFiltersChange, className = "" }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    priority: [],
    assignedTo: [],
    projects: [],
    dateRange: { start: '', end: '' },
    search: ''
  });
  
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', color: 'text-yellow-600', icon: 'ri-time-line' },
    { value: 'in_progress', label: 'En Progreso', color: 'text-blue-600', icon: 'ri-play-circle-line' },
    { value: 'completed', label: 'Completada', color: 'text-green-600', icon: 'ri-check-circle-line' },
    { value: 'cancelled', label: 'Cancelada', color: 'text-red-600', icon: 'ri-close-circle-line' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: 'text-gray-600', icon: 'ri-arrow-down-line' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600', icon: 'ri-subtract-line' },
    { value: 'high', label: 'Alta', color: 'text-orange-600', icon: 'ri-arrow-up-line' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600', icon: 'ri-alarm-warning-line' }
  ];

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  useEffect(() => {
    // Contar filtros activos
    const count = [
      ...filters.status,
      ...filters.priority,
      ...filters.assignedTo,
      ...filters.projects,
      filters.dateRange.start ? 1 : 0,
      filters.dateRange.end ? 1 : 0,
      filters.search ? 1 : 0
    ].length;
    
    setActiveFiltersCount(count);
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('projects')
        .select(`
          id, name, color,
          project_members!inner(user_id)
        `)
        .eq('project_members.user_id', user.id)
        .order('name');
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleFilterChange = (category: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleMultiSelectToggle = (category: 'status' | 'priority' | 'assignedTo' | 'projects', value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      status: [],
      priority: [],
      assignedTo: [],
      projects: [],
      dateRange: { start: '', end: '' },
      search: ''
    };
    setFilters(emptyFilters);
    setSearchTerm('');
  };

  const getQuickFilters = () => [
    {
      label: 'Mis tareas',
      action: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          handleFilterChange('assignedTo', [user.id]);
        }
      },
      icon: 'ri-user-line'
    },
    {
      label: 'Urgentes',
      action: () => handleFilterChange('priority', ['urgent', 'high']),
      icon: 'ri-alarm-warning-line'
    },
    {
      label: 'En progreso',
      action: () => handleFilterChange('status', ['in_progress']),
      icon: 'ri-play-circle-line'
    },
    {
      label: 'Vencidas',
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        handleFilterChange('dateRange', { start: '', end: today });
      },
      icon: 'ri-calendar-check-line'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Barra de búsqueda y filtros */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="Buscar tareas por título, descripción o etiquetas..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative px-4 py-2.5 rounded-lg border transition-colors whitespace-nowrap ${
            isOpen || activeFiltersCount > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <i className="ri-filter-3-line"></i>
            <span className="text-sm font-medium">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2 mb-4">
        {getQuickFilters().map((filter, index) => (
          <button
            key={index}
            onClick={filter.action}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors whitespace-nowrap"
          >
            <i className={filter.icon}></i>
            {filter.label}
          </button>
        ))}
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors whitespace-nowrap"
          >
            <i className="ri-close-line"></i>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Panel de filtros expandido */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Estado */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Estado</h4>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => handleMultiSelectToggle('status', option.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <i className={`${option.icon} ${option.color} text-sm`}></i>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Prioridad</h4>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(option.value)}
                      onChange={() => handleMultiSelectToggle('priority', option.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <i className={`${option.icon} ${option.color} text-sm`}></i>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Asignado a */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Asignado a</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.assignedTo.includes(user.id)}
                      onChange={() => handleMultiSelectToggle('assignedTo', user.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {user.full_name || user.email}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Proyectos */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Proyectos</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {projects.map((project) => (
                  <label key={project.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.projects.includes(project.id)}
                      onChange={() => handleMultiSelectToggle('projects', project.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {project.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rango de fechas */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Fecha límite</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Desde</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Acciones del panel */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Limpiar todos los filtros
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el panel */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}