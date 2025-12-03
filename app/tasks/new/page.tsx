
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { notificationHelpers } from '@/lib/notifications';

// Interfaces
interface Project {
  id: string;
  name: string;
  color: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    status: 'pendiente',
    priority: 'media',
    projectId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Existing code: data loading, handlers, validation, etc.
  useEffect(() => {
    if (user) {
      loadProjectsAndUsers();
    }
  }, [user]);

  const loadProjectsAndUsers = async () => {
    try {
      setLoading(true);

      // Cargar proyectos donde el usuario es miembro
      const { data: projectMemberships } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id);

      const projectIds = projectMemberships?.map(pm => pm.project_id) || [];

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, color')
        .in('id', projectIds)
        .order('name');

      // Cargar usuarios que son miembros de estos proyectos
      const { data: userMemberships } = await supabase
        .from('project_members')
        .select('user_id')
        .in('project_id', projectIds);

      const userIds = [...new Set(userMemberships?.map(um => um.user_id) || [])];

      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)
        .order('full_name');

      const formattedProjects = projectsData?.map(project => ({
        id: project.id,
        name: project.name,
        color: project.color
      })) || [];

      const formattedUsers = usersData?.map(userData => ({
        id: userData.id,
        full_name: userData.full_name || 'Usuario sin nombre',
        email: userData.email,
        avatar: userData.full_name ? 
          userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
      })) || [];

      setProjects(formattedProjects);
      setUsers(formattedUsers);

    } catch (error) {
      console.error('Error loading projects and users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length > 100) {
      newErrors.title = 'El título no puede tener más de 100 caracteres';
    }

    // Validar descripción
    if (formData.description.length > 500) {
      newErrors.description = 'La descripción no puede tener más de 500 caracteres';
    }

    // Validar fecha de vencimiento
    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es obligatoria';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'La fecha no puede ser anterior a hoy';
      }
    }

    // Validar asignado
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Debe asignar la tarea a alguien';
    }

    // Validar proyecto
    if (!formData.projectId) {
      newErrors.projectId = 'Debe seleccionar un proyecto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: formData.title,
            description: formData.description || null,
            status: formData.status,
            priority: formData.priority,
            project_id: formData.projectId,
            assigned_to: formData.assignedTo || null,
            due_date: formData.dueDate || null,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Crear notificación si se asignó a alguien diferente al creador
      if (formData.assignedTo && formData.assignedTo !== user.id) {
        try {
          await notificationHelpers.taskAssigned(
            formData.assignedTo,
            formData.title,
            user.user_metadata?.full_name || user.email || 'Usuario',
            task.id
          );
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }

      router.push('/tasks');
    } catch (err) {
      console.error('Error creating task:', err);
      setErrors(prev => ({ ...prev, submit: 'Error al crear la tarea. Inténtalo de nuevo.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/tasks');
  };

  const getSelectedUser = () => {
    return users.find(user => user.id === formData.assignedTo);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Cargando formulario...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="flex-1">
          {/* Encabezado */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="text-sm font-medium">Volver a Mis Tareas</span>
              </button>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nueva Tarea</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completa la información para crear una nueva tarea</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-4">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {errors.submit && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <i className="ri-error-warning-line text-red-500 dark:text-red-400 text-lg"></i>
                      <p className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ej: Implementar sistema de autenticación"
                      maxLength={100}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.title ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.title && (
                        <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                          <i className="ri-error-warning-line"></i>
                          {errors.title}
                        </p>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formData.title.length}/100</span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe los detalles, requisitos y pasos necesarios para completar esta tarea..."
                      maxLength={500}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.description ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description && (
                        <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                          <i className="ri-error-warning-line"></i>
                          {errors.description}
                        </p>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formData.description.length}/500</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Proyecto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proyecto <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.projectId}
                          onChange={(e) => handleInputChange('projectId', e.target.value)}
                          className={`w-full appearance-none px-3 py-2 pr-8 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            errors.projectId ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <option value="">Seleccionar proyecto</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <i className="ri-arrow-down-s-line text-gray-400 dark:text-gray-500"></i>
                        </div>
                      </div>
                      {errors.projectId && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                          <i className="ri-error-warning-line"></i>
                          {errors.projectId}
                        </p>
                      )}
                    </div>

                    {/* Prioridad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prioridad
                      </label>
                      <div className="relative">
                        <select
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="baja">Baja</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                          <option value="urgente">Urgente</option>
                        </select>
                        <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <i className="ri-arrow-down-s-line text-gray-400 dark:text-gray-500"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fecha de vencimiento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha de vencimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        min={getTodayDate()}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          errors.dueDate ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.dueDate && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                          <i className="ri-error-warning-line"></i>
                          {errors.dueDate}
                        </p>
                      )}
                    </div>

                    {/* Estado inicial */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado inicial
                      </label>
                      <div className="relative">
                        <select
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_progreso">En progreso</option>
                        </select>
                        <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <i className="ri-arrow-down-s-line text-gray-400 dark:text-gray-500"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Asignar a */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asignar a <span className="text-red-500">*</span>
                    </label>

                    {/* Usuario seleccionado */}
                    {getSelectedUser() && (
                      <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white text-sm font-medium rounded-full flex items-center justify-center">
                          {getSelectedUser()?.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{getSelectedUser()?.full_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{getSelectedUser()?.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInputChange('assignedTo', '')}
                          className="w-6 h-6 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                        >
                          <i className="ri-close-line text-blue-600 dark:text-blue-400 text-sm"></i>
                        </button>
                      </div>
                    )}

                    {/* Dropdown de usuarios */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          errors.assignedTo ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <span className={getSelectedUser() ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                          {getSelectedUser() ? getSelectedUser()?.full_name : 'Seleccionar persona'}
                        </span>
                        <i
                          className={`ri-arrow-down-s-line transition-transform ${
                            showAssigneeDropdown ? 'rotate-180' : ''
                          }`}
                        ></i>
                      </button>

                      {showAssigneeDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {users.length === 0 ? (
                            <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                              No hay usuarios disponibles
                            </div>
                          ) : (
                            users.map(userData => (
                              <button
                                key={userData.id}
                                type="button"
                                onClick={() => {
                                  handleInputChange('assignedTo', userData.id);
                                  setShowAssigneeDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                    {userData.avatar}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{userData.full_name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{userData.email}</div>
                                  </div>
                                </div>
                                {formData.assignedTo === userData.id && <i className="ri-check-line text-blue-500"></i>}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {errors.assignedTo && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>
                        {errors.assignedTo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || projects.length === 0 || users.length === 0}
                    className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creando tarea...
                      </>
                    ) : (
                      <>
                        <i className="ri-add-line"></i>
                        Crear Tarea
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Información adicional */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-information-line text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Tips para crear tareas efectivas</h3>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Usa títulos claros y específicos</li>
                      <li>• Incluye toda la información necesaria en la descripción</li>
                      <li>• Asigna fechas realistas considerando la complejidad</li>
                      <li>• Selecciona las personas apropiadas según sus habilidades</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mostrar cuando no hay datos */}
              {(projects.length === 0 || users.length === 0) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-alert-line text-yellow-600 dark:text-yellow-400"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">Configuración necesaria</h3>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                        {projects.length === 0 && <p>• No tienes proyectos disponibles. Crea un proyecto primero.</p>}
                        {users.length === 0 && <p>• No hay usuarios disponibles para asignar tareas.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
