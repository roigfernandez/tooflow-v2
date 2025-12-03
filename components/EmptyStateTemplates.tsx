'use client';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

interface EmptyStateTemplatesProps {
  type: 'tasks' | 'projects' | 'calendar' | 'chat' | 'reports' | 'search' | 'filter' | 'admin';
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

interface ErrorStateTemplatesProps {
  type: 'network' | 'server' | 'validation' | 'permission' | 'loading' | 'export';
  onRetry?: () => void;
  onReport?: () => void;
  error?: any;
}

export function EmptyStateTemplates({ type, onAction, onSecondaryAction }: EmptyStateTemplatesProps) {
  const templates = {
    tasks: {
      icon: 'ri-task-line',
      title: '¡Es hora de organizarte!',
      description: 'Aún no tenés tareas creadas. Empezá a gestionar tu trabajo creando tu primera tarea.',
      illustration: { type: 'tasks' as const },
      action: onAction ? {
        label: 'Crear primera tarea',
        onClick: onAction
      } : undefined,
      secondaryAction: onSecondaryAction ? {
        label: 'Ver guía rápida',
        onClick: onSecondaryAction
      } : undefined
    },
    projects: {
      icon: 'ri-folder-line',
      title: 'Empezá tu primer proyecto',
      description: 'Los proyectos te ayudan a organizar tareas relacionadas y colaborar mejor con tu equipo.',
      illustration: { type: 'projects' as const },
      action: onAction ? {
        label: 'Crear proyecto',
        onClick: onAction
      } : undefined,
      secondaryAction: onSecondaryAction ? {
        label: 'Ver plantillas',
        onClick: onSecondaryAction
      } : undefined
    },
    calendar: {
      icon: 'ri-calendar-line',
      title: 'Tu calendario está vacío',
      description: 'Una vez que tengas tareas programadas, aparecerán aquí organizadas por fecha.',
      illustration: { type: 'calendar' as const },
      action: onAction ? {
        label: 'Crear primera tarea',
        onClick: onAction
      } : undefined,
      secondaryAction: onSecondaryAction ? {
        label: 'Ver vista de lista',
        onClick: onSecondaryAction
      } : undefined
    },
    chat: {
      icon: 'ri-chat-3-line',
      title: '¡Sé el primero en escribir!',
      description: 'Inicia la conversación con tu equipo. Compartí ideas, hacé preguntas o simplemente saludá.',
      illustration: { type: 'chat' as const },
      action: onAction ? {
        label: 'Escribir mensaje',
        onClick: onAction
      } : undefined
    },
    reports: {
      icon: 'ri-bar-chart-line',
      title: 'Sin datos suficientes',
      description: 'Necesitás al menos algunas tareas completadas para generar reportes útiles.',
      action: onAction ? {
        label: 'Crear tareas',
        onClick: onAction
      } : undefined,
      secondaryAction: onSecondaryAction ? {
        label: 'Ver datos de ejemplo',
        onClick: onSecondaryAction
      } : undefined
    },
    search: {
      icon: 'ri-search-line',
      title: 'Sin resultados',
      description: 'No encontramos nada que coincida con tu búsqueda. Probá con otros términos.',
      illustration: { type: 'search' as const },
      action: onAction ? {
        label: 'Limpiar búsqueda',
        onClick: onAction
      } : undefined,
      secondaryAction: onSecondaryAction ? {
        label: 'Ver todo',
        onClick: onSecondaryAction
      } : undefined
    },
    filter: {
      icon: 'ri-filter-line',
      title: 'Sin coincidencias',
      description: 'No hay elementos que coincidan con los filtros aplicados. Probá ajustando los criterios de búsqueda.',
      illustration: { type: 'filter' as const },
      action: onAction ? {
        label: 'Limpiar filtros',
        onClick: onAction
      } : undefined,
      secondaryAction: onSecondaryAction ? {
        label: 'Ampliar búsqueda',
        onClick: onSecondaryAction
      } : undefined
    },
    admin: {
      icon: 'ri-admin-line',
      title: 'Panel administrativo vacío',
      description: 'Cuando tengas datos del equipo y proyectos, aquí verás métricas y estadísticas detalladas.',
      action: onAction ? {
        label: 'Configurar equipo',
        onClick: onAction
      } : undefined,
      secondaryAction: onSecondaryAction ? {
        label: 'Cargar datos demo',
        onClick: onSecondaryAction
      } : undefined
    }
  };

  const template = templates[type];
  return <EmptyState {...template} />;
}

export function ErrorStateTemplates({ type, onRetry, onReport, error }: ErrorStateTemplatesProps) {
  const templates = {
    network: {
      type: 'network' as const,
      technicalDetails: error ? {
        error: error.message || 'Connection timeout',
        code: error.code || 'NETWORK_ERROR',
        timestamp: new Date().toISOString()
      } : undefined
    },
    server: {
      type: 'server' as const,
      technicalDetails: error ? {
        error: error.message || 'Internal server error',
        code: error.status || '500',
        timestamp: new Date().toISOString(),
        stack: error.stack
      } : undefined
    },
    validation: {
      type: 'validation' as const,
      title: 'Error de validación',
      message: 'Los datos ingresados no son válidos. Revisá la información e intentá nuevamente.',
      technicalDetails: error ? {
        error: error.message || 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      } : undefined
    },
    permission: {
      type: 'permission' as const,
      title: 'Acceso denegado',
      message: 'No tenés los permisos necesarios para acceder a esta sección. Contactá a tu administrador.',
      technicalDetails: error ? {
        error: error.message || 'Access denied',
        code: error.status || '403',
        timestamp: new Date().toISOString()
      } : undefined
    },
    loading: {
      type: 'generic' as const,
      title: 'Error al cargar',
      message: 'No pudimos cargar el contenido. Revisá tu conexión e intentá nuevamente.',
      technicalDetails: error ? {
        error: error.message || 'Loading failed',
        code: 'LOADING_ERROR',
        timestamp: new Date().toISOString()
      } : undefined
    },
    export: {
      type: 'server' as const,
      title: 'Error en la exportación',
      message: 'No pudimos generar tu reporte. Intentá nuevamente o probá con menos datos.',
      technicalDetails: error ? {
        error: error.message || 'Export generation failed',
        code: 'EXPORT_ERROR',
        timestamp: new Date().toISOString()
      } : undefined
    }
  };

  const template = templates[type];
  return (
    <ErrorState 
      {...template}
      onRetry={onRetry}
      onReport={onReport}
    />
  );
}