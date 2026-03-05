export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_user_id: string
          created_at: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          expires_at: string
          id?: string
          token: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean
          password_hash: string
          password_salt: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean
          password_hash: string
          password_salt?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          password_salt?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_configurations: {
        Row: {
          api_key: string | null
          api_secret: string | null
          config_data: Json | null
          created_at: string
          error_message: string | null
          features: string[] | null
          id: string
          is_enabled: boolean | null
          last_sync: string | null
          products_count: number | null
          service_name: string
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          config_data?: Json | null
          created_at?: string
          error_message?: string | null
          features?: string[] | null
          id?: string
          is_enabled?: boolean | null
          last_sync?: string | null
          products_count?: number | null
          service_name: string
          service_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          config_data?: Json | null
          created_at?: string
          error_message?: string | null
          features?: string[] | null
          id?: string
          is_enabled?: boolean | null
          last_sync?: string | null
          products_count?: number | null
          service_name?: string
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_steps: {
        Row: {
          channels: Database["public"]["Enums"]["message_channel"][]
          conditions: Json | null
          created_at: string | null
          delay_hours: number | null
          id: string
          is_active: boolean | null
          sequence_id: string
          step_order: number
          template_id: string | null
        }
        Insert: {
          channels?: Database["public"]["Enums"]["message_channel"][]
          conditions?: Json | null
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean | null
          sequence_id: string
          step_order?: number
          template_id?: string | null
        }
        Update: {
          channels?: Database["public"]["Enums"]["message_channel"][]
          conditions?: Json | null
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean | null
          sequence_id?: string
          step_order?: number
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "automation_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_activities: {
        Row: {
          activity_type: string
          client_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
        }
        Insert: {
          activity_type: string
          client_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          activity_type?: string
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_automations: {
        Row: {
          client_id: string
          created_at: string | null
          current_step: number | null
          error_message: string | null
          id: string
          last_action_at: string | null
          next_action_at: string | null
          sequence_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["automation_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          current_step?: number | null
          error_message?: string | null
          id?: string
          last_action_at?: string | null
          next_action_at?: string | null
          sequence_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["automation_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          current_step?: number | null
          error_message?: string | null
          id?: string
          last_action_at?: string | null
          next_action_at?: string | null
          sequence_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["automation_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_automations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_automations_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "automation_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sales_team: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          category: Database["public"]["Enums"]["sales_rep_category"]
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          sales_rep_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          category: Database["public"]["Enums"]["sales_rep_category"]
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          sales_rep_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          category?: Database["public"]["Enums"]["sales_rep_category"]
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sales_rep_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sales_team_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sales_team_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sales_team_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_city: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          assigned_sales_rep_id: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          interests: Json | null
          last_contacted_at: string | null
          last_name: string
          location_region: string | null
          notes: string | null
          phone: string | null
          price_range_max: number | null
          price_range_min: number | null
          source: string | null
          status: string | null
          survey_file_url: string | null
          survey_uploaded: boolean | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          assigned_sales_rep_id?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          interests?: Json | null
          last_contacted_at?: string | null
          last_name: string
          location_region?: string | null
          notes?: string | null
          phone?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          source?: string | null
          status?: string | null
          survey_file_url?: string | null
          survey_uploaded?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          assigned_sales_rep_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          interests?: Json | null
          last_contacted_at?: string | null
          last_name?: string
          location_region?: string | null
          notes?: string | null
          phone?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          source?: string | null
          status?: string | null
          survey_file_url?: string | null
          survey_uploaded?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_sales_rep_id_fkey"
            columns: ["assigned_sales_rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          channel: Database["public"]["Enums"]["message_channel"]
          client_automation_id: string | null
          client_id: string
          created_at: string | null
          delivered_at: string | null
          direction: string | null
          error_message: string | null
          external_id: string | null
          id: string
          message_content: string
          opened_at: string | null
          recipient: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          subject: string | null
          template_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["message_channel"]
          client_automation_id?: string | null
          client_id: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_content: string
          opened_at?: string | null
          recipient: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["message_channel"]
          client_automation_id?: string | null
          client_id?: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_content?: string
          opened_at?: string | null
          recipient?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_client_automation_id_fkey"
            columns: ["client_automation_id"]
            isOneToOne: false
            referencedRelation: "client_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_projects: {
        Row: {
          client_id: string | null
          contract_price: number | null
          contractor_id: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          id: string
          internal_share_token: string
          notes: string | null
          project_name: string
          share_token: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          contract_price?: number | null
          contractor_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          internal_share_token?: string
          notes?: string | null
          project_name: string
          share_token?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          contract_price?: number | null
          contractor_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          internal_share_token?: string
          notes?: string | null
          project_name?: string
          share_token?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_projects_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      consumer_preferences: {
        Row: {
          business_address: Json | null
          consumer_id: string
          created_at: string
          delivery_address: Json | null
          id: string
          preferred_payment_methods: Json | null
          updated_at: string
        }
        Insert: {
          business_address?: Json | null
          consumer_id: string
          created_at?: string
          delivery_address?: Json | null
          id?: string
          preferred_payment_methods?: Json | null
          updated_at?: string
        }
        Update: {
          business_address?: Json | null
          consumer_id?: string
          created_at?: string
          delivery_address?: Json | null
          id?: string
          preferred_payment_methods?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumer_preferences_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_agreements: {
        Row: {
          agreement_version: string | null
          contractor_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          signature_data: string | null
          signed_at: string | null
          signed_name: string
          signed_title: string | null
        }
        Insert: {
          agreement_version?: string | null
          contractor_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          signature_data?: string | null
          signed_at?: string | null
          signed_name: string
          signed_title?: string | null
        }
        Update: {
          agreement_version?: string | null
          contractor_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          signature_data?: string | null
          signed_at?: string | null
          signed_name?: string
          signed_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_agreements_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_licenses: {
        Row: {
          contractor_id: string
          created_at: string | null
          document_url: string | null
          expiration_date: string | null
          id: string
          is_verified: boolean | null
          issuing_authority: string | null
          license_number: string | null
          license_type: string
          updated_at: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          document_url?: string | null
          expiration_date?: string | null
          id?: string
          is_verified?: boolean | null
          issuing_authority?: string | null
          license_number?: string | null
          license_type: string
          updated_at?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          document_url?: string | null
          expiration_date?: string | null
          id?: string
          is_verified?: boolean | null
          issuing_authority?: string | null
          license_number?: string | null
          license_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_licenses_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_services: {
        Row: {
          contractor_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          labor_price: number | null
          notes: string | null
          price_unit: string | null
          service_category: string
          service_name: string
          updated_at: string | null
          with_materials_price: number | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          labor_price?: number | null
          notes?: string | null
          price_unit?: string | null
          service_category: string
          service_name: string
          updated_at?: string | null
          with_materials_price?: number | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          labor_price?: number | null
          notes?: string | null
          price_unit?: string | null
          service_category?: string
          service_name?: string
          updated_at?: string | null
          with_materials_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_services_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          address_city: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          agreement_signed: boolean | null
          agreement_signed_at: string | null
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["contractor_status"] | null
          subscription_active: boolean | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          agreement_signed?: boolean | null
          agreement_signed_at?: string | null
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["contractor_status"] | null
          subscription_active?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          agreement_signed?: boolean | null
          agreement_signed_at?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["contractor_status"] | null
          subscription_active?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      conversion_funnels: {
        Row: {
          average_session_duration: string | null
          bounce_rate: number | null
          campaign_id: string | null
          conversion_rate: number | null
          created_at: string
          description: string | null
          funnel_name: string
          funnel_steps: Json
          id: string
          is_active: boolean | null
          revenue_generated: number | null
          total_conversions: number | null
          total_visitors: number | null
          updated_at: string
        }
        Insert: {
          average_session_duration?: string | null
          bounce_rate?: number | null
          campaign_id?: string | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          funnel_name: string
          funnel_steps?: Json
          id?: string
          is_active?: boolean | null
          revenue_generated?: number | null
          total_conversions?: number | null
          total_visitors?: number | null
          updated_at?: string
        }
        Update: {
          average_session_duration?: string | null
          bounce_rate?: number | null
          campaign_id?: string | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          funnel_name?: string
          funnel_steps?: Json
          id?: string
          is_active?: boolean | null
          revenue_generated?: number | null
          total_conversions?: number | null
          total_visitors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_cache: {
        Row: {
          address: string | null
          created_at: string
          email: string
          first_quote_date: string | null
          id: string
          last_pool_model: string | null
          last_quote_date: string | null
          name: string
          notes: string | null
          phone: string | null
          total_quote_value: number | null
          total_quotes: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          first_quote_date?: string | null
          id?: string
          last_pool_model?: string | null
          last_quote_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          total_quote_value?: number | null
          total_quotes?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          first_quote_date?: string | null
          id?: string
          last_pool_model?: string | null
          last_quote_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_quote_value?: number | null
          total_quotes?: number
          updated_at?: string
        }
        Relationships: []
      }
      florida_locations: {
        Row: {
          city: string
          county: string
          created_at: string
          id: string
          region: string
          zip_codes: string[] | null
        }
        Insert: {
          city: string
          county: string
          created_at?: string
          id?: string
          region: string
          zip_codes?: string[] | null
        }
        Update: {
          city?: string
          county?: string
          created_at?: string
          id?: string
          region?: string
          zip_codes?: string[] | null
        }
        Relationships: []
      }
      installer_licenses: {
        Row: {
          created_at: string
          expiration_date: string | null
          id: string
          installer_id: string
          is_verified: boolean | null
          issuing_authority: string | null
          license_number: string | null
          license_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expiration_date?: string | null
          id?: string
          installer_id: string
          is_verified?: boolean | null
          issuing_authority?: string | null
          license_number?: string | null
          license_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expiration_date?: string | null
          id?: string
          installer_id?: string
          is_verified?: boolean | null
          issuing_authority?: string | null
          license_number?: string | null
          license_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      installer_service_areas: {
        Row: {
          additional_fee: number | null
          created_at: string
          id: string
          installer_id: string
          location_id: string
          travel_radius: number | null
        }
        Insert: {
          additional_fee?: number | null
          created_at?: string
          id?: string
          installer_id: string
          location_id: string
          travel_radius?: number | null
        }
        Update: {
          additional_fee?: number | null
          created_at?: string
          id?: string
          installer_id?: string
          location_id?: string
          travel_radius?: number | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          line_items: Json
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          payment_method: string | null
          payment_status: string
          payment_terms: string | null
          quotation_id: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          line_items?: Json
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string
          payment_terms?: string | null
          quotation_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_address?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          line_items?: Json
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string
          payment_terms?: string | null
          quotation_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "user_quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      item_documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          item_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          item_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          item_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_documents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "phase_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          job_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          job_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          business_id: string | null
          category: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          last_activity: string | null
          location: string | null
          proposal_count: number | null
          status: string
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          business_id?: string | null
          category: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          last_activity?: string | null
          location?: string | null
          proposal_count?: number | null
          status?: string
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          business_id?: string | null
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          last_activity?: string | null
          location?: string | null
          proposal_count?: number | null
          status?: string
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_proposals: {
        Row: {
          created_at: string
          estimated_timeline: string | null
          id: string
          job_id: string | null
          proposal_text: string | null
          proposed_price: number | null
          status: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_timeline?: string | null
          id?: string
          job_id?: string | null
          proposal_text?: string | null
          proposed_price?: number | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_timeline?: string | null
          id?: string
          job_id?: string | null
          proposal_text?: string | null
          proposed_price?: number | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_proposals_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_requirements: {
        Row: {
          created_at: string
          id: string
          is_mandatory: boolean | null
          job_id: string | null
          order_index: number | null
          requirement_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          job_id?: string | null
          order_index?: number | null
          requirement_text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          job_id?: string | null
          order_index?: number | null
          requirement_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_views: {
        Row: {
          id: string
          job_id: string
          session_id: string | null
          viewed_at: string | null
          viewer_id: string | null
          viewer_ip: unknown
        }
        Insert: {
          id?: string
          job_id: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
          viewer_ip?: unknown
        }
        Update: {
          id?: string
          job_id?: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
          viewer_ip?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string | null
          html_content: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          last_message_at: string | null
          participant_1: string
          participant_2: string
          unread_count_1: number | null
          unread_count_2: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          participant_1: string
          participant_2: string
          unread_count_1?: number | null
          unread_count_2?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
          unread_count_1?: number | null
          unread_count_2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commission_amount: number | null
          consumer_id: string | null
          created_at: string
          delivery_address: Json | null
          id: string
          product_id: string | null
          quantity: number
          status: string
          stripe_session_id: string | null
          supplier_amount: number | null
          supplier_id: string | null
          total_amount: number
          tracking_number: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          commission_amount?: number | null
          consumer_id?: string | null
          created_at?: string
          delivery_address?: Json | null
          id?: string
          product_id?: string | null
          quantity?: number
          status?: string
          stripe_session_id?: string | null
          supplier_amount?: number | null
          supplier_id?: string | null
          total_amount: number
          tracking_number?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          commission_amount?: number | null
          consumer_id?: string | null
          created_at?: string
          delivery_address?: Json | null
          id?: string
          product_id?: string | null
          quantity?: number
          status?: string
          stripe_session_id?: string | null
          supplier_amount?: number | null
          supplier_id?: string | null
          total_amount?: number
          tracking_number?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "consolidated_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_analytics: {
        Row: {
          accessibility_score: number | null
          average_session_duration: string | null
          backlinks_count: number | null
          bounce_rate: number | null
          created_at: string
          date_recorded: string
          exit_rate: number | null
          id: string
          keywords_ranking: Json | null
          load_time: number | null
          meta_description: string | null
          mobile_friendly_score: number | null
          page_title: string | null
          page_url: string
          page_views: number | null
          performance_score: number | null
          seo_score: number | null
          social_shares: number | null
          unique_visitors: number | null
        }
        Insert: {
          accessibility_score?: number | null
          average_session_duration?: string | null
          backlinks_count?: number | null
          bounce_rate?: number | null
          created_at?: string
          date_recorded?: string
          exit_rate?: number | null
          id?: string
          keywords_ranking?: Json | null
          load_time?: number | null
          meta_description?: string | null
          mobile_friendly_score?: number | null
          page_title?: string | null
          page_url: string
          page_views?: number | null
          performance_score?: number | null
          seo_score?: number | null
          social_shares?: number | null
          unique_visitors?: number | null
        }
        Update: {
          accessibility_score?: number | null
          average_session_duration?: string | null
          backlinks_count?: number | null
          bounce_rate?: number | null
          created_at?: string
          date_recorded?: string
          exit_rate?: number | null
          id?: string
          keywords_ranking?: Json | null
          load_time?: number | null
          meta_description?: string | null
          mobile_friendly_score?: number | null
          page_title?: string | null
          page_url?: string
          page_views?: number | null
          performance_score?: number | null
          seo_score?: number | null
          social_shares?: number | null
          unique_visitors?: number | null
        }
        Relationships: []
      }
      pavers: {
        Row: {
          base_price: number
          category: string
          collection: string
          colors: Json | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          category?: string
          collection: string
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string
          collection?: string
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          browser: string | null
          connection_type: string | null
          created_at: string
          device_type: string | null
          dom_content_loaded_ms: number | null
          effective_connection_type: string | null
          error_message: string | null
          error_stack: string | null
          error_type: string | null
          first_contentful_paint_ms: number | null
          id: string
          largest_contentful_paint_ms: number | null
          load_time_ms: number | null
          os: string | null
          page_url: string
          session_id: string | null
          time_to_interactive_ms: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          dom_content_loaded_ms?: number | null
          effective_connection_type?: string | null
          error_message?: string | null
          error_stack?: string | null
          error_type?: string | null
          first_contentful_paint_ms?: number | null
          id?: string
          largest_contentful_paint_ms?: number | null
          load_time_ms?: number | null
          os?: string | null
          page_url: string
          session_id?: string | null
          time_to_interactive_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          dom_content_loaded_ms?: number | null
          effective_connection_type?: string | null
          error_message?: string | null
          error_stack?: string | null
          error_type?: string | null
          first_contentful_paint_ms?: number | null
          id?: string
          largest_contentful_paint_ms?: number | null
          load_time_ms?: number | null
          os?: string | null
          page_url?: string
          session_id?: string | null
          time_to_interactive_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      phase_items: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          due_date: string | null
          id: string
          is_completed: boolean
          item_name: string
          item_order: number
          notes: string | null
          phase_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          item_name: string
          item_order?: number
          notes?: string | null
          phase_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          item_name?: string
          item_order?: number
          notes?: string | null
          phase_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_items_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          carbon_fiber: boolean | null
          category: string
          covers: string[] | null
          created_at: string
          depth: string | null
          dimensions: string | null
          features: string[] | null
          finishes: string[] | null
          gala_category: string | null
          gala_points: number | null
          heater: boolean | null
          id: string
          image_url: string | null
          installation_time_weeks: number | null
          is_active: boolean | null
          liners: string[] | null
          model: string
          price: number
          salt_system: boolean | null
          updated_at: string
          warranty_years: string | null
        }
        Insert: {
          carbon_fiber?: boolean | null
          category: string
          covers?: string[] | null
          created_at?: string
          depth?: string | null
          dimensions?: string | null
          features?: string[] | null
          finishes?: string[] | null
          gala_category?: string | null
          gala_points?: number | null
          heater?: boolean | null
          id?: string
          image_url?: string | null
          installation_time_weeks?: number | null
          is_active?: boolean | null
          liners?: string[] | null
          model: string
          price: number
          salt_system?: boolean | null
          updated_at?: string
          warranty_years?: string | null
        }
        Update: {
          carbon_fiber?: boolean | null
          category?: string
          covers?: string[] | null
          created_at?: string
          depth?: string | null
          dimensions?: string | null
          features?: string[] | null
          finishes?: string[] | null
          gala_category?: string | null
          gala_points?: number | null
          heater?: boolean | null
          id?: string
          image_url?: string | null
          installation_time_weeks?: number | null
          is_active?: boolean | null
          liners?: string[] | null
          model?: string
          price?: number
          salt_system?: boolean | null
          updated_at?: string
          warranty_years?: string | null
        }
        Relationships: []
      }
      product_orders: {
        Row: {
          base_price: number
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: Json | null
          extras_data: Json | null
          id: string
          order_notes: string | null
          payment_status: string | null
          product_category: string | null
          product_identifier: string
          product_name: string
          product_type: string | null
          quantity: number
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          base_price?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: Json | null
          extras_data?: Json | null
          id?: string
          order_notes?: string | null
          payment_status?: string | null
          product_category?: string | null
          product_identifier: string
          product_name: string
          product_type?: string | null
          quantity?: number
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: Json | null
          extras_data?: Json | null
          id?: string
          order_notes?: string | null
          payment_status?: string | null
          product_category?: string | null
          product_identifier?: string
          product_name?: string
          product_type?: string | null
          quantity?: number
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_search_tags: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          product_id: string | null
          tag: string
          tag_type: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          tag: string
          tag_type?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          tag?: string
          tag_type?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          benefits: string[] | null
          brand: string | null
          category: string | null
          collection_name: string | null
          created_at: string
          description: string | null
          durability: number | null
          external_id: string | null
          features_json: Json | null
          id: string
          image_url: string | null
          installation_time: string | null
          is_active: boolean | null
          last_synced: string | null
          material: string | null
          motor_type: string | null
          name: string
          pattern: string | null
          price: number
          pricing_options: Json | null
          sku: string | null
          source_api: string | null
          stock_quantity: number | null
          subcategory: string | null
          supplier_id: string | null
          sync_status: string | null
          type_category: string | null
          updated_at: string
          warranty_years_text: string | null
        }
        Insert: {
          benefits?: string[] | null
          brand?: string | null
          category?: string | null
          collection_name?: string | null
          created_at?: string
          description?: string | null
          durability?: number | null
          external_id?: string | null
          features_json?: Json | null
          id?: string
          image_url?: string | null
          installation_time?: string | null
          is_active?: boolean | null
          last_synced?: string | null
          material?: string | null
          motor_type?: string | null
          name: string
          pattern?: string | null
          price: number
          pricing_options?: Json | null
          sku?: string | null
          source_api?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          sync_status?: string | null
          type_category?: string | null
          updated_at?: string
          warranty_years_text?: string | null
        }
        Update: {
          benefits?: string[] | null
          brand?: string | null
          category?: string | null
          collection_name?: string | null
          created_at?: string
          description?: string | null
          durability?: number | null
          external_id?: string | null
          features_json?: Json | null
          id?: string
          image_url?: string | null
          installation_time?: string | null
          is_active?: boolean | null
          last_synced?: string | null
          material?: string | null
          motor_type?: string | null
          name?: string
          pattern?: string | null
          price?: number
          pricing_options?: Json | null
          sku?: string | null
          source_api?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          sync_status?: string | null
          type_category?: string | null
          updated_at?: string
          warranty_years_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          sales_category:
            | Database["public"]["Enums"]["sales_rep_category"]
            | null
          updated_at: string
        }
        Insert: {
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sales_category?:
            | Database["public"]["Enums"]["sales_rep_category"]
            | null
          updated_at?: string
        }
        Update: {
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sales_category?:
            | Database["public"]["Enums"]["sales_rep_category"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      project_cost_items: {
        Row: {
          category: string
          contractor_id: string | null
          created_at: string
          description: string
          id: string
          notes: string | null
          phase_id: string | null
          project_id: string
          quantity: number
          status: string
          total_price: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string
          contractor_id?: string | null
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          phase_id?: string | null
          project_id: string
          quantity?: number
          status?: string
          total_price?: number | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          contractor_id?: string | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          phase_id?: string | null
          project_id?: string
          quantity?: number
          status?: string
          total_price?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_cost_items_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_cost_items_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_cost_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          id: string
          phase_name: string
          phase_order: number
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          phase_name: string
          phase_order?: number
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          phase_name?: string
          phase_order?: number
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          bundle_price: number
          created_at: string | null
          description: string | null
          end_date: string | null
          highlight_text: string | null
          id: string
          image_url: string | null
          included_items: Json | null
          is_active: boolean | null
          name: string
          original_price: number | null
          start_date: string | null
          terms_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          bundle_price: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          highlight_text?: string | null
          id?: string
          image_url?: string | null
          included_items?: Json | null
          is_active?: boolean | null
          name: string
          original_price?: number | null
          start_date?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          bundle_price?: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          highlight_text?: string | null
          id?: string
          image_url?: string | null
          included_items?: Json | null
          is_active?: boolean | null
          name?: string
          original_price?: number | null
          start_date?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proposal_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          proposal_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          proposal_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          proposal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_attachments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "job_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_rate: number | null
          created_at: string
          estimated_budget: number | null
          estimated_commission: number | null
          id: string
          is_sales_team_verified: boolean | null
          lead_company: string | null
          lead_email: string
          lead_name: string
          lead_phone: string | null
          lead_urgency: string | null
          project_description: string | null
          project_type: string
          referrer_email: string
          referrer_name: string
          referrer_phone: string | null
          referrer_type: string | null
          referrer_user_id: string | null
          sales_company_name: string | null
          sales_company_phone: string | null
          sales_company_website: string | null
          sales_license_number: string | null
          sales_team_position: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          estimated_budget?: number | null
          estimated_commission?: number | null
          id?: string
          is_sales_team_verified?: boolean | null
          lead_company?: string | null
          lead_email: string
          lead_name: string
          lead_phone?: string | null
          lead_urgency?: string | null
          project_description?: string | null
          project_type: string
          referrer_email: string
          referrer_name: string
          referrer_phone?: string | null
          referrer_type?: string | null
          referrer_user_id?: string | null
          sales_company_name?: string | null
          sales_company_phone?: string | null
          sales_company_website?: string | null
          sales_license_number?: string | null
          sales_team_position?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          estimated_budget?: number | null
          estimated_commission?: number | null
          id?: string
          is_sales_team_verified?: boolean | null
          lead_company?: string | null
          lead_email?: string
          lead_name?: string
          lead_phone?: string | null
          lead_urgency?: string | null
          project_description?: string | null
          project_type?: string
          referrer_email?: string
          referrer_name?: string
          referrer_phone?: string | null
          referrer_type?: string | null
          referrer_user_id?: string | null
          sales_company_name?: string | null
          sales_company_phone?: string | null
          sales_company_website?: string | null
          sales_license_number?: string | null
          sales_team_position?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales_commissions: {
        Row: {
          category: Database["public"]["Enums"]["sales_rep_category"]
          client_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          deal_description: string | null
          deal_value: number
          id: string
          sales_rep_id: string
          status: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["sales_rep_category"]
          client_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string
          deal_description?: string | null
          deal_value: number
          id?: string
          sales_rep_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["sales_rep_category"]
          client_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          deal_description?: string | null
          deal_value?: number
          id?: string
          sales_rep_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_commissions_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          clicked_position: number | null
          clicked_result_id: string | null
          has_results: boolean | null
          id: string
          ip_address: unknown
          results_count: number | null
          search_query: string
          search_refinements: Json | null
          search_timestamp: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_position?: number | null
          clicked_result_id?: string | null
          has_results?: boolean | null
          id?: string
          ip_address?: unknown
          results_count?: number | null
          search_query: string
          search_refinements?: Json | null
          search_timestamp?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_position?: number | null
          clicked_result_id?: string | null
          has_results?: boolean | null
          id?: string
          ip_address?: unknown
          results_count?: number | null
          search_query?: string
          search_refinements?: Json | null
          search_timestamp?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_campaigns: {
        Row: {
          budget_allocated: number | null
          budget_spent: number | null
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          landing_page_url: string | null
          name: string
          start_date: string | null
          status: string
          target_audience: string | null
          target_keywords: Json | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          budget_allocated?: number | null
          budget_spent?: number | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          landing_page_url?: string | null
          name: string
          start_date?: string | null
          status?: string
          target_audience?: string | null
          target_keywords?: Json | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          budget_allocated?: number | null
          budget_spent?: number | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          landing_page_url?: string | null
          name?: string
          start_date?: string | null
          status?: string
          target_audience?: string | null
          target_keywords?: Json | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          campaign_id: string | null
          competition_level: string | null
          content_url: string | null
          created_at: string
          current_ranking: number | null
          difficulty_score: number | null
          id: string
          is_active: boolean | null
          keyword: string
          related_keywords: Json | null
          search_intent: string | null
          search_volume: number | null
          target_ranking: number | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          competition_level?: string | null
          content_url?: string | null
          created_at?: string
          current_ranking?: number | null
          difficulty_score?: number | null
          id?: string
          is_active?: boolean | null
          keyword: string
          related_keywords?: Json | null
          search_intent?: string | null
          search_volume?: number | null
          target_ranking?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          competition_level?: string | null
          content_url?: string | null
          created_at?: string
          current_ranking?: number | null
          difficulty_score?: number | null
          id?: string
          is_active?: boolean | null
          keyword?: string
          related_keywords?: Json | null
          search_intent?: string | null
          search_volume?: number | null
          target_ranking?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      service_offerings: {
        Row: {
          base_price: number | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplier_banking_config: {
        Row: {
          bank_account_details: Json | null
          commission_rate: number | null
          created_at: string
          id: string
          is_verified: boolean | null
          stripe_account_id: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          bank_account_details?: Json | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          stripe_account_id?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          bank_account_details?: Json | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          stripe_account_id?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_banking_config_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string | null
          scopes: string[]
          token_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string | null
          scopes?: string[]
          token_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string | null
          scopes?: string[]
          token_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pipelines: {
        Row: {
          browser: string | null
          city: string | null
          conversion_value: number | null
          converted_at: string | null
          country: string | null
          created_at: string
          current_page: string | null
          device_type: string | null
          id: string
          ip_address: unknown
          is_converted: boolean | null
          landing_page: string | null
          pipeline_stage: string
          referrer_url: string | null
          session_id: string
          source_channel: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          country?: string | null
          created_at?: string
          current_page?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown
          is_converted?: boolean | null
          landing_page?: string | null
          pipeline_stage?: string
          referrer_url?: string | null
          session_id: string
          source_channel?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          country?: string | null
          created_at?: string
          current_page?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown
          is_converted?: boolean | null
          landing_page?: string | null
          pipeline_stage?: string
          referrer_url?: string | null
          session_id?: string
          source_channel?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          cart_data: Json | null
          created_at: string
          delivery_preferences: Json | null
          id: string
          notification_preferences: Json | null
          preferred_payment_method: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cart_data?: Json | null
          created_at?: string
          delivery_preferences?: Json | null
          id?: string
          notification_preferences?: Json | null
          preferred_payment_method?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cart_data?: Json | null
          created_at?: string
          delivery_preferences?: Json | null
          id?: string
          notification_preferences?: Json | null
          preferred_payment_method?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_quotations: {
        Row: {
          access_width: string | null
          address: string
          budget: string | null
          created_at: string
          email: string
          gala_user_id: string | null
          id: string
          name: string
          phone: string | null
          pool_category: string | null
          pool_model: string | null
          pool_price: number | null
          processed_image_url: string | null
          recommendations: string[] | null
          selected_options: Json | null
          soil_type: string | null
          special_requests: string | null
          status: string | null
          timeline: string | null
          total_quote_amount: number | null
          updated_at: string
          uploaded_image_url: string | null
          user_id: string | null
          utility_lines: string | null
          yard_size: string | null
        }
        Insert: {
          access_width?: string | null
          address: string
          budget?: string | null
          created_at?: string
          email: string
          gala_user_id?: string | null
          id?: string
          name: string
          phone?: string | null
          pool_category?: string | null
          pool_model?: string | null
          pool_price?: number | null
          processed_image_url?: string | null
          recommendations?: string[] | null
          selected_options?: Json | null
          soil_type?: string | null
          special_requests?: string | null
          status?: string | null
          timeline?: string | null
          total_quote_amount?: number | null
          updated_at?: string
          uploaded_image_url?: string | null
          user_id?: string | null
          utility_lines?: string | null
          yard_size?: string | null
        }
        Update: {
          access_width?: string | null
          address?: string
          budget?: string | null
          created_at?: string
          email?: string
          gala_user_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          pool_category?: string | null
          pool_model?: string | null
          pool_price?: number | null
          processed_image_url?: string | null
          recommendations?: string[] | null
          selected_options?: Json | null
          soil_type?: string | null
          special_requests?: string | null
          status?: string | null
          timeline?: string | null
          total_quote_amount?: number | null
          updated_at?: string
          uploaded_image_url?: string | null
          user_id?: string | null
          utility_lines?: string | null
          yard_size?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      consolidated_products: {
        Row: {
          benefits: string[] | null
          brand: string | null
          category: string | null
          collection_name: string | null
          created_at: string | null
          description: string | null
          durability: number | null
          features_json: Json | null
          id: string | null
          image_url: string | null
          installation_time: string | null
          is_active: boolean | null
          material: string | null
          motor_type: string | null
          name: string | null
          pattern: string | null
          price: number | null
          pricing_options: Json | null
          sku: string | null
          stock_quantity: number | null
          subcategory: string | null
          type_category: string | null
          updated_at: string | null
          warranty_years_text: string | null
        }
        Insert: {
          benefits?: string[] | null
          brand?: string | null
          category?: string | null
          collection_name?: string | null
          created_at?: string | null
          description?: string | null
          durability?: number | null
          features_json?: Json | null
          id?: string | null
          image_url?: string | null
          installation_time?: string | null
          is_active?: boolean | null
          material?: string | null
          motor_type?: string | null
          name?: string | null
          pattern?: string | null
          price?: number | null
          pricing_options?: Json | null
          sku?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          type_category?: string | null
          updated_at?: string | null
          warranty_years_text?: string | null
        }
        Update: {
          benefits?: string[] | null
          brand?: string | null
          category?: string | null
          collection_name?: string | null
          created_at?: string | null
          description?: string | null
          durability?: number | null
          features_json?: Json | null
          id?: string | null
          image_url?: string | null
          installation_time?: string | null
          is_active?: boolean | null
          material?: string | null
          motor_type?: string | null
          name?: string | null
          pattern?: string | null
          price?: number | null
          pricing_options?: Json | null
          sku?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          type_category?: string | null
          updated_at?: string | null
          warranty_years_text?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_login: {
        Args: { email_param: string; password_param: string }
        Returns: {
          admin_email: string
          admin_id: string
          admin_role: string
          session_token: string
          success: boolean
        }[]
      }
      cleanup_expired_sessions: { Args: never; Returns: number }
      generate_invoice_number: { Args: never; Returns: string }
      get_installer_profile_safe: {
        Args: { installer_uuid: string }
        Returns: Json
      }
      get_public_supplier_info: {
        Args: never
        Returns: {
          company_logo_url: string
          company_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_consumer: { Args: never; Returns: boolean }
      is_current_admin: { Args: never; Returns: boolean }
      is_main_admin: { Args: never; Returns: boolean }
      is_supplier: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_admin_user_id: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: string
      }
      mask_sensitive_data: { Args: { data: string }; Returns: string }
      promote_user_to_main_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      validate_admin_session: {
        Args: { token: string }
        Returns: {
          admin_email: string
          admin_id: string
          admin_role: string
          is_valid: boolean
        }[]
      }
      verify_admin_password: {
        Args: { input_email: string; input_password: string }
        Returns: {
          admin_data: Json
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      automation_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "paused"
        | "failed"
      contractor_status: "pending" | "approved" | "suspended" | "rejected"
      message_channel: "email" | "sms" | "whatsapp" | "voice"
      message_status:
        | "pending"
        | "sent"
        | "delivered"
        | "failed"
        | "opened"
        | "clicked"
      sales_rep_category:
        | "bdr"
        | "ae"
        | "csm"
        | "regional_sales"
        | "head_of_sales"
      user_role: "main_admin" | "supplier" | "consumer" | "sales_rep"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      automation_status: [
        "pending",
        "in_progress",
        "completed",
        "paused",
        "failed",
      ],
      contractor_status: ["pending", "approved", "suspended", "rejected"],
      message_channel: ["email", "sms", "whatsapp", "voice"],
      message_status: [
        "pending",
        "sent",
        "delivered",
        "failed",
        "opened",
        "clicked",
      ],
      sales_rep_category: [
        "bdr",
        "ae",
        "csm",
        "regional_sales",
        "head_of_sales",
      ],
      user_role: ["main_admin", "supplier", "consumer", "sales_rep"],
    },
  },
} as const
