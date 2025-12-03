
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dashboardService, tasksService } from '@/lib/database';
import AuthGuard from '@/components/AuthGuard';
import DashboardKPIs from '@/components/DashboardKPIs';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import TaskCard from '@/components/TaskCard';
import ProductivityInsights from '@/components/ProductivityInsights';
import QuickActions from '@/components/QuickActions';
import DateTimeDisplay from '@/components/DateTimeDisplay';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardStats, tasks] = await Promise.all([
        dashboardService.getStats(),
        tasksService.getAll()
      ]);

      setStats(dashboardStats);
      setRecentTasks(tasks.slice(0, 5));
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err?.message || 'Error al cargar el dashboard');

      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        overdue: 0,
        completionRate: 0,
        projects: 0,
        activeProjects: 0
      });
      setRecentTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user && loading) {
    return (
      <AuthGuard>
        <DashboardSkeleton />
      </AuthGuard>
    );
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardSkeleton />
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <i className="ri-error-warning-line text-red-500 text-3xl mb-4"></i>
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                Error al cargar el dashboard
              </h2>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Datos seguros para ProductivityInsights
  const productivityData = {
    totalTasks: stats?.total || 0,
    completedPercentage: stats?.completionRate || 0,
    overdueTasks: stats?.overdue || 0,
    dueSoonTasks: 0,
    activeProjects: stats?.activeProjects || 0,
    activeUsers: 1
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="px-6 pt-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ¡Hola, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Aquí tienes un resumen de tu productividad
                </p>
                <DateTimeDisplay />
              </div>
              <QuickActions />
            </div>

            <DashboardKPIs stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DashboardCharts />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Tareas Recientes
                  </h3>
                  <i className="ri-task-line text-gray-400 dark:text-gray-500"></i>
                </div>

                <div className="space-y-4">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <div key={task.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                        <TaskCard task={task} compact />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="ri-task-line text-gray-300 dark:text-gray-600 text-3xl mb-3"></i>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No hay tareas recientes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ProductivityInsights data={productivityData} />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
