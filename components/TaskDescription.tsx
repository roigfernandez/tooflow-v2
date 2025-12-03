
'use client';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
}

interface TaskDescriptionProps {
  task: Task;
  canEdit?: boolean;
  onUpdate?: (description: string) => void;
}

export default function TaskDescription({ task, canEdit = false, onUpdate }: TaskDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    try {
      await onUpdate(editedDescription);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <i className="ri-file-text-line text-blue-500"></i>
          Descripción de la Tarea
        </h2>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <i className="ri-edit-line"></i>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Describe los detalles, objetivos y cualquier información relevante sobre esta tarea..."
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {editedDescription.length}/1000 caracteres
            </span>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || editedDescription.length > 1000}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line"></i>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          {task.description ? (
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-text-line text-4xl text-gray-300 dark:text-gray-600"></i>
              </div>
              <p className="text-lg font-medium mb-2">Sin descripción</p>
              <p className="text-sm">Esta tarea no tiene una descripción detallada.</p>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  <i className="ri-add-line"></i>
                  Agregar Descripción
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
