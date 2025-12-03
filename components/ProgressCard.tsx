
'use client';

interface ProgressCardProps {
  title: string;
  completed: number;
  total: number;
  color?: string;
}

export default function ProgressCard({ title, completed, total, color = 'blue' }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full ${getColorClasses(color)} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{completed} de {total} completadas</span>
        <span>{total - completed} pendientes</span>
      </div>
    </div>
  );
}
