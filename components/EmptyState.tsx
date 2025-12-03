'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: {
    type: 'tasks' | 'projects' | 'calendar' | 'chat' | 'reports' | 'search' | 'filter';
  };
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction,
  illustration 
}: EmptyStateProps) {
  const getIllustrationElements = () => {
    switch (illustration?.type) {
      case 'tasks':
        return (
          <div className="relative">
            <div className="w-16 h-20 bg-gray-100 rounded-lg mb-2"></div>
            <div className="w-12 h-12 bg-blue-100 rounded-full absolute -top-2 -right-2 flex items-center justify-center">
              <i className="ri-check-line text-blue-500 text-lg"></i>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="flex gap-2">
            <div className="w-12 h-16 bg-purple-100 rounded-lg"></div>
            <div className="w-12 h-16 bg-blue-100 rounded-lg"></div>
            <div className="w-12 h-16 bg-green-100 rounded-lg"></div>
          </div>
        );
      case 'calendar':
        return (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded ${i === 4 ? 'bg-blue-100' : 'bg-gray-100'}`}></div>
            ))}
          </div>
        );
      case 'chat':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-100 rounded-full"></div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="w-16 h-4 bg-blue-100 rounded-full"></div>
              <div className="w-6 h-6 bg-green-100 rounded-full"></div>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="relative">
            <div className="w-16 h-16 border-2 border-gray-200 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-200 absolute bottom-2 right-2 rounded transform rotate-45"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-center py-12 px-4">
      {/* Ilustración o icono */}
      <div className="flex justify-center mb-6">
        {illustration ? (
          <div className="relative">
            {getIllustrationElements()}
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <i className={`${icon} text-gray-400 text-3xl`}></i>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        {/* Acciones */}
        <div className="space-y-3">
          {action && (
            <button
              onClick={action.onClick}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                action.variant === 'secondary'
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>

      {/* Consejos útiles */}
      {illustration?.type === 'filter' && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
          <div className="flex items-start gap-2">
            <i className="ri-lightbulb-line text-blue-500 mt-0.5"></i>
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 mb-1">Consejo útil</p>
              <p className="text-sm text-blue-700">
                Probá ajustando los filtros de fecha, estado o proyecto para ver más resultados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}