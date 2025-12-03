
'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: string;
  createdDate: string;
  completedDate?: string;
  project: string;
  projectColor: string;
  assignee: string;
  assigneeAvatar: string;
  tags: string[];
  progress: number;
  estimatedHours: number;
  actualHours?: number;
}

export default function AdminTaskTable() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    project: '',
    assignee: '',
    dateRange: ''
  });

  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Datos de ejemplo (normalmente vendrían del backend)
  const allTasks: Task[] = [
    {
      id: '1',
      title: 'Implementar sistema de autenticación',
      description: 'Desarrollar login y registro con JWT y validación de email',
      priority: 'urgent',
      status: 'in-progress',
      dueDate: '2024-01-20',
      createdDate: '2024-01-10',
      project: 'Sistema CRM',
      projectColor: '#EF4444',
      assignee: 'Carlos López',
      assigneeAvatar: 'CL',
      tags: ['Backend', 'Seguridad'],
      progress: 65,
      estimatedHours: 24,
      actualHours: 16
    },
    {
      id: '2',
      title: 'Diseño de interfaz de usuario principal',
      description: 'Crear mockups y prototipos para la pantalla principal',
      priority: 'high',
      status: 'completed',
      dueDate: '2024-01-18',
      createdDate: '2024-01-08',
      completedDate: '2024-01-17',
      project: 'Rediseño Web',
      projectColor: '#8B5CF6',
      assignee: 'Ana García',
      assigneeAvatar: 'AG',
      tags: ['UI/UX', 'Diseño'],
      progress: 100,
      estimatedHours: 16,
      actualHours: 18
    },
    {
      id: '3',
      title: 'Optimización de base de datos',
      description: 'Mejorar consultas y añadir índices para mejor rendimiento',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-25',
      createdDate: '2024-01-12',
      project: 'Optimización',
      projectColor: '#10B981',
      assignee: 'Juan Pérez',
      assigneeAvatar: 'JP',
      tags: ['Backend', 'Base de datos'],
      progress: 0,
      estimatedHours: 12
    },
    {
      id: '4',
      title: 'Campaña de email marketing Q1',
      description: 'Planificar y ejecutar campaña para el primer trimestre',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-01-22',
      createdDate: '2024-01-05',
      project: 'Marketing Q4',
      projectColor: '#F59E0B',
      assignee: 'María Rodríguez',
      assigneeAvatar: 'MR',
      tags: ['Marketing', 'Email'],
      progress: 40,
      estimatedHours: 20,
      actualHours: 8
    },
    {
      id: '5',
      title: 'Desarrollo de API REST',
      description: 'Crear endpoints para gestión de usuarios y productos',
      priority: 'urgent',
      status: 'cancelled',
      dueDate: '2024-01-15',
      createdDate: '2024-01-03',
      project: 'App Móvil',
      projectColor: '#06B6D4',
      assignee: 'Laura Martín',
      assigneeAvatar: 'LM',
      tags: ['Backend', 'API'],
      progress: 25,
      estimatedHours: 32,
      actualHours: 8
    }
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTasks = allTasks
    .filter(task => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.project && task.project !== filters.project) return false;
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof Task];
      const bValue = b[sortField as keyof Task];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      'in-progress': 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return texts[priority as keyof typeof texts] || priority;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros avanzados */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="ri-filter-3-line text-blue-500"></i>
            Filtros Avanzados
          </h3>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilters({ search: '', status: '', priority: '', project: '', assignee: '', dateRange: '' })}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
            <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <i className="ri-download-line"></i>
              Exportar vista
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 transform -translate-y-1/2">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Título, descripción..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="in-progress">En Progreso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>

          {/* Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
            <select
              value={filters.project}
              onChange={(e) => setFilters({...filters, project: e.target.value})}
              className="w-full pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Sistema CRM">Sistema CRM</option>
              <option value="Rediseño Web">Rediseño Web</option>
              <option value="App Móvil">App Móvil</option>
              <option value="Marketing Q4">Marketing Q4</option>
              <option value="Optimización">Optimización</option>
            </select>
          </div>

          {/* Asignado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignado</label>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({...filters, assignee: e.target.value})}
              className="w-full pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Ana García">Ana García</option>
              <option value="Carlos López">Carlos López</option>
              <option value="Juan Pérez">Juan Pérez</option>
              <option value="María Rodríguez">María Rodríguez</option>
              <option value="Laura Martín">Laura Martín</option>
            </select>
          </div>
        </div>

        {/* Estadísticas de filtros */}
        <div className="mt-4 pt-4 border-top border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Mostrando {filteredAndSortedTasks.length} de {allTasks.length} tareas
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-green-600">
                <i className="ri-check-line"></i>
                {filteredAndSortedTasks.filter(t => t.status === 'completed').length} completadas
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <i className="ri-time-line"></i>
                {filteredAndSortedTasks.filter(t => t.status === 'in-progress').length} en progreso
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <i className="ri-alert-line"></i>
                {filteredAndSortedTasks.filter(t => t.priority === 'urgent').length} urgentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla maestro de tareas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6">
                  <button 
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Tarea
                    <i className={`ri-arrow-${sortField === 'title' && sortDirection === 'desc' ? 'down' : 'up'}-line text-xs`}></i>
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button 
                    onClick={() => handleSort('project')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Proyecto
                    <i className={`ri-arrow-${sortField === 'project' && sortDirection === 'desc' ? 'down' : 'up'}-line text-xs`}></i>
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button 
                    onClick={() => handleSort('assignee')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Asignado
                    <i className={`ri-arrow-${sortField === 'assignee' && sortDirection === 'desc' ? 'down' : 'up'}-line text-xs`}></i>
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button 
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Prioridad
                    <i className={`ri-arrow-${sortField === 'priority' && sortDirection === 'desc' ? 'down' : 'up'}-line text-xs`}></i>
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button 
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Estado
                    <i className={`ri-arrow-${sortField === 'status' && sortDirection === 'desc' ? 'down' : 'up'}-line text-xs`}></i>
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button 
                    onClick={() => handleSort('dueDate')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Vencimiento
                    <i className={`ri-arrow-${sortField === 'dueDate' && sortDirection === 'desc' ? 'down' : 'up'}-line text-xs`}></i>
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <span className="text-sm font-medium text-gray-700">Progreso</span>
                </th>
                <th className="text-left py-3 px-4">
                  <span className="text-sm font-medium text-gray-700">Tiempo</span>
                </th>
                <th className="text-center py-3 px-4">
                  <span className="text-sm font-medium text-gray-700">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="max-w-xs">
                      <h4 className="text-sm font-medium text-gray-900 mb-1 leading-5">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-4">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.projectColor }}
                      ></div>
                      <span className="text-sm text-gray-600">{task.project}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {task.assigneeAvatar}
                      </div>
                      <span className="text-sm text-gray-600">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      {formatDate(task.dueDate)}
                    </div>
                    {task.completedDate && (
                      <div className="text-xs text-green-600">
                        Completada: {formatDate(task.completedDate)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{task.progress}%</span>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-xs text-gray-600">
                      <div>Est: {task.estimatedHours}h</div>
                      {task.actualHours !== undefined && (
                        <div className={task.actualHours > task.estimatedHours ? 'text-red-600' : 'text-green-600'}>
                          Real: {task.actualHours}h
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors group"
                        title="Ver detalle"
                      >
                        <i className="ri-eye-line text-gray-400 group-hover:text-blue-500 text-sm"></i>
                      </Link>
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <i className="ri-edit-line text-gray-400 text-sm"></i>
                      </Link>
                      <button 
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors group"
                        title="Eliminar"
                      >
                        <i className="ri-delete-bin-line text-gray-400 group-hover:text-red-500 text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado vacío */}
        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tareas</h3>
            <p className="text-gray-500 mb-4">
              Ajusta los filtros para ver más resultados o crea una nueva tarea
            </p>
            <button 
              onClick={() => setFilters({ search: '', status: '', priority: '', project: '', assignee: '', dateRange: '' })}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
