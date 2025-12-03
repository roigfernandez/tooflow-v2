
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface ReminderPreference {
  id: string;
  user_id: string;
  reminder_type: string;
  enabled: boolean;
  advance_time: number;
  channels: string[];
  frequency: string;
}

export default function ReminderSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ReminderPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultPreferences = [
    {
      reminder_type: 'task_due',
      label: 'Vencimiento de Tareas',
      description: 'Recordatorios antes de que venzan las tareas',
      icon: 'ri-task-line'
    },
    {
      reminder_type: 'project_deadline',
      label: 'Fechas Límite de Proyectos',
      description: 'Recordatorios antes de fechas límite de proyectos',
      icon: 'ri-folder-line'
    },
    {
      reminder_type: 'meeting',
      label: 'Reuniones',
      description: 'Recordatorios antes de reuniones programadas',
      icon: 'ri-calendar-event-line'
    },
    {
      reminder_type: 'daily_summary',
      label: 'Resumen Diario',
      description: 'Resumen diario de tareas pendientes',
      icon: 'ri-calendar-line'
    }
  ];

  const advanceTimeOptions = [
    { value: 15, label: '15 minutos antes' },
    { value: 60, label: '1 hora antes' },
    { value: 1440, label: '1 día antes' },
    { value: 10080, label: '1 semana antes' },
    { value: 43200, label: '1 mes antes' }
  ];

  const channelOptions = [
    { value: 'notification', label: 'Notificación interna', icon: 'ri-notification-line' },
    { value: 'email', label: 'Correo electrónico', icon: 'ri-mail-line' },
    { value: 'push', label: 'Notificación push', icon: 'ri-smartphone-line' }
  ];

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_preferences')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Crear preferencias por defecto si no existen
      const existingTypes = data?.map(p => p.reminder_type) || [];
      const missingTypes = defaultPreferences.filter(p => !existingTypes.includes(p.reminder_type));

      if (missingTypes.length > 0) {
        const newPreferences = missingTypes.map(p => ({
          user_id: user?.id,
          reminder_type: p.reminder_type,
          enabled: true,
          advance_time: 60,
          channels: ['notification'],
          frequency: 'once'
        }));

        const { data: inserted } = await supabase
          .from('reminder_preferences')
          .insert(newPreferences)
          .select('*');

        setPreferences([...(data || []), ...(inserted || [])]);
      } else {
        setPreferences(data || []);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (id: string, updates: Partial<ReminderPreference>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('reminder_preferences')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setPreferences(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));
    } catch (error) {
      console.error('Error updating preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = (prefId: string, channel: string) => {
    const preference = preferences.find(p => p.id === prefId);
    if (!preference) return;

    const channels = preference.channels.includes(channel)
      ? preference.channels.filter(c => c !== channel)
      : [...preference.channels, channel];

    updatePreference(prefId, { channels });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Recordatorios</h2>
        <p className="text-gray-600">
          Personaliza cómo y cuándo quieres recibir recordatorios
        </p>
      </div>

      <div className="space-y-6">
        {defaultPreferences.map((defaultPref) => {
          const preference = preferences.find(p => p.reminder_type === defaultPref.reminder_type);
          if (!preference) return null;

          return (
            <div key={preference.id} className="bg-white p-6 rounded-lg border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className={`${defaultPref.icon} text-blue-600 text-lg`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {defaultPref.label}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {defaultPref.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preference.enabled}
                    onChange={(e) => updatePreference(preference.id, { enabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {preference.enabled && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Tiempo de anticipación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de anticipación
                    </label>
                    <select
                      value={preference.advance_time}
                      onChange={(e) => updatePreference(preference.id, { advance_time: parseInt(e.target.value) })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      {advanceTimeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Canales de notificación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canales de notificación
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {channelOptions.map(channel => (
                        <label key={channel.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preference.channels.includes(channel.value)}
                            onChange={() => toggleChannel(preference.id, channel.value)}
                            disabled={saving}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            <i className={`${channel.icon} text-gray-500`}></i>
                            <span className="text-sm text-gray-700">{channel.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Frecuencia para resumen diario */}
                  {preference.reminder_type === 'daily_summary' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora del resumen
                      </label>
                      <input
                        type="time"
                        value={preference.frequency || '09:00'}
                        onChange={(e) => updatePreference(preference.id, { frequency: e.target.value })}
                        disabled={saving}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Configuración global */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración Global
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">No molestar</h4>
              <p className="text-sm text-gray-600">
                Pausar todos los recordatorios temporalmente
              </p>
            </div>
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 whitespace-nowrap cursor-pointer">
              Configurar
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Horario de recordatorios</h4>
              <p className="text-sm text-gray-600">
                Solo recibir recordatorios en horarios específicos
              </p>
            </div>
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 whitespace-nowrap cursor-pointer">
              Configurar
            </button>
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <i className="ri-loader-4-line animate-spin mr-2"></i>
          Guardando configuración...
        </div>
      )}
    </div>
  );
}
