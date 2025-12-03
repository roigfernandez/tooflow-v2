
'use client';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  project: {
    id: string;
    name: string;
    color: string;
  };
  assignee: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  creator: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface TaskDetailHeaderProps {
  task: Task;
  canEdit?: boolean;
  onStatusChange: (status: Task['status']) => void;
}

export default function TaskDetailHeader({ task, canEdit = false, onStatusChange }: TaskDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const handleTitleSave = () => {
    setIsEditing(false);
    console.log('Título guardado:', editedTitle);
  };

  const handleTitleCancel = () => {
    setIsEditing(false);
    setEditedTitle(task.title);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Información principal */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <div className="mb-6">
            {isEditing ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 pb-1"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleTitleSave}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <i className="ri-check-line text-green-600 dark:text-green-400 text-lg"></i>
                  </button>
                  <button
                    onClick={handleTitleCancel}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <i className="ri-close-line text-gray-600 dark:text-gray-400 text-lg"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight flex-1">
                  {task.title}
                </h1>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 mt-1"
                  >
                    <i className="ri-edit-line text-gray-400 dark:text-gray-500 text-lg"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Estado, prioridad y fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Estado:</label>
              {canEdit ? (
                <div className="relative">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(e.target.value as Task['status'])}
                    className={`w-full appearance-none px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer pr-10 ${getStatusColor(task.status)}`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="completed">Completada</option>
                  </select>
                  <div className="w-5 h-5 flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <i className="ri-arrow-down-s-line text-sm"></i>
                  </div>
                </div>
              ) : (
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Prioridad:</label>
              <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                {getPriorityText(task.priority)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Fecha límite:</label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <i className="ri-calendar-event-line text-gray-600 dark:text-gray-400"></i>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(task.due_date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Asignación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Asignado a:</label>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {getInitials(task.assignee.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {task.assignee.full_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {task.assignee.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Creado por:</label>
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {getInitials(task.creator.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {task.creator.full_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {task.creator.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del proyecto */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Proyecto:</label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: task.project.color }}
                ></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {task.project.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones laterales */}
        <div className="flex flex-col gap-3 lg:min-w-[200px]">
          {canEdit && (
            <>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors whitespace-nowrap">
                <i className="ri-edit-line"></i>
                Editar Tarea
              </button>
              
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors whitespace-nowrap">
                <i className="ri-share-line"></i>
                Compartir
              </button>
            </>
          )}
          
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg font-semibold transition-colors whitespace-nowrap">
            <i className="ri-download-line"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
