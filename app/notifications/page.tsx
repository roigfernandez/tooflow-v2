
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, filter]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'ri-task-line';
      case 'task_completed':
        return 'ri-checkbox-circle-line';
      case 'project_invitation':
        return 'ri-team-line';
      case 'reminder':
        return 'ri-alarm-line';
      case 'comment':
        return 'ri-chat-3-line';
      case 'due_date':
        return 'ri-calendar-event-line';
      default:
        return 'ri-notification-3-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'task_completed':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'project_invitation':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
      case 'reminder':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'comment':
        return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30';
      case 'due_date':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Ahora' : `${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="pt-16 pb-20">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Notificaciones
                </h1>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm whitespace-nowrap"
                  >
                    <i className="ri-check-double-line mr-2"></i>
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'unread'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  No leídas ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notificaciones */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <i className="ri-notification-off-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'unread' 
                    ? 'Todas tus notificaciones están al día' 
                    : 'Las notificaciones aparecerán aquí cuando tengas actividad'
                  }
                </p>
                {filter === 'unread' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    Ver todas las notificaciones
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border transition-all hover:shadow-md ${
                      notification.read 
                        ? 'border-gray-200 dark:border-gray-700' 
                        : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className={`font-medium mb-1 ${
                                notification.read 
                                  ? 'text-gray-700 dark:text-gray-300' 
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {notification.title}
                              </h3>
                              <p className={`text-sm ${
                                notification.read 
                                  ? 'text-gray-500 dark:text-gray-400' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(notification.created_at)}
                                </span>
                                {notification.data?.link && (
                                  <Link
                                    href={notification.data.link}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
                                  >
                                    Ver detalles →
                                  </Link>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                  title="Marcar como leída"
                                >
                                  <i className="ri-check-line"></i>
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                title="Eliminar notificación"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
