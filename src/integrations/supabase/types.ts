export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
      products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          last_synced: string | null
          name: string
          price: number
          sku: string | null
          source_api: string | null
          stock_quantity: number | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_synced?: string | null
          name: string
          price: number
          sku?: string | null
          source_api?: string | null
          stock_quantity?: number | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_synced?: string | null
          name?: string
          price?: number
          sku?: string | null
          source_api?: string | null
          stock_quantity?: number | null
          sync_status?: string | null
          updated_at?: string
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
          utility_lines?: string | null
          yard_size?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
