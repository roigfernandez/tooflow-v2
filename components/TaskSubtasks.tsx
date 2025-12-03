'use client';
import { useState, useEffect } from 'react';
import { tasksService } from '@/lib/database';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskSubtasksProps {
  taskId: string;
}

export default function TaskSubtasks({ taskId }: TaskSubtasksProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubtasks();
  }, [taskId]);

  const loadSubtasks = async () => {
    setLoading(true);
    try {
      // Get task with subtasks from demo data
      const task = await tasksService.getById(taskId);
      if (task && task.subtasks) {
        setSubtasks(task.subtasks);
      } else {
        setSubtasks([]);
      }
    } catch (error) {
      console.error('Error loading subtasks:', error);
      setSubtasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (subtaskId: string) => {
    setSubtasks(prev => prev.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = subtasks.filter(subtask => subtask.completed).length;
  const progressPercentage = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subtareas</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/{subtasks.length} completadas
        </span>
      </div>

      {subtasks.length > 0 && (
        <>
          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Lista de subtareas */}
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleToggle(subtask.id)}
              >
                <button className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${subtask.completed
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                  }`}>
                  {subtask.completed && (
                    <i className="ri-check-line text-xs"></i>
                  )}
                </button>

                <span className={`flex-1 text-sm transition-colors ${subtask.completed
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : 'text-gray-900 dark:text-gray-100'
                  }`}>
                  {subtask.title}
                </span>

                {subtask.completed && (
                  <i className="ri-check-double-line text-green-500 text-sm"></i>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {subtasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <i className="ri-task-line text-2xl mb-2 block"></i>
          <p className="text-sm">No hay subtareas definidas</p>
        </div>
      )}
    </div>
  );
}