
import { supabase } from './supabase';

export interface CreateNotificationParams {
  userIds: string[];
  type: string;
  title: string;
  message: string;
  data?: any;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    // Verificar si Supabase está configurado correctamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('demo') || supabaseKey.includes('demo')) {
      // Modo demo - simular creación exitosa
      console.log('Demo mode: Notification created', params);
      return { success: true, mode: 'demo' };
    }

    const { data, error } = await supabase.functions.invoke('create-notification', {
      body: params
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    // En caso de error, no fallar completamente
    return { success: false, error: error.message };
  }
};

export const notificationHelpers = {
  taskAssigned: async (assignedUserId: string, taskTitle: string, assignerName: string, taskId: string) => {
    return createNotification({
      userIds: [assignedUserId],
      type: 'task_assigned',
      title: 'Nueva tarea asignada',
      message: `${assignerName} te asignó la tarea "${taskTitle}"`,
      data: { taskId, assignerName, taskTitle }
    });
  },

  taskComment: async (taskOwnerIds: string[], commenterName: string, taskTitle: string, taskId: string) => {
    return createNotification({
      userIds: taskOwnerIds,
      type: 'task_comment',
      title: 'Nuevo comentario',
      message: `${commenterName} comentó en "${taskTitle}"`,
      data: { taskId, commenterName, taskTitle }
    });
  },

  taskDueSoon: async (assignedUserId: string, taskTitle: string, dueDate: string, taskId: string) => {
    return createNotification({
      userIds: [assignedUserId],
      type: 'task_due',
      title: 'Tarea próxima a vencer',
      message: `La tarea "${taskTitle}" vence pronto`,
      data: { taskId, taskTitle, dueDate }
    });
  },

  projectInvite: async (invitedUserId: string, projectName: string, inviterName: string, projectId: string) => {
    return createNotification({
      userIds: [invitedUserId],
      type: 'project_invite',
      title: 'Invitación a proyecto',
      message: `${inviterName} te invitó al proyecto "${projectName}"`,
      data: { projectId, inviterName, projectName }
    });
  },

  projectUpdate: async (memberIds: string[], projectName: string, updateType: string, projectId: string) => {
    return createNotification({
      userIds: memberIds,
      type: 'project_update',
      title: 'Actualización de proyecto',
      message: `Hay una actualización en el proyecto "${projectName}"`,
      data: { projectId, projectName, updateType }
    });
  }
};
