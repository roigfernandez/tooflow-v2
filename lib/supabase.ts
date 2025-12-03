
import { createClient } from '@supabase/supabase-js'

// Usar las variables de entorno reales
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Crear cliente real de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string | null
          priority: string | null
          color: string | null
          start_date: string | null
          end_date: string | null
          owner_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string | null
          priority?: string | null
          color?: string | null
          start_date?: string | null
          end_date?: string | null
          owner_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          color?: string | null
          start_date?: string | null
          end_date?: string | null
          owner_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          project_id: string
          assignee_id: string | null
          creator_id: string | null
          assigned_to: string | null
          created_by: string | null
          due_date: string | null
          completed_at: string | null
          estimated_hours: number | null
          actual_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: string
          priority: string
          project_id: string
          assignee_id?: string | null
          creator_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          project_id?: string
          assignee_id?: string | null
          creator_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: any
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: any
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: any
          read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
