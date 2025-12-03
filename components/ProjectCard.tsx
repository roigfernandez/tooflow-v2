
'use client';
import Link from 'next/link';

interface Project {
  id: number | string;
  name: string;
  description: string;
  color: string;
  progress?: number;
  tasks?: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  nextDeadline?: string;
  team?: string[];
  priority?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilDeadline = (dateString: string) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgente': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'alta': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'media': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'baja': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  // Valores por defecto para evitar errores
  const progress = project.progress || 0;
  const tasks = project.tasks || { pending: 0, in_progress: 0, completed: 0 };
  const priority = project.priority || 'Media';
  const team = project.team || ['Usuario Demo'];
  const nextDeadline = project.nextDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const daysUntilDeadline = getDaysUntilDeadline(nextDeadline);
  const totalTasks = tasks.pending + tasks.in_progress + tasks.completed;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg cursor-pointer group">
        {/* Header del proyecto */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: project.color }}
                ></div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-6">
                  {project.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-5">
                {project.description}
              </p>
            </div>
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ml-3 flex-shrink-0 ${getPriorityColor(priority)}`}>
              {priority}
            </span>
          </div>

          {/* Progreso */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: project.color
                }}
              ></div>
            </div>
          </div>

          {/* Estadísticas de tareas */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{tasks.pending}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{tasks.in_progress}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">En progreso</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{tasks.completed}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Completadas</div>
            </div>
          </div>
        </div>

        {/* Footer del proyecto */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {/* Próximo vencimiento */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <i className="ri-calendar-line text-gray-400 dark:text-gray-500 text-sm flex-shrink-0"></i>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400">Próximo vencimiento</div>
                <div className={`text-sm font-medium ${
                  daysUntilDeadline <= 3 ? 'text-red-600 dark:text-red-400' : 
                  daysUntilDeadline <= 7 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {formatDate(nextDeadline)}
                  {daysUntilDeadline <= 7 && (
                    <span className="ml-1 text-xs whitespace-nowrap">
                      ({daysUntilDeadline === 0 ? 'Hoy' : 
                        daysUntilDeadline === 1 ? 'Mañana' : 
                        `${daysUntilDeadline} días`})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Equipo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex -space-x-2">
                {team.slice(0, 3).map((member, index) => (
                  <div
                    key={index}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-900"
                    title={member}
                  >
                    {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                ))}
                {team.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-900">
                    +{team.length - 3}
                  </div>
                )}
              </div>
              <i className="ri-arrow-right-line text-gray-400 dark:text-gray-500 text-sm group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ml-2"></i>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
