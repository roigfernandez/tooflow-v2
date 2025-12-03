
'use client';
import { useState } from 'react';

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

interface SortOptionsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

export default function SortOptions({ currentSort, onSortChange, className = "" }: SortOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions: SortOption[] = [
    { field: 'created_at', direction: 'desc', label: 'Más recientes' },
    { field: 'created_at', direction: 'asc', label: 'Más antiguas' },
    { field: 'due_date', direction: 'asc', label: 'Fecha límite (próxima)' },
    { field: 'due_date', direction: 'desc', label: 'Fecha límite (lejana)' },
    { field: 'priority', direction: 'desc', label: 'Prioridad (alta primero)' },
    { field: 'priority', direction: 'asc', label: 'Prioridad (baja primero)' },
    { field: 'status', direction: 'asc', label: 'Estado (pendiente primero)' },
    { field: 'title', direction: 'asc', label: 'Título (A-Z)' },
    { field: 'title', direction: 'desc', label: 'Título (Z-A)' },
    { field: 'updated_at', direction: 'desc', label: 'Última modificación' }
  ];

  const handleSortSelect = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
  };

  const getSortIcon = (field: string, direction: 'asc' | 'desc') => {
    if (field === 'created_at' || field === 'updated_at') {
      return direction === 'desc' ? 'ri-time-line' : 'ri-history-line';
    }
    if (field === 'due_date') {
      return direction === 'asc' ? 'ri-calendar-check-line' : 'ri-calendar-line';
    }
    if (field === 'priority') {
      return direction === 'desc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
    }
    if (field === 'status') {
      return 'ri-list-check-line';
    }
    if (field === 'title') {
      return direction === 'asc' ? 'ri-sort-asc' : 'ri-sort-desc';
    }
    return 'ri-sort-line';
  };

  const getCurrentLabel = () => {
    const current = sortOptions.find(
      option => option.field === currentSort.field && option.direction === currentSort.direction
    );
    return current?.label || 'Personalizado';
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-0 max-w-[180px] sm:max-w-none"
      >
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <i className={`${getSortIcon(currentSort.field, currentSort.direction)} text-sm`}></i>
        </div>
        <span className="text-sm font-medium flex-shrink-0">Ordenar</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden lg:inline truncate min-w-0">
          por {getCurrentLabel()}
        </span>
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <i className={`ri-arrow-down-s-line text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="absolute top-full right-0 z-50 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2">
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ordenar tareas por
              </h4>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {sortOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSortSelect(option)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    currentSort.field === option.field && currentSort.direction === option.direction
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className={`${getSortIcon(option.field, option.direction)} text-sm ${
                        currentSort.field === option.field && currentSort.direction === option.direction
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }`}></i>
                    </div>
                    <span className="text-sm flex-1 min-w-0">{option.label}</span>
                    {currentSort.field === option.field && currentSort.direction === option.direction && (
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-line text-sm text-blue-600 dark:text-blue-400"></i>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate min-w-0 flex-1">
                  Vista: {getCurrentLabel()}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex-shrink-0 ml-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
