
import { Metadata } from 'next';
import ReminderManager from '@/components/ReminderManager';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'Recordatorios - Task Manager',
  description: 'Gestiona y configura tus recordatorios inteligentes'
};

export default function RemindersPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <ReminderManager />
      </div>
    </AuthGuard>
  );
}
