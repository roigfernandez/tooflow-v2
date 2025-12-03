import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { method } = req
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (method) {
      case 'GET':
        if (action === 'list') {
          // Listar archivos del usuario
          const { data: files, error } = await supabaseClient
            .from('files')
            .select(`
              *,
              created_by_profile:profiles!files_created_by_fkey(full_name)
            `)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            throw error
          }

          const formattedFiles = files.map(file => ({
            ...file,
            created_by_name: file.created_by_profile?.full_name || 'Usuario'
          }))

          return new Response(
            JSON.stringify({ files: formattedFiles }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'POST':
        if (action === 'create') {
          const body = await req.json()
          const { name, url, size, type, folder, project_id, task_id } = body

          // Crear registro de archivo
          const { data: file, error } = await supabaseClient
            .from('files')
            .insert({
              name,
              url,
              size,
              type,
              folder: folder || 'general',
              project_id,
              task_id,
              created_by: user.id
            })
            .select(`
              *,
              created_by_profile:profiles!files_created_by_fkey(full_name)
            `)
            .single()

          if (error) {
            throw error
          }

          const formattedFile = {
            ...file,
            created_by_name: file.created_by_profile?.full_name || 'Usuario'
          }

          return new Response(
            JSON.stringify({ file: formattedFile }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'DELETE':
        const fileId = url.searchParams.get('id')
        if (!fileId) {
          return new Response(
            JSON.stringify({ error: 'ID de archivo requerido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Obtener información del archivo antes de eliminarlo
        const { data: fileToDelete, error: fetchError } = await supabaseClient
          .from('files')
          .select('*')
          .eq('id', fileId)
          .eq('created_by', user.id)
          .single()

        if (fetchError || !fileToDelete) {
          return new Response(
            JSON.stringify({ error: 'Archivo no encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Eliminar archivo del storage
        if (fileToDelete.storage_path) {
          const { error: storageError } = await supabaseClient.storage
            .from('attachments')
            .remove([fileToDelete.storage_path])

          if (storageError) {
            console.error('Error deleting from storage:', storageError)
          }
        }

        // Eliminar registro de la base de datos
        const { error: deleteError } = await supabaseClient
          .from('files')
          .delete()
          .eq('id', fileId)
          .eq('created_by', user.id)

        if (deleteError) {
          throw deleteError
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Método no permitido' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in manage-file function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})