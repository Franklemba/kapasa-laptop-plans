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
      audit_log: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          credit_score: number | null
          date_of_birth: string | null
          email: string
          employer: string | null
          employment_status: string | null
          first_name: string
          id: string
          job_title: string | null
          last_name: string
          monthly_income: number | null
          national_id: string | null
          notes: string | null
          phone: string | null
          province: string | null
          role: string
          status: string
          street_address: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          credit_score?: number | null
          date_of_birth?: string | null
          email: string
          employer?: string | null
          employment_status?: string | null
          first_name: string
          id?: string
          job_title?: string | null
          last_name: string
          monthly_income?: number | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          province?: string | null
          role?: string
          status?: string
          street_address?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          credit_score?: number | null
          date_of_birth?: string | null
          email?: string
          employer?: string | null
          employment_status?: string | null
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string
          monthly_income?: number | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          province?: string | null
          role?: string
          status?: string
          street_address?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      laptop_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          laptop_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          laptop_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          laptop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laptop_images_laptop_id_fkey"
            columns: ["laptop_id"]
            isOneToOne: false
            referencedRelation: "laptops"
            referencedColumns: ["id"]
          },
        ]
      }
      laptops: {
        Row: {
          brand: string
          condition: string
          created_at: string
          created_by: string | null
          default_weekly_payment: number
          description: string | null
          display: string
          graphics: string | null
          id: string
          image_url: string | null
          min_stock_level: number
          model: string
          name: string
          original_price: number | null
          price: number
          processor: string
          ram: string
          rating: number | null
          review_count: number | null
          sku: string | null
          specifications: Json | null
          status: string
          stock_quantity: number
          storage: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          brand: string
          condition?: string
          created_at?: string
          created_by?: string | null
          default_weekly_payment: number
          description?: string | null
          display: string
          graphics?: string | null
          id?: string
          image_url?: string | null
          min_stock_level?: number
          model: string
          name: string
          original_price?: number | null
          price: number
          processor: string
          ram: string
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          status?: string
          stock_quantity?: number
          storage: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          brand?: string
          condition?: string
          created_at?: string
          created_by?: string | null
          default_weekly_payment?: number
          description?: string | null
          display?: string
          graphics?: string | null
          id?: string
          image_url?: string | null
          min_stock_level?: number
          model?: string
          name?: string
          original_price?: number | null
          price?: number
          processor?: string
          ram?: string
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          status?: string
          stock_quantity?: number
          storage?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          client_id: string
          id: string
          payment_confirmations: boolean
          payment_reminders: boolean
          plan_updates: boolean
          reminder_days_before: number
          sms_enabled: boolean
          system_updates: boolean
          updated_at: string
        }
        Insert: {
          client_id: string
          id?: string
          payment_confirmations?: boolean
          payment_reminders?: boolean
          plan_updates?: boolean
          reminder_days_before?: number
          sms_enabled?: boolean
          system_updates?: boolean
          updated_at?: string
        }
        Update: {
          client_id?: string
          id?: string
          payment_confirmations?: boolean
          payment_reminders?: boolean
          plan_updates?: boolean
          reminder_days_before?: number
          sms_enabled?: boolean
          system_updates?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string | null
          client_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
        }
        Insert: {
          category?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
        }
        Update: {
          category?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          amount_paid: number
          approved_at: string | null
          approved_by: string | null
          client_id: string
          created_at: string
          down_payment: number
          end_date: string | null
          id: string
          laptop_id: string
          plan_duration: number
          rejected_at: string | null
          rejected_by: string | null
          start_date: string
          status: string
          total_amount: number
          updated_at: string
          weekly_payment: number
        }
        Insert: {
          amount_paid?: number
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string
          down_payment?: number
          end_date?: string | null
          id?: string
          laptop_id: string
          plan_duration: number
          rejected_at?: string | null
          rejected_by?: string | null
          start_date: string
          status?: string
          total_amount: number
          updated_at?: string
          weekly_payment: number
        }
        Update: {
          amount_paid?: number
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string
          down_payment?: number
          end_date?: string | null
          id?: string
          laptop_id?: string
          plan_duration?: number
          rejected_at?: string | null
          rejected_by?: string | null
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
          weekly_payment?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_laptop_id_fkey"
            columns: ["laptop_id"]
            isOneToOne: false
            referencedRelation: "laptops"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedule: {
        Row: {
          amount_due: number
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          payment_id: string | null
          payment_plan_id: string
          status: string
          week_number: number
        }
        Insert: {
          amount_due: number
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_plan_id: string
          status?: string
          week_number: number
        }
        Update: {
          amount_due?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_plan_id?: string
          status?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedule_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedule_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_plan_id: string
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_plan_id: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_plan_id?: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          laptop_id: string | null
          movement_type: string
          new_quantity: number
          notes: string | null
          payment_plan_id: string | null
          previous_quantity: number
          quantity: number
          reason: string | null
          reference_number: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          laptop_id?: string | null
          movement_type: string
          new_quantity: number
          notes?: string | null
          payment_plan_id?: string | null
          previous_quantity: number
          quantity: number
          reason?: string | null
          reference_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          laptop_id?: string | null
          movement_type?: string
          new_quantity?: number
          notes?: string | null
          payment_plan_id?: string | null
          previous_quantity?: number
          quantity?: number
          reason?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_laptop_id_fkey"
            columns: ["laptop_id"]
            isOneToOne: false
            referencedRelation: "laptops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_payment_atomic: {
        Args: {
          p_payment_plan_id: string
          p_amount: number
          p_payment_date?: string
          p_payment_method?: string
          p_reference_number?: string
          p_notes?: string
        }
        Returns: Json
      }
      update_laptop_stock: {
        Args: {
          p_laptop_id: string
          p_movement_type: string
          p_quantity: number
          p_reason?: string
          p_reference_number?: string
          p_notes?: string
        }
        Returns: undefined
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
