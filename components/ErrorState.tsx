'use client';
import { useState } from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  technicalDetails?: {
    error: string;
    code?: string;
    timestamp?: string;
    stack?: string;
  };
  onRetry?: () => void;
  onReport?: () => void;
  type?: 'network' | 'server' | 'validation' | 'permission' | 'generic';
}

export default function ErrorState({ 
  title, 
  message, 
  technicalDetails, 
  onRetry, 
  onReport,
  type = 'generic' 
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: 'ri-wifi-off-line',
          defaultTitle: 'Sin conexión',
          defaultMessage: 'No pudimos conectar con el servidor. Revisá tu conexión a internet e intentá nuevamente.',
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-100'
        };
      case 'server':
        return {
          icon: 'ri-server-line',
          defaultTitle: 'Error del servidor',
          defaultMessage: 'Hay un problema en nuestros servidores. Estamos trabajando para solucionarlo.',
          iconColor: 'text-red-500',
          bgColor: 'bg-red-100'
        };
      case 'validation':
        return {
          icon: 'ri-error-warning-line',
          defaultTitle: 'Error de validación',
          defaultMessage: 'Los datos ingresados no son válidos. Revisá la información e intentá nuevamente.',
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-100'
        };
      case 'permission':
        return {
          icon: 'ri-lock-line',
          defaultTitle: 'Sin permisos',
          defaultMessage: 'No tenés los permisos necesarios para realizar esta acción.',
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-100'
        };
      default:
        return {
          icon: 'ri-error-warning-line',
          defaultTitle: 'Algo salió mal',
          defaultMessage: 'Ocurrió un error inesperado. Intentá nuevamente en unos momentos.',
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return new Date().toLocaleString('es-ES');
    return new Date(timestamp).toLocaleString('es-ES');
  };

  const getRecommendations = () => {
    switch (type) {
      case 'network':
        return [
          'Revisá tu conexión a internet',
          'Intentá recargar la página',
          'Probá en unos minutos'
        ];
      case 'server':
        return [
          'Intentá nuevamente en unos minutos',
          'Revisá nuestro estado del servicio',
          'Contactanos si el problema persiste'
        ];
      case 'validation':
        return [
          'Verificá que todos los campos estén completos',
          'Revisá el formato de los datos',
          'Consultá la documentación'
        ];
      case 'permission':
        return [
          'Contactá a tu administrador',
          'Verificá tu rol de usuario',
          'Intentá iniciar sesión nuevamente'
        ];
      default:
        return [
          'Intentá recargar la página',
          'Revisá tu conexión',
          'Contactanos si persiste'
        ];
    }
  };

  return (
    <div className="text-center py-12 px-4">
      {/* Icono de error */}
      <div className="flex justify-center mb-6">
        <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center`}>
          <i className={`${config.icon} ${config.iconColor} text-3xl`}></i>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{displayTitle}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">{displayMessage}</p>

        {/* Acciones principales */}
        <div className="space-y-3 mb-8">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <i className="ri-refresh-line"></i>
              Reintentar
            </button>
          )}

          {onReport && (
            <button
              onClick={onReport}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <i className="ri-bug-line"></i>
              Reportar problema
            </button>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">¿Qué podés hacer?</h4>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            {getRecommendations().map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <i className="ri-arrow-right-s-line text-gray-400 mt-0.5 flex-shrink-0"></i>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Detalles técnicos */}
        {technicalDetails && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-4 py-3 bg-gray-50 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">Detalles técnicos</span>
              <i className={`ri-arrow-${showDetails ? 'up' : 'down'}-s-line text-gray-400`}></i>
            </button>
            
            {showDetails && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Error</label>
                    <code className="block text-xs bg-gray-100 p-2 rounded border text-gray-800 font-mono break-all">
                      {technicalDetails.error}
                    </code>
                  </div>
                  
                  {technicalDetails.code && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Código</label>
                      <code className="block text-xs bg-gray-100 p-2 rounded border text-gray-800 font-mono">
                        {technicalDetails.code}
                      </code>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Momento</label>
                    <code className="block text-xs bg-gray-100 p-2 rounded border text-gray-800 font-mono">
                      {formatTimestamp(technicalDetails.timestamp)}
                    </code>
                  </div>

                  {technicalDetails.stack && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Stack trace</label>
                      <code className="block text-xs bg-gray-100 p-2 rounded border text-gray-800 font-mono max-h-32 overflow-y-auto">
                        {technicalDetails.stack}
                      </code>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start gap-2">
                    <i className="ri-information-line text-yellow-600 mt-0.5 text-sm"></i>
                    <p className="text-xs text-yellow-800">
                      Compartí esta información con el equipo de soporte para resolver el problema más rápido.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información de contacto */}
        <div className="mt-8 text-xs text-gray-500">
          ¿Necesitás ayuda? <button className="text-blue-500 hover:text-blue-600 underline">Contactá soporte</button>
        </div>
      </div>
    </div>
  );
}