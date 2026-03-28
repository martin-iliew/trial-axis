export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    PostgrestVersion: "12"
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'sponsor' | 'clinic_admin'
          first_name: string
          last_name: string
          created_at: string
        }
        Insert: {
          id: string
          role: 'sponsor' | 'clinic_admin'
          first_name: string
          last_name: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      clinics: {
        Row: {
          id: string
          owner_id: string
          name: string
          city: string
          address: string
          description: string | null
          contact_email: string
          phone: string | null
          website: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          city: string
          address: string
          description?: string | null
          contact_email: string
          phone?: string | null
          website?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['clinics']['Insert']>
        Relationships: []
      }
      equipment: {
        Row: {
          id: string
          clinic_id: string
          type: string
          name: string
          quantity: number
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          type: string
          name: string
          quantity: number
          available: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>
        Relationships: []
      }
      certifications: {
        Row: {
          id: string
          clinic_id: string
          name: string
          issued_by: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          issued_by?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['certifications']['Insert']>
        Relationships: []
      }
      clinic_availability: {
        Row: {
          id: string
          clinic_id: string
          start_date: string
          end_date: string
          capacity: number
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          start_date: string
          end_date: string
          capacity: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['clinic_availability']['Insert']>
        Relationships: []
      }
      clinic_specializations: {
        Row: {
          clinic_id: string
          therapeutic_area_id: string
        }
        Insert: {
          clinic_id: string
          therapeutic_area_id: string
        }
        Update: Partial<Database['public']['Tables']['clinic_specializations']['Row']>
        Relationships: []
      }
      therapeutic_areas: {
        Row: {
          id: string
          name: string
        }
        Insert: { id?: string; name: string }
        Update: Partial<Database['public']['Tables']['therapeutic_areas']['Insert']>
        Relationships: []
      }
      trial_projects: {
        Row: {
          id: string
          sponsor_id: string
          title: string
          description: string | null
          therapeutic_area_id: string | null
          phase: string | null
          patient_count: number | null
          start_date: string | null
          end_date: string | null
          geographic_preference: string | null
          status: 'draft' | 'searching' | 'matched' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          sponsor_id: string
          title: string
          description?: string | null
          therapeutic_area_id?: string | null
          phase?: string | null
          patient_count?: number | null
          start_date?: string | null
          end_date?: string | null
          geographic_preference?: string | null
          status: 'draft' | 'searching' | 'matched' | 'closed'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['trial_projects']['Insert']>
        Relationships: []
      }
      trial_requirements: {
        Row: {
          id: string
          trial_project_id: string
          type: string
          value: string
          priority: 'Required' | 'Preferred'
          created_at: string
        }
        Insert: {
          id?: string
          trial_project_id: string
          type: string
          value: string
          priority: 'Required' | 'Preferred'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['trial_requirements']['Insert']>
        Relationships: []
      }
      match_results: {
        Row: {
          id: string
          trial_project_id: string
          clinic_id: string
          score: number
          breakdown: Json
          status: 'pending' | 'inquiry_sent' | 'accepted' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          trial_project_id: string
          clinic_id: string
          score: number
          breakdown: Json
          status: 'pending' | 'inquiry_sent' | 'accepted' | 'declined'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['match_results']['Insert']>
        Relationships: []
      }
      partnership_inquiries: {
        Row: {
          id: string
          match_result_id: string
          sponsor_id: string
          clinic_id: string
          message: string
          notes: string | null
          status: 'pending' | 'accepted' | 'declined'
          response_message: string | null
          decline_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_result_id: string
          sponsor_id: string
          clinic_id: string
          message: string
          notes?: string | null
          status: 'pending' | 'accepted' | 'declined'
          response_message?: string | null
          decline_reason?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['partnership_inquiries']['Insert']>
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['contact_inquiries']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
