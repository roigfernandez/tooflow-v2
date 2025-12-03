
import { supabase } from './supabase';
import type { Database } from './supabase';

type Tables = Database['public']['Tables'];
type Project = Tables['projects']['Row'];
type Task = Tables['tasks']['Row'];
type Profile = Tables['profiles']['Row'];

// Datos de demostración para cuando Supabase no esté disponible
const DEMO_PROJECTS: any[] = [
  {
    id: '1',
    name: 'Proyecto Alpha',
    description: 'Desarrollo de nueva funcionalidad',
    status: 'active',
    priority: 'high',
    color: '#3B82F6',
    start_date: '2024-01-01',
    end_date: '2024-03-01',
    owner_id: 'demo-user',
    created_by: 'demo-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tasks: [
      { id: '1', status: 'completed' },
      { id: '2', status: 'in_progress' },
      { id: '3', status: 'pending' }
    ]
  },
  {
    id: '2',
    name: 'Proyecto Beta',
    description: 'Optimización de performance',
    status: 'active',
    priority: 'medium',
    color: '#10B981',
    start_date: '2024-02-01',
    end_date: '2024-04-01',
    owner_id: 'demo-user',
    created_by: 'demo-user',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    tasks: [
      { id: '4', status: 'in_progress' },
      { id: '5', status: 'pending' }
    ]
  }
];

const DEMO_TASKS: any[] = [
  {
    id: '1',
    title: 'Diseñar interfaz de usuario',
    description: 'Crear mockups y prototipos',
    status: 'completed',
    priority: 'high',
    project_id: '1',
    assignee_id: 'demo-user',
    creator_id: 'demo-user',
    due_date: '2024-01-15',
    completed_at: '2024-01-14T10:00:00Z',
    estimated_hours: 20,
    actual_hours: 18,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
    project: { name: 'Proyecto Alpha', color: '#3B82F6' },
    assigned_to_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    created_by_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    subtasks: [
      { id: 'st1', title: 'Crear wireframes', completed: true },
      { id: 'st2', title: 'Diseñar componentes', completed: true },
      { id: 'st3', title: 'Validar con cliente', completed: true }
    ]
  },
  {
    id: '2',
    title: 'Implementar autenticación',
    description: 'Sistema de login y registro',
    status: 'in_progress',
    priority: 'high',
    project_id: '1',
    assignee_id: 'demo-user',
    creator_id: 'demo-user',
    due_date: '2024-01-30',
    estimated_hours: 15,
    actual_hours: 8,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    project: { name: 'Proyecto Alpha', color: '#3B82F6' },
    assigned_to_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    created_by_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    subtasks: [
      { id: 'st4', title: 'Configurar JWT', completed: true },
      { id: 'st5', title: 'Crear endpoints de auth', completed: true },
      { id: 'st6', title: 'Implementar middleware', completed: false },
      { id: 'st7', title: 'Pruebas de seguridad', completed: false }
    ]
  },
  {
    id: '3',
    title: 'Configurar base de datos',
    description: 'Estructura inicial de tablas',
    status: 'pending',
    priority: 'medium',
    project_id: '1',
    assignee_id: 'demo-user',
    creator_id: 'demo-user',
    due_date: '2024-02-15',
    estimated_hours: 12,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    project: { name: 'Proyecto Alpha', color: '#3B82F6' },
    assigned_to_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    created_by_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    subtasks: [
      { id: 'st8', title: 'Diseñar esquema', completed: false },
      { id: 'st9', title: 'Crear migraciones', completed: false }
    ]
  },
  {
    id: '4',
    title: 'Optimizar consultas SQL',
    description: 'Mejorar performance de la base de datos',
    status: 'in_progress',
    priority: 'medium',
    project_id: '2',
    assignee_id: 'demo-user',
    creator_id: 'demo-user',
    due_date: '2024-03-01',
    estimated_hours: 25,
    actual_hours: 12,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-10T09:15:00Z',
    project: { name: 'Proyecto Beta', color: '#10B981' },
    assigned_to_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    created_by_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' }
  },
  {
    id: '5',
    title: 'Implementar caché Redis',
    description: 'Sistema de caché para mejorar velocidad',
    status: 'pending',
    priority: 'low',
    project_id: '2',
    assignee_id: 'demo-user',
    creator_id: 'demo-user',
    due_date: '2024-03-15',
    estimated_hours: 18,
    created_at: '2024-02-05T00:00:00Z',
    updated_at: '2024-02-05T00:00:00Z',
    project: { name: 'Proyecto Beta', color: '#10B981' },
    assigned_to_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
    created_by_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' }
  }
];

const DEMO_COMMENTS: any[] = [
  {
    id: 'c1',
    task_id: '1',
    user_id: 'demo-user',
    content: '¡Excelente trabajo con los wireframes! Me gusta mucho la dirección que tomaste.',
    created_at: '2024-01-12T10:30:00Z',
    updated_at: '2024-01-12T10:30:00Z',
    parent_id: null,
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'c2',
    task_id: '1',
    user_id: 'demo-user',
    content: 'He validado con el cliente y están muy contentos con el diseño.',
    created_at: '2024-01-13T14:15:00Z',
    updated_at: '2024-01-13T14:15:00Z',
    parent_id: 'c1',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'c3',
    task_id: '2',
    user_id: 'demo-user',
    content: 'Implementé JWT y los endpoints básicos. Falta el middleware de autenticación.',
    created_at: '2024-01-18T09:00:00Z',
    updated_at: '2024-01-18T09:00:00Z',
    parent_id: null,
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'c4',
    task_id: '2',
    user_id: 'demo-user',
    content: '¿Alguien puede revisar el código de seguridad antes de continuar?',
    created_at: '2024-01-19T11:30:00Z',
    updated_at: '2024-01-19T11:30:00Z',
    parent_id: null,
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  }
];

const DEMO_ATTACHMENTS: any[] = [
  {
    id: 'att1',
    task_id: '1',
    name: 'wireframes_v1.pdf',
    url: 'https://example.com/files/wireframes_v1.pdf',
    size: 2457600, // 2.4 MB
    type: 'application/pdf',
    created_at: '2024-01-05T10:00:00Z',
    created_by: 'demo-user',
    created_by_name: 'Usuario Demostración'
  },
  {
    id: 'att2',
    task_id: '1',
    name: 'design_mockup.png',
    url: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Design+Mockup',
    size: 1024000, // 1 MB
    type: 'image/png',
    created_at: '2024-01-08T14:30:00Z',
    created_by: 'demo-user',
    created_by_name: 'Usuario Demostración'
  },
  {
    id: 'att3',
    task_id: '2',
    name: 'auth_spec.docx',
    url: 'https://example.com/files/auth_spec.docx',
    size: 512000, // 512 KB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: '2024-01-16T09:15:00Z',
    created_by: 'demo-user',
    created_by_name: 'Usuario Demostración'
  },
  {
    id: 'att4',
    task_id: '2',
    name: 'security_checklist.xlsx',
    url: 'https://example.com/files/security_checklist.xlsx',
    size: 256000, // 256 KB
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    created_at: '2024-01-17T11:00:00Z',
    created_by: 'demo-user',
    created_by_name: 'Usuario Demostración'
  }
];

const DEMO_ACTIVITY_LOGS: any[] = [
  {
    id: 'log1',
    task_id: '1',
    user_id: 'demo-user',
    action: 'created',
    entity_type: 'task',
    details: { title: 'Diseñar interfaz de usuario' },
    created_at: '2024-01-01T00:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log2',
    task_id: '1',
    user_id: 'demo-user',
    action: 'status_changed',
    entity_type: 'task',
    details: { from: 'pending', to: 'in_progress' },
    created_at: '2024-01-05T09:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log3',
    task_id: '1',
    user_id: 'demo-user',
    action: 'status_changed',
    entity_type: 'task',
    details: { from: 'in_progress', to: 'completed' },
    created_at: '2024-01-14T10:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log4',
    task_id: '2',
    user_id: 'demo-user',
    action: 'created',
    entity_type: 'task',
    details: { title: 'Implementar autenticación' },
    created_at: '2024-01-10T00:00:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log5',
    task_id: '2',
    user_id: 'demo-user',
    action: 'status_changed',
    entity_type: 'task',
    details: { from: 'pending', to: 'in_progress' },
    created_at: '2024-01-15T08:30:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'log6',
    task_id: '2',
    user_id: 'demo-user',
    action: 'updated',
    entity_type: 'task',
    details: { field: 'description', value: 'Sistema de login y registro' },
    created_at: '2024-01-16T14:20:00Z',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  }
];

const DEMO_PROFILES: Profile[] = [
  {
    id: 'demo-user',
    email: 'usuario@demo.com',
    name: 'Usuario Demo',
    full_name: 'Usuario Demostración',
    avatar_url: null,
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  // Force local mode for development
  return false;

  /* Original logic preserved for reference
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && !url.includes('demo') && !key.includes('demo');
  */
};

export const projectsService = {
  async getAll() {
    if (!isSupabaseConfigured()) {
      return DEMO_PROJECTS;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_profile:profiles!projects_owner_id_fkey(name, full_name),
          tasks(id, status)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database error in getAll projects, using demo data');
        return DEMO_PROJECTS;
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching projects, using demo data');
      return DEMO_PROJECTS;
    }
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) {
      const project = DEMO_PROJECTS.find(p => p.id === id);
      if (!project) throw new Error('Proyecto no encontrado');
      return project;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_profile:profiles!projects_owner_id_fkey(name, full_name, email),
          tasks(
            id, title, status, priority, due_date,
            assigned_to_profile:profiles!tasks_assignee_id_fkey(name, full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  async create(project: Omit<Tables['projects']['Insert'], 'owner_id'>) {
    if (!isSupabaseConfigured()) {
      const newProject = {
        id: Date.now().toString(),
        ...project,
        owner_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      DEMO_PROJECTS.unshift(newProject as any);
      return newProject;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, owner_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Database error in create project:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  async update(id: string, updates: Tables['projects']['Update']) {
    if (!isSupabaseConfigured()) {
      const projectIndex = DEMO_PROJECTS.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        DEMO_PROJECTS[projectIndex] = { ...DEMO_PROJECTS[projectIndex], ...updates, updated_at: new Date().toISOString() };
        return DEMO_PROJECTS[projectIndex];
      }
      throw new Error('Proyecto no encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database error in update project:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) {
      const projectIndex = DEMO_PROJECTS.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        DEMO_PROJECTS.splice(projectIndex, 1);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error in delete project:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

export const tasksService = {
  async getAll(filters?: { status?: string; priority?: string; project_id?: string; assigned_to?: string }) {
    if (!isSupabaseConfigured()) {
      let filteredTasks = [...DEMO_TASKS];

      if (filters?.status && filters.status !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.status === filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
      }
      if (filters?.project_id && filters.project_id !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.project_id === filters.project_id);
      }

      return filteredTasks;
    }

    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(name, color),
          assigned_to_profile:profiles!tasks_assignee_id_fkey(name, full_name),
          created_by_profile:profiles!tasks_creator_id_fkey(name, full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.project_id && filters.project_id !== 'all') {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.assigned_to && filters.assigned_to !== 'all') {
        query = query.eq('assignee_id', filters.assigned_to);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Database error in getAll tasks, using demo data');
        return DEMO_TASKS;
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching tasks, using demo data');
      return DEMO_TASKS;
    }
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) {
      const task = DEMO_TASKS.find(t => t.id === id);
      if (!task) throw new Error('Tarea no encontrada');
      return task;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(name, color),
          assigned_to_profile:profiles!tasks_assignee_id_fkey(name, full_name, email),
          created_by_profile:profiles!tasks_creator_id_fkey(name, full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error in getById task:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  async create(task: Omit<Tables['tasks']['Insert'], 'creator_id'>) {
    if (!isSupabaseConfigured()) {
      const newTask = {
        id: Date.now().toString(),
        ...task,
        creator_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project: DEMO_PROJECTS.find(p => p.id === task.project_id) || { name: 'Proyecto', color: '#3B82F6' },
        assigned_to_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' },
        created_by_profile: { name: 'Usuario Demo', full_name: 'Usuario Demostración' }
      };
      DEMO_TASKS.unshift(newTask as any);
      return newTask;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, creator_id: user.id })
        .select(`
          *,
          project:projects(name, color),
          assigned_to_profile:profiles!tasks_assignee_id_fkey(name, full_name),
          created_by_profile:profiles!tasks_creator_id_fkey(name, full_name)
        `)
        .single();

      if (error) {
        console.error('Database error in create task:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async update(id: string, updates: Tables['tasks']['Update']) {
    if (!isSupabaseConfigured()) {
      const taskIndex = DEMO_TASKS.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        DEMO_TASKS[taskIndex] = { ...DEMO_TASKS[taskIndex], ...updates, updated_at: new Date().toISOString() };
        return DEMO_TASKS[taskIndex];
      }
      throw new Error('Tarea no encontrada');
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          project:projects(name, color),
          assigned_to_profile:profiles!tasks_assignee_id_fkey(name, full_name),
          created_by_profile:profiles!tasks_creator_id_fkey(name, full_name)
        `)
        .single();

      if (error) {
        console.error('Database error in update task:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) {
      const taskIndex = DEMO_TASKS.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        DEMO_TASKS.splice(taskIndex, 1);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error in delete task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async getStats() {
    if (!isSupabaseConfigured()) {
      const tasks = DEMO_TASKS;
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const overdue = tasks.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length;

      return {
        total,
        completed,
        pending,
        inProgress,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, priority, due_date');

      if (error) {
        console.warn('Database error in getStats, using demo data');
        return {
          total: 5,
          completed: 1,
          pending: 2,
          inProgress: 2,
          overdue: 0,
          completionRate: 20
        };
      }

      const tasks = data || [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const overdue = tasks.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length;

      return {
        total,
        completed,
        pending,
        inProgress,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    } catch (error) {
      console.warn('Error getting task stats, using demo data');
      return {
        total: 5,
        completed: 1,
        pending: 2,
        inProgress: 2,
        overdue: 0,
        completionRate: 20
      };
    }
  }
};

export const profilesService = {
  async getAll() {
    if (!isSupabaseConfigured()) {
      return DEMO_PROFILES;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Database error in getAll profiles, using demo data');
        return DEMO_PROFILES;
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching profiles, using demo data');
      return DEMO_PROFILES;
    }
  },

  async getCurrent() {
    if (!isSupabaseConfigured()) {
      return DEMO_PROFILES[0];
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Database error in getCurrent profile:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching current profile:', error);
      throw error;
    }
  },

  async update(updates: Tables['profiles']['Update']) {
    if (!isSupabaseConfigured()) {
      DEMO_PROFILES[0] = { ...DEMO_PROFILES[0], ...updates, updated_at: new Date().toISOString() };
      return DEMO_PROFILES[0];
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error in update profile:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

export const dashboardService = {
  async getStats() {
    try {
      const [tasksStats, projectsData] = await Promise.all([
        tasksService.getStats(),
        projectsService.getAll()
      ]);

      const projectsCount = projectsData.length;
      const activeProjects = projectsData.filter(p =>
        p.tasks && Array.isArray(p.tasks) && p.tasks.some((t: any) => t.status !== 'completed')
      ).length;

      return {
        ...tasksStats,
        projects: projectsCount,
        activeProjects
      };
    } catch (error) {
      console.warn('Error getting dashboard stats, using demo data');
      return {
        total: 5,
        completed: 1,
        pending: 2,
        inProgress: 2,
        overdue: 0,
        completionRate: 20,
        projects: 2,
        activeProjects: 2
      };
    }
  },

  async getRecentActivity() {
    if (!isSupabaseConfigured()) {
      return DEMO_TASKS.slice(0, 5);
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id, title, status, updated_at,
          project:projects(name, color),
          assigned_to_profile:profiles!tasks_assignee_id_fkey(name, full_name)
        `)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Database error in getRecentActivity, using demo data');
        return DEMO_TASKS.slice(0, 5);
      }
      return data || [];
    } catch (error) {
      console.warn('Error getting recent activity, using demo data');
      return DEMO_TASKS.slice(0, 5);
    }
  }
};
