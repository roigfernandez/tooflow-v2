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

    const { filters, format } = await req.json()

    // Construir query base para tareas
    let query = supabaseClient
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        completed_at,
        created_at,
        updated_at,
        assigned_to,
        project_id,
        projects!inner(
          name,
          color
        ),
        profiles!assigned_to(
          full_name,
          email
        )
      `)

    // Aplicar filtros
    if (filters.dateRange?.start && filters.dateRange?.end) {
      query = query
        .gte('created_at', filters.dateRange.start + 'T00:00:00.000Z')
        .lte('created_at', filters.dateRange.end + 'T23:59:59.999Z')
    }

    if (filters.status && filters.status.length > 0) {
      const statusMap = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      }
      const mappedStatuses = filters.status.map(s => statusMap[s]).filter(Boolean)
      if (mappedStatuses.length > 0) {
        query = query.in('status', mappedStatuses)
      }
    }

    if (filters.assignees && filters.assignees.length > 0) {
      query = query.in('assigned_to', filters.assignees)
    }

    if (filters.projects && filters.projects.length > 0) {
      query = query.in('project_id', filters.projects)
    }

    // Verificar que solo se incluyan proyectos donde el usuario es miembro
    query = query.in('project_id', supabaseClient
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)
    )

    const { data: tasks, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return new Response(
        JSON.stringify({ error: 'Error al obtener las tareas' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Procesar datos para exportación
    const processedData = tasks.map(task => ({
      id: task.id,
      titulo: task.title,
      descripcion: task.description || '',
      proyecto: task.projects?.name || '',
      asignado_a: task.profiles?.full_name || task.profiles?.email || 'Sin asignar',
      estado: getStatusLabel(task.status),
      prioridad: getPriorityLabel(task.priority),
      fecha_vencimiento: task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '',
      fecha_completada: task.completed_at ? new Date(task.completed_at).toLocaleDateString('es-ES') : '',
      fecha_creacion: new Date(task.created_at).toLocaleDateString('es-ES'),
      duracion_estimada: calculateDuration(task.created_at, task.completed_at || task.updated_at)
    }))

    // Generar contenido según formato
    let fileContent: string
    let contentType: string
    let fileName: string

    const timestamp = new Date().toISOString().split('T')[0]
    
    if (format === 'csv') {
      fileContent = generateCSV(processedData)
      contentType = 'text/csv'
      fileName = `reporte-tooflow-${timestamp}.csv`
    } else if (format === 'excel') {
      fileContent = generateExcelXML(processedData)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      fileName = `reporte-tooflow-${timestamp}.xlsx`
    } else {
      fileContent = generatePDFHTML(processedData, filters)
      contentType = 'text/html'
      fileName = `reporte-tooflow-${timestamp}.pdf`
    }

    // Codificar en base64 para transferir
    const encoder = new TextEncoder()
    const data = encoder.encode(fileContent)
    const base64Content = btoa(String.fromCharCode(...data))

    return new Response(
      JSON.stringify({
        success: true,
        content: base64Content,
        fileName,
        contentType,
        stats: {
          total: processedData.length,
          completed: processedData.filter(t => t.estado === 'Completada').length,
          inProgress: processedData.filter(t => t.estado === 'En progreso').length,
          pending: processedData.filter(t => t.estado === 'Pendiente').length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in export-report function:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function getStatusLabel(status: string): string {
  const statusMap = {
    'pending': 'Pendiente',
    'in_progress': 'En progreso',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  }
  return statusMap[status] || status
}

function getPriorityLabel(priority: string): string {
  const priorityMap = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'urgent': 'Urgente'
  }
  return priorityMap[priority] || priority
}

function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`
  }
  return `${diffHours}h`
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => 
    Object.values(row).map(value => 
      `"${String(value).replace(/"/g, '""')}"`
    ).join(',')
  ).join('\n')
  
  return `${headers}\n${rows}`
}

function generateExcelXML(data: any[]): string {
  const headers = Object.keys(data[0])
  const headerRow = headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')
  
  const dataRows = data.map(row => {
    const cells = headers.map(header => {
      const value = row[header] || ''
      return `<Cell><Data ss:Type="String">${String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`
    }).join('')
    return `<Row>${cells}</Row>`
  }).join('')

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Reporte TooFlow">
    <Table>
      <Row>${headerRow}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`
}

function generatePDFHTML(data: any[], filters: any): string {
  const now = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const activeFilters = []
  if (filters.dateRange?.start && filters.dateRange?.end) {
    activeFilters.push(`Fechas: ${filters.dateRange.start} - ${filters.dateRange.end}`)
  }
  if (filters.status?.length > 0) {
    activeFilters.push(`Estados: ${filters.status.join(', ')}`)
  }
  if (filters.assignees?.length > 0) {
    activeFilters.push(`${filters.assignees.length} usuarios seleccionados`)
  }
  if (filters.projects?.length > 0) {
    activeFilters.push(`${filters.projects.length} proyectos seleccionados`)
  }

  const tableRows = data.map(row => `
    <tr>
      <td>${row.titulo}</td>
      <td>${row.proyecto}</td>
      <td>${row.asignado_a}</td>
      <td><span class="status ${row.estado.toLowerCase().replace(' ', '-')}">${row.estado}</span></td>
      <td><span class="priority ${row.prioridad.toLowerCase()}">${row.prioridad}</span></td>
      <td>${row.fecha_vencimiento}</td>
      <td>${row.fecha_completada}</td>
      <td>${row.duracion_estimada}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reporte TooFlow</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
    .header { border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #3B82F6; margin: 0; font-size: 28px; }
    .header .date { color: #666; margin-top: 5px; }
    .filters { background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .filters h3 { margin: 0 0 10px 0; color: #374151; }
    .filters ul { margin: 0; padding-left: 20px; }
    .stats { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat { text-align: center; padding: 15px; border-radius: 8px; min-width: 100px; }
    .stat.total { background: #F3F4F6; }
    .stat.completed { background: #D1FAE5; }
    .stat.in-progress { background: #DBEAFE; }
    .stat.pending { background: #FEF3C7; }
    .stat-number { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #E5E7EB; font-size: 12px; }
    th { background-color: #F9FAFB; font-weight: 600; color: #374151; }
    .status, .priority { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; }
    .status.completada { background: #D1FAE5; color: #065F46; }
    .status.en-progreso { background: #DBEAFE; color: #1E40AF; }
    .status.pendiente { background: #FEF3C7; color: #92400E; }
    .status.cancelada { background: #FEE2E2; color: #991B1B; }
    .priority.urgente { background: #FEE2E2; color: #991B1B; }
    .priority.alta { background: #FED7AA; color: #9A3412; }
    .priority.media { background: #FEF3C7; color: #92400E; }
    .priority.baja { background: #D1FAE5; color: #065F46; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reporte de Tareas - TooFlow</h1>
    <div class="date">Generado el ${now}</div>
  </div>

  ${activeFilters.length > 0 ? `
  <div class="filters">
    <h3>Filtros aplicados:</h3>
    <ul>
      ${activeFilters.map(filter => `<li>${filter}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="stats">
    <div class="stat total">
      <div class="stat-number">${data.length}</div>
      <div class="stat-label">Total</div>
    </div>
    <div class="stat completed">
      <div class="stat-number">${data.filter(t => t.estado === 'Completada').length}</div>
      <div class="stat-label">Completadas</div>
    </div>
    <div class="stat in-progress">
      <div class="stat-number">${data.filter(t => t.estado === 'En progreso').length}</div>
      <div class="stat-label">En progreso</div>
    </div>
    <div class="stat pending">
      <div class="stat-number">${data.filter(t => t.estado === 'Pendiente').length}</div>
      <div class="stat-label">Pendientes</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Tarea</th>
        <th>Proyecto</th>
        <th>Asignado a</th>
        <th>Estado</th>
        <th>Prioridad</th>
        <th>Vencimiento</th>
        <th>Completada</th>
        <th>Duración</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="footer">
    <p>Reporte generado por TooFlow - Sistema de gestión de proyectos</p>
  </div>
</body>
</html>`
}