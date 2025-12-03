
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
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

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Suscripción a notificaciones en tiempo real
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Notification update:', payload);
          loadNotifications();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

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
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
        return 'text-blue-500';
      case 'task_completed':
        return 'text-green-500';
      case 'project_invitation':
        return 'text-purple-500';
      case 'reminder':
        return 'text-orange-500';
      case 'comment':
        return 'text-indigo-500';
      case 'due_date':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <i className="ri-notification-3-line text-xl text-gray-600 dark:text-gray-400"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer whitespace-nowrap"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="ri-notification-off-line text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                  <p className="text-gray-500 dark:text-gray-400">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="py-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 cursor-pointer ${
                        notification.read 
                          ? 'border-transparent bg-white dark:bg-gray-800' 
                          : 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        if (notification.data?.link) {
                          setIsOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          notification.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <i className={`${getNotificationIcon(notification.type)} ${getNotificationColor(notification.type)}`}></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium truncate ${
                              notification.read 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.read 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                        </div>

                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>

                      {notification.data?.link && (
                        <div className="mt-2 ml-11">
                          <Link
                            href={notification.data.link}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
                            onClick={() => setIsOpen(false)}
                          >
                            Ver detalles →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <Link
                  href="/notifications"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
                  onClick={() => setIsOpen(false)}
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
