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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          updated_at?: string
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
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_consumer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_main_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_supplier: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
      user_role: "main_admin" | "supplier" | "consumer"
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
      user_role: ["main_admin", "supplier", "consumer"],
    },
  },
} as const
