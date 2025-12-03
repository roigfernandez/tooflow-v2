
import { Metadata } from 'next';
import ReminderSettings from '@/components/ReminderSettings';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'Configuración de Recordatorios - Task Manager',
  description: 'Configura tus preferencias de recordatorios'
};

export default function ReminderSettingsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <ReminderSettings />
      </div>
    </AuthGuard>
  );
}
