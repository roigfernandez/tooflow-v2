
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      taskReminders: true,
      projectUpdates: true,
      weeklyReport: false
    },
    preferences: {
      language: 'es',
      dateFormat: 'dd/mm/yyyy',
      startWeek: 'monday',
      defaultView: 'list'
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
      emailVisible: false
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular guardado - aquí se conectaría con Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configuración guardada correctamente');
    } catch (error) {
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
      const doubleConfirm = window.prompt(
        'Escribe "ELIMINAR" para confirmar que quieres eliminar tu cuenta permanentemente:'
      );
      
      if (doubleConfirm === 'ELIMINAR') {
        try {
          // Aquí se implementaría la eliminación de cuenta
          alert('Funcionalidad en desarrollo. Contacta con soporte para eliminar tu cuenta.');
        } catch (error) {
          alert('Error al eliminar la cuenta');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
                <p className="text-gray-600 dark:text-gray-400">Personaliza tu experiencia en TooFlow</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Apariencia */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <i className="ri-palette-line mr-2"></i>
                Apariencia
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Tema</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Elige entre tema claro u oscuro</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    <i className={theme === 'dark' ? 'ri-moon-line' : 'ri-sun-line'}></i>
                    {theme === 'dark' ? 'Oscuro' : 'Claro'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Vista predeterminada</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cómo mostrar las tareas por defecto</p>
                  </div>
                  <select
                    value={settings.preferences.defaultView}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, defaultView: e.target.value }
                    }))}
                    className="px-3 py-2 pr-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="list">Lista</option>
                    <option value="board">Tablero</option>
                    <option value="calendar">Calendario</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Notificaciones */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <i className="ri-notification-line mr-2"></i>
                Notificaciones
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Notificaciones por email</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recibe actualizaciones por correo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Recordatorios de tareas</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avisos antes de las fechas límite</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.taskReminders}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, taskReminders: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Actualizaciones de proyectos</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cambios en proyectos que sigues</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.projectUpdates}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, projectUpdates: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Reporte semanal</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Resumen de tu productividad</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyReport}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, weeklyReport: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Preferencias */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <i className="ri-settings-line mr-2"></i>
                Preferencias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))}
                    className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formato de fecha
                  </label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, dateFormat: e.target.value }
                    }))}
                    className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Inicio de semana
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="startWeek"
                        value="monday"
                        checked={settings.preferences.startWeek === 'monday'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, startWeek: e.target.value }
                        }))}
                        className="mr-2 text-blue-600"
                      />
                      Lunes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="startWeek"
                        value="sunday"
                        checked={settings.preferences.startWeek === 'sunday'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, startWeek: e.target.value }
                        }))}
                        className="mr-2 text-blue-600"
                      />
                      Domingo
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Privacidad */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <i className="ri-shield-line mr-2"></i>
                Privacidad
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Perfil público</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Otros usuarios pueden ver tu perfil</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.profileVisible}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, profileVisible: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Actividad visible</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mostrar tu actividad reciente</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.activityVisible}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, activityVisible: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Zona peligrosa */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                <i className="ri-alert-line mr-2"></i>
                Zona peligrosa
              </h2>
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-100">Eliminar cuenta</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </section>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line"></i>
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
