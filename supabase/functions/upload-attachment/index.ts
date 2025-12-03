import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (req.method === 'POST') {
      const formData = await req.formData()
      const file = formData.get('file') as File
      const taskId = formData.get('taskId') as string
      const commentId = formData.get('commentId') as string
      const projectCommentId = formData.get('projectCommentId') as string

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No se proporcionó archivo' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Validaciones de archivo
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return new Response(
          JSON.stringify({ error: 'El archivo es demasiado grande (máximo 10MB)' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-zip-compressed'
      ]

      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: 'Tipo de archivo no permitido' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Verificar permisos según el contexto
      if (taskId) {
        const { data: task } = await supabaseClient
          .from('tasks')
          .select(`
            project_id,
            project_members!inner(user_id)
          `)
          .eq('id', taskId)
          .eq('project_members.user_id', user.id)
          .single()

        if (!task) {
          return new Response(
            JSON.stringify({ error: 'No tienes permisos para subir archivos a esta tarea' }),
            {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
      }

      if (commentId) {
        const { data: comment } = await supabaseClient
          .from('task_comments')
          .select(`
            task_id,
            tasks!inner(
              project_id,
              project_members!inner(user_id)
            )
          `)
          .eq('id', commentId)
          .eq('tasks.project_members.user_id', user.id)
          .single()

        if (!comment) {
          return new Response(
            JSON.stringify({ error: 'No tienes permisos para subir archivos a este comentario' }),
            {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
      }

      if (projectCommentId) {
        const { data: comment } = await supabaseClient
          .from('project_comments')
          .select(`
            project_id,
            project_members!inner(user_id)
          `)
          .eq('id', projectCommentId)
          .eq('project_members.user_id', user.id)
          .single()

        if (!comment) {
          return new Response(
            JSON.stringify({ error: 'No tienes permisos para subir archivos a este comentario' }),
            {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const randomId = crypto.randomUUID().slice(0, 8)
      const fileExtension = file.name.split('.').pop()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `attachments/${user.id}/${timestamp}_${randomId}_${sanitizedFileName}`

      // Subir archivo al storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('project-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return new Response(
          JSON.stringify({ error: 'Error al subir el archivo' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Guardar información del archivo en la base de datos
      const attachmentData = {
        file_name: sanitizedFileName,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        uploaded_by: user.id,
        ...(taskId && { task_id: taskId }),
        ...(commentId && { comment_id: commentId }),
        ...(projectCommentId && { project_comment_id: projectCommentId })
      }

      const { data: attachment, error: dbError } = await supabaseClient
        .from('attachments')
        .insert(attachmentData)
        .select(`
          id,
          file_name,
          file_size,
          file_type,
          storage_path,
          created_at,
          uploaded_by,
          profiles!uploaded_by(full_name)
        `)
        .single()

      if (dbError) {
        console.error('Error saving attachment:', dbError)
        
        // Eliminar archivo del storage si falla la BD
        await supabaseClient.storage
          .from('project-files')
          .remove([storagePath])

        return new Response(
          JSON.stringify({ error: 'Error al guardar información del archivo' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          attachment: {
            ...attachment,
            uploader_name: attachment.profiles?.full_name || 'Usuario'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (req.method === 'DELETE') {
      const { attachmentId } = await req.json()

      if (!attachmentId) {
        return new Response(
          JSON.stringify({ error: 'ID de archivo requerido' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Obtener información del archivo
      const { data: attachment, error: fetchError } = await supabaseClient
        .from('attachments')
        .select('storage_path, uploaded_by')
        .eq('id', attachmentId)
        .single()

      if (fetchError || !attachment) {
        return new Response(
          JSON.stringify({ error: 'Archivo no encontrado' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Verificar que el usuario puede eliminar el archivo
      if (attachment.uploaded_by !== user.id) {
        return new Response(
          JSON.stringify({ error: 'No tienes permisos para eliminar este archivo' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Eliminar de la base de datos
      const { error: deleteError } = await supabaseClient
        .from('attachments')
        .delete()
        .eq('id', attachmentId)

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Error al eliminar el archivo de la base de datos' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Eliminar del storage
      const { error: storageError } = await supabaseClient.storage
        .from('project-files')
        .remove([attachment.storage_path])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in upload-attachment function:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})