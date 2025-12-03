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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { userIds, type, title, message, data = {} } = await req.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('Se requiere al menos un usuario')
    }

    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      data
    }))

    const { error } = await supabaseClient
      .from('notifications')
      .insert(notifications)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, count: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})