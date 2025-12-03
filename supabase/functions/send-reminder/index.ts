import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'GET') {
      // Verificar recordatorios pendientes y enviarlos
      const now = new Date().toISOString()
      
      // Obtener recordatorios que deben ser enviados
      const { data: reminders, error: remindersError } = await supabaseClient
        .from('sent_reminders')
        .select(`
          *,
          profiles(email, full_name),
          tasks(title, description),
          projects(name, description)
        `)
        .eq('status', 'active')
        .lte('reminder_date', now)

      if (remindersError) {
        throw remindersError
      }

      let sentCount = 0

      for (const reminder of reminders || []) {
        try {
          // Crear notificación
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: reminder.user_id,
              title: reminder.title,
              message: reminder.description || `Recordatorio: ${reminder.title}`,
              type: 'reminder',
              related_id: reminder.id,
              related_type: 'reminder'
            })

          // Marcar recordatorio como enviado
          await supabaseClient
            .from('sent_reminders')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', reminder.id)

          // Si es recurrente, crear el próximo recordatorio
          if (reminder.frequency !== 'once') {
            let nextDate = new Date(reminder.reminder_date)
            
            switch (reminder.frequency) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1)
                break
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7)
                break
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1)
                break
            }

            await supabaseClient
              .from('sent_reminders')
              .insert({
                user_id: reminder.user_id,
                task_id: reminder.task_id,
                project_id: reminder.project_id,
                title: reminder.title,
                description: reminder.description,
                reminder_date: nextDate.toISOString(),
                reminder_type: reminder.reminder_type,
                frequency: reminder.frequency,
                channels: reminder.channels,
                status: 'active'
              })
          }

          sentCount++
        } catch (error) {
          console.error(`Error sending reminder ${reminder.id}:`, error)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          sent_count: sentCount,
          processed_reminders: reminders?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (req.method === 'POST') {
      const { reminder_id, user_id } = await req.json()

      if (!reminder_id || !user_id) {
        return new Response(
          JSON.stringify({ error: 'reminder_id and user_id are required' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // Obtener información del recordatorio
      const { data: reminder, error: reminderError } = await supabaseClient
        .from('sent_reminders')
        .select(`
          *,
          tasks(title, description),
          projects(name, description)
        `)
        .eq('id', reminder_id)
        .eq('user_id', user_id)
        .single()

      if (reminderError || !reminder) {
        return new Response(
          JSON.stringify({ error: 'Reminder not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        )
      }

      // Crear notificación inmediata
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: user_id,
          title: reminder.title,
          message: reminder.description || `Recordatorio: ${reminder.title}`,
          type: 'reminder',
          related_id: reminder_id,
          related_type: 'reminder'
        })

      if (notificationError) {
        throw notificationError
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Reminder sent successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    console.error('Error in send-reminder function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})