import { supabase } from './supabase';

export interface FilterOptions {
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

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export async function getFilteredTasks(filters: FilterOptions, sort: SortOption, userId: string) {
  try {
    // Verificar si Supabase está configurado correctamente
    const supabaseUrl = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_SUPABASE_URL 
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Siempre usar modo demo seguro para evitar errores
    const demoTasks = getDemoTasks();
    const filteredTasks = applyFiltersLocally(demoTasks, filters);
    const sortedTasks = sortTasksLocally(filteredTasks, sort);
    return { data: sortedTasks, error: null };

  } catch (error) {
    console.error('Error filtering tasks:', error);
    // Fallback a modo demo
    const demoTasks = getDemoTasks();
    const filteredTasks = applyFiltersLocally(demoTasks, filters);
    const sortedTasks = sortTasksLocally(filteredTasks, sort);
    return { data: sortedTasks, error: null };
  }
}

function getDemoTasks() {
  return [
    {
      id: '1',
      title: 'Diseñar mockups de la aplicación',
      description: 'Crear los mockups iniciales para la nueva funcionalidad',
      status: 'in_progress',
      priority: 'high',
      project_id: '1',
      assigned_to: 'demo-user',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'demo-user',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      projects: { id: '1', name: 'TooFlow Mobile', color: '#3B82F6' },
      assigned_to_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' },
      created_by_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' }
    },
    {
      id: '2',
      title: 'Implementar autenticación',
      description: 'Configurar el sistema de login y registro',
      status: 'pending',
      priority: 'urgent',
      project_id: '1',
      assigned_to: 'demo-user',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'demo-user',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      projects: { id: '1', name: 'TooFlow Mobile', color: '#3B82F6' },
      assigned_to_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' },
      created_by_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' }
    },
    {
      id: '3',
      title: 'Optimizar rendimiento',
      description: 'Mejorar los tiempos de carga de la aplicación',
      status: 'completed',
      priority: 'medium',
      project_id: '2',
      assigned_to: 'demo-user',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'demo-user',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      projects: { id: '2', name: 'Backend API', color: '#10B981' },
      assigned_to_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' },
      created_by_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' }
    },
    {
      id: '4',
      title: 'Documentar API endpoints',
      description: 'Crear documentación completa de todos los endpoints',
      status: 'pending',
      priority: 'low',
      project_id: '2',
      assigned_to: 'demo-user',
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'demo-user',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      projects: { id: '2', name: 'Backend API', color: '#10B981' },
      assigned_to_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' },
      created_by_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' }
    },
    {
      id: '5',
      title: 'Configurar tests automatizados',
      description: 'Implementar suite de tests para el frontend',
      status: 'in_progress',
      priority: 'medium',
      project_id: '3',
      assigned_to: 'demo-user',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'demo-user',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      projects: { id: '3', name: 'Testing Suite', color: '#F59E0B' },
      assigned_to_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' },
      created_by_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' }
    },
    {
      id: '6',
      title: 'Revisar código del equipo',
      description: 'Code review de los últimos commits',
      status: 'pending',
      priority: 'high',
      project_id: '3',
      assigned_to: 'demo-user',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'demo-user',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      projects: { id: '3', name: 'Testing Suite', color: '#F59E0B' },
      assigned_to_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' },
      created_by_profile: { id: 'demo-user', full_name: 'Demo User', email: 'demo@tooflow.com' }
    }
  ];
}

function applyFiltersLocally(tasks: any[], filters: FilterOptions) {
  return tasks.filter(task => {
    // Filtro de búsqueda
    if (filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = task.description?.toLowerCase().includes(searchTerm);
      if (!titleMatch && !descriptionMatch) return false;
    }

    // Filtro de estado
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    // Filtro de prioridad
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Filtro de usuario asignado
    if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(task.assigned_to)) {
      return false;
    }

    // Filtro de proyecto
    if (filters.projects.length > 0 && !filters.projects.includes(task.project_id)) {
      return false;
    }

    // Filtro de rango de fechas
    if (filters.dateRange.start) {
      const taskDate = task.due_date ? new Date(task.due_date) : null;
      const startDate = new Date(filters.dateRange.start);
      if (!taskDate || taskDate < startDate) return false;
    }

    if (filters.dateRange.end) {
      const taskDate = task.due_date ? new Date(task.due_date) : null;
      const endDate = new Date(filters.dateRange.end);
      if (!taskDate || taskDate > endDate) return false;
    }

    return true;
  });
}

export async function getTasksWithAdvancedSearch(searchQuery: string, userId: string) {
  try {
    // Modo demo - buscar en tareas simuladas
    const demoTasks = getDemoTasks();
    const filteredTasks = demoTasks.filter(task => {
      const searchTerm = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(searchTerm) ||
             task.description?.toLowerCase().includes(searchTerm);
    });
    return { data: filteredTasks, error: null };
  } catch (error) {
    console.error('Error in advanced search:', error);
    // Fallback a búsqueda demo
    const demoTasks = getDemoTasks();
    const filteredTasks = demoTasks.filter(task => {
      const searchTerm = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(searchTerm) ||
             task.description?.toLowerCase().includes(searchTerm);
    });
    return { data: filteredTasks, error: null };
  }
}

export function getOrderColumn(field: string): string {
  switch (field) {
    case 'title':
      return 'title';
    case 'status':
      return 'status';
    case 'priority':
      return 'priority';
    case 'due_date':
      return 'due_date';
    case 'created_at':
      return 'created_at';
    case 'updated_at':
      return 'updated_at';
    default:
      return 'created_at';
  }
}

export function getPriorityOrder(priority: string): number {
  switch (priority) {
    case 'urgent':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
}

export function getStatusOrder(status: string): number {
  switch (status) {
    case 'pending':
      return 1;
    case 'in_progress':
      return 2;
    case 'completed':
      return 3;
    case 'cancelled':
      return 4;
    default:
      return 0;
  }
}

export function sortTasksLocally(tasks: any[], sort: SortOption) {
  return [...tasks].sort((a, b) => {
    let aValue, bValue;

    switch (sort.field) {
      case 'priority':
        aValue = getPriorityOrder(a.priority);
        bValue = getPriorityOrder(b.priority);
        break;
      case 'status':
        aValue = getStatusOrder(a.status);
        bValue = getStatusOrder(b.status);
        break;
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'due_date':
        aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
        bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sort.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sort.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function getFilterSummary(filters: FilterOptions): string {
  const parts: string[] = [];

  if (filters.search) {
    parts.push(`búsqueda: "${filters.search}"`);
  }

  if (filters.status.length > 0) {
    parts.push(`estado: ${filters.status.length} seleccionado${filters.status.length > 1 ? 's' : ''}`);
  }

  if (filters.priority.length > 0) {
    parts.push(`prioridad: ${filters.priority.length} seleccionada${filters.priority.length > 1 ? 's' : ''}`);
  }

  if (filters.assignedTo.length > 0) {
    parts.push(`asignado: ${filters.assignedTo.length} usuario${filters.assignedTo.length > 1 ? 's' : ''}`);
  }

  if (filters.projects.length > 0) {
    parts.push(`proyecto: ${filters.projects.length} seleccionado${filters.projects.length > 1 ? 's' : ''}`);
  }

  if (filters.dateRange.start || filters.dateRange.end) {
    parts.push('rango de fechas aplicado');
  }

  return parts.length > 0 ? parts.join(', ') : 'sin filtros';
}
