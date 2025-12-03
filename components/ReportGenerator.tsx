'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface ReportConfig {
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  includeProjects: boolean;
  includeTasks: boolean;
  includeTeam: boolean;
  includeCharts: boolean;
  format: 'pdf' | 'excel' | 'csv';
  projectIds: string[];
  groupBy: 'project' | 'user' | 'status' | 'priority';
}

interface ReportGeneratorProps {
  onGenerate?: (config: ReportConfig) => void;
}

export default function ReportGenerator({ onGenerate }: ReportGeneratorProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Reporte de Productividad',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeProjects: true,
    includeTasks: true,
    includeTeam: false,
    includeCharts: true,
    format: 'pdf',
    projectIds: [],
    groupBy: 'project'
  });

  const handleGenerate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Llamar a la Edge Function para generar el reporte
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: {
          userId: user.id,
          config: config
        }
      });

      if (error) throw error;

      // Descargar el archivo generado
      if (data?.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${config.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      onGenerate?.(config);
      setIsOpen(false);

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const predefinedRanges = [
    { label: 'Última semana', days: 7 },
    { label: 'Últimos 30 días', days: 30 },
    { label: 'Últimos 3 meses', days: 90 },
    { label: 'Este año', days: 365 }
  ];

  const setPredefinedRange = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    updateConfig({ dateRange: { start, end } });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-file-download-line text-sm"></i>
        </div>
        Generar Reporte
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Generar Reporte Personalizado
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configura y exporta reportes detallados de productividad
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Configuración básica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título del Reporte
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
              placeholder="Nombre del reporte"
            />
          </div>

          {/* Rango de fechas */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Período del Reporte
            </label>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {predefinedRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setPredefinedRange(range.days)}
                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={config.dateRange.start}
                  onChange={(e) => updateConfig({
                    dateRange: { ...config.dateRange, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={config.dateRange.end}
                  onChange={(e) => updateConfig({
                    dateRange: { ...config.dateRange, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Contenido del reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Incluir en el Reporte
            </label>
            <div className="space-y-3">
              {[
                { key: 'includeProjects', label: 'Información de Proyectos', icon: 'ri-folder-line' },
                { key: 'includeTasks', label: 'Detalles de Tareas', icon: 'ri-task-line' },
                { key: 'includeTeam', label: 'Métricas del Equipo', icon: 'ri-team-line' },
                { key: 'includeCharts', label: 'Gráficos y Visualizaciones', icon: 'ri-bar-chart-line' }
              ].map((option) => (
                <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[option.key as keyof ReportConfig] as boolean}
                    onChange={(e) => updateConfig({ [option.key]: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <div className="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <i className={option.icon}></i>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Configuración avanzada */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agrupar por
              </label>
              <select
                value={config.groupBy}
                onChange={(e) => updateConfig({ groupBy: e.target.value as any })}
                className="w-full px-4 py-3 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
              >
                <option value="project">Proyecto</option>
                <option value="user">Usuario</option>
                <option value="status">Estado</option>
                <option value="priority">Prioridad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formato de Exportación
              </label>
              <select
                value={config.format}
                onChange={(e) => updateConfig({ format: e.target.value as any })}
                className="w-full px-4 py-3 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          {/* Vista previa de configuración */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Vista Previa de Configuración
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>• Período: {config.dateRange.start} a {config.dateRange.end}</div>
              <div>• Formato: {config.format.toUpperCase()}</div>
              <div>• Agrupado por: {config.groupBy}</div>
              <div>• Secciones: {[
                config.includeProjects && 'Proyectos',
                config.includeTasks && 'Tareas', 
                config.includeTeam && 'Equipo',
                config.includeCharts && 'Gráficos'
              ].filter(Boolean).join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-download-line text-sm"></i>
                  </div>
                  Generar Reporte
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}