
import { Suspense } from 'react';
import TaskDetailView from './TaskDetailView';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Cargando..." showSearch={false} />
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </main>
        <BottomNavigation />
      </div>
    }>
      <TaskDetailView taskId={params.id} />
    </Suspense>
  );
}
