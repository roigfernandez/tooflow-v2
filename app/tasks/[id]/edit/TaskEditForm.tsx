
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  project_id: string;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

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

interface TaskEditFormProps {
  taskId: string;
}

export default function TaskEditForm({ taskId }: TaskEditFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
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
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    if (user && taskId) {
      loadTaskAndData();
    }
  }, [user, taskId]);

  const loadTaskAndData = async () => {
    try {
      setLoading(true);

      // Cargar la tarea
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) {
        throw taskError;
      }

      setTask(taskData);

      // Cargar adjuntos de la tarea
      const { data: attachmentsData } = await supabase
        .from('attachments')
        .select(`
          id,
          file_name,
          file_size,
          file_type,
          storage_path,
          created_at,
          uploaded_by,
          profiles!uploaded_by(full_name)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      const formattedAttachments = attachmentsData?.map(att => ({
        ...att,
        uploader_name: att.profiles?.full_name || 'Usuario'
      })) || [];

      setAttachments(formattedAttachments);

      // Inicializar form data
      setFormData({
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.due_date ? taskData.due_date.split('T')[0] : '',
        assignedTo: taskData.assigned_to || '',
        status: taskData.status,
        priority: taskData.priority,
        projectId: taskData.project_id
      });

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
      console.error('Error loading task and data:', error);
      setErrors({ load: 'Error al cargar la tarea. Inténtalo de nuevo.' });
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          priority: formData.priority,
          project_id: formData.projectId,
          assigned_to: formData.assignedTo,
          due_date: formData.dueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      // Redirigir a la tarea con mensaje de éxito
      router.push(`/tasks/${taskId}?updated=true`);

    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      setErrors({ submit: 'Error al actualizar la tarea. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/tasks/${taskId}`);
  };

  const getSelectedUser = () => {
    return users.find(user => user.id === formData.assignedTo);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'bloqueada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAttachmentUploaded = (attachment: any) => {
    setAttachments(prev => [attachment, ...prev]);
    setShowFileUpload(false);
  };

  const handleAttachmentDeleted = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tarea...</p>
        </div>
      </div>
    );
  }

  if (errors.load) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i className="ri-error-warning-line text-red-500 text-2xl mb-2"></i>
        <p className="text-red-700 font-medium mb-2">Error al cargar la tarea</p>
        <p className="text-red-600 text-sm mb-4">{errors.load}</p>
        <button
          onClick={() => router.push('/tasks')}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
        >
          Volver a Mis Tareas
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <i className="ri-alert-line text-yellow-500 text-2xl mb-2"></i>
        <p className="text-yellow-700 font-medium mb-2">Tarea no encontrada</p>
        <p className="text-yellow-600 text-sm mb-4">La tarea que buscas no existe o no tienes permisos para editarla.</p>
        <button
          onClick={() => router.push('/tasks')}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap"
        >
          Volver a Mis Tareas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Encabezado con información de la tarea */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Editando tarea</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Creada por {task.created_by === user?.id ? 'ti' : 'otro usuario'}</span>
              <span>•</span>
              <span>
                {new Date(task.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'pendiente' ? 'Pendiente' :
               task.status === 'en_progreso' ? 'En progreso' :
               task.status === 'completada' ? 'Completada' :
               task.status === 'bloqueada' ? 'Bloqueada' : task.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority === 'baja' ? 'Baja' :
               task.priority === 'media' ? 'Media' :
               task.priority === 'alta' ? 'Alta' :
               task.priority === 'urgente' ? 'Urgente' : task.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <i className="ri-error-warning-line text-red-500 text-lg"></i>
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: Implementar sistema de autenticación"
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {errors.title}
                </p>
              )}
              <span className="text-xs text-gray-400 ml-auto">{formData.title.length}/100</span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe los detalles, requisitos y pasos necesarios para completar esta tarea..."
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {errors.description}
                </p>
              )}
              <span className="text-xs text-gray-400 ml-auto">{formData.description.length}/500</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proyecto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proyecto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className={`w-full appearance-none px-3 py-2 pr-8 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.projectId ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
              {errors.projectId && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {errors.projectId}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                  <option value="bloqueada">Bloqueada</option>
                </select>
                <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <div className="relative">
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
                <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de vencimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                min={getTodayDate()}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Asignar a */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignar a <span className="text-red-500">*</span>
            </label>

            {/* Usuario seleccionado */}
            {getSelectedUser() && (
              <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white text-sm font-medium rounded-full flex items-center justify-center">
                  {getSelectedUser()?.avatar}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{getSelectedUser()?.full_name}</div>
                  <div className="text-xs text-gray-500">{getSelectedUser()?.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('assignedTo', '')}
                  className="w-6 h-6 flex items-center justify-center hover:bg-blue-200 rounded-full transition-colors"
                >
                  <i className="ri-close-line text-blue-600 text-sm"></i>
                </button>
              </div>
            )}

            {/* Dropdown de usuarios */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
                  errors.assignedTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <span className={getSelectedUser() ? 'text-gray-900' : 'text-gray-500'}>
                  {getSelectedUser() ? getSelectedUser()?.full_name : 'Seleccionar persona'}
                </span>
                <i
                  className={`ri-arrow-down-s-line transition-transform ${
                    showAssigneeDropdown ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {showAssigneeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="px-3 py-4 text-center text-gray-500 text-sm">
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
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                            {userData.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{userData.full_name}</div>
                            <div className="text-xs text-gray-500">{userData.email}</div>
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
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <i className="ri-error-warning-line"></i>
                {errors.assignedTo}
              </p>
            )}
          </div>

          {/* Sección de archivos adjuntos */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <i className="ri-attachment-line"></i>
                Archivos adjuntos ({attachments.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <i className="ri-add-line"></i>
                Agregar archivo
              </button>
            </div>

            {showFileUpload && (
              <div className="space-y-3">
                <FileUpload
                  taskId={taskId}
                  onUploadComplete={handleAttachmentUploaded}
                  maxFiles={3}
                />
                <button
                  type="button"
                  onClick={() => setShowFileUpload(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            )}

            <AttachmentList
              attachments={attachments}
              onAttachmentDeleted={handleAttachmentDeleted}
              currentUserId={user?.id}
              showUploader={true}
            />

            {attachments.length === 0 && !showFileUpload && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay archivos adjuntos en esta tarea
              </p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando cambios...
              </>
            ) : (
              <>
                <i className="ri-save-line"></i>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Información de ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-information-line text-blue-600"></i>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Consejos para editar tareas</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Actualiza el estado según el progreso actual</li>
              <li>• Cambia la prioridad si las circunstancias han cambiado</li>
              <li>• Reasigna la tarea si es necesario para mejor distribución</li>
              <li>• Ajusta la fecha de vencimiento si es realista hacerlo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
