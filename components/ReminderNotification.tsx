
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface ReminderNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  reminder_id?: string;
  task_id?: string;
  project_id?: string;
  created_at: string;
}

export default function ReminderNotification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [visible, setVisible] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!user) return;

    // Escuchar nuevas notificaciones de recordatorios
    const channel = supabase
      .channel('reminder_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new as any;
          if (notification.type === 'reminder') {
            showReminderNotification({
              id: notification.id,
              title: notification.title || 'Recordatorio',
              message: notification.message,
              type: 'info',
              reminder_id: notification.related_id,
              created_at: notification.created_at
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const showReminderNotification = (notification: ReminderNotification) => {
    setNotifications(prev => [...prev, notification]);
    setVisible(prev => ({ ...prev, [notification.id]: true }));

    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
      hideNotification(notification.id);
    }, 8000);
  };

  const hideNotification = (id: string) => {
    setVisible(prev => ({ ...prev, [id]: false }));
    // Remover de la lista después de la animación
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return 'ri-alarm-warning-line';
      case 'success': return 'ri-checkbox-circle-line';
      case 'error': return 'ri-error-warning-line';
      default: return 'ri-information-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`transform transition-all duration-300 ${
            visible[notification.id] 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
          }`}
        >
          <div className={`p-4 rounded-lg border shadow-lg ${getNotificationColor(notification.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm opacity-90">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs opacity-70">
                    {new Date(notification.created_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div className="flex space-x-2">
                    {notification.task_id && (
                      <button 
                        onClick={() => window.location.href = `/tasks/${notification.task_id}`}
                        className="text-xs underline hover:no-underline cursor-pointer"
                      >
                        Ver tarea
                      </button>
                    )}
                    {notification.project_id && (
                      <button 
                        onClick={() => window.location.href = `/projects/${notification.project_id}`}
                        className="text-xs underline hover:no-underline cursor-pointer"
                      >
                        Ver proyecto
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => hideNotification(notification.id)}
                className="flex-shrink-0 text-sm opacity-70 hover:opacity-100 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
