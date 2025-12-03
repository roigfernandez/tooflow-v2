'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface DateChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  currentDate: string;
}

export default function DateChangeModal({ isOpen, onClose, taskId, currentDate }: DateChangeModalProps) {
  const [newDate, setNewDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && currentDate) {
      setNewDate(currentDate);
      setError('');
    }
  }, [isOpen, currentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !taskId) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ due_date: newDate })
        .eq('id', taskId);

      if (updateError) {
        setError('Error al actualizar la fecha');
        console.error('Error:', updateError);
        return;
      }

      onClose();
      window.location.reload(); // Recargar para mostrar los cambios
    } catch (error) {
      console.error('Error updating date:', error);
      setError('Error al actualizar la fecha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewDate(currentDate);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cambiar Fecha de Vencimiento
          </h3>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="ri-close-line text-gray-500 dark:text-gray-400"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nueva fecha de vencimiento
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !newDate}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Guardando...
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}