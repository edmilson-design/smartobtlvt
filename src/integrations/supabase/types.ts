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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          airline: string | null
          approved_at: string | null
          approved_by: string | null
          arrival_time: string | null
          booking_type: Database["public"]["Enums"]["booking_type"]
          cabin_class: string | null
          car_category: string | null
          car_company: string | null
          check_in_time: string | null
          check_out_time: string | null
          confirmation_code: string | null
          created_at: string
          currency: string | null
          departure_time: string | null
          destination: string
          dropoff_location: string | null
          end_date: string | null
          flight_number: string | null
          hotel_name: string | null
          id: string
          notes: string | null
          origin: string | null
          passenger_cpf: string | null
          passenger_email: string | null
          passenger_first_name: string | null
          passenger_last_name: string | null
          passenger_phone: string | null
          pickup_location: string | null
          rejection_reason: string | null
          requires_approval: boolean | null
          room_type: string | null
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          airline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          arrival_time?: string | null
          booking_type: Database["public"]["Enums"]["booking_type"]
          cabin_class?: string | null
          car_category?: string | null
          car_company?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          confirmation_code?: string | null
          created_at?: string
          currency?: string | null
          departure_time?: string | null
          destination: string
          dropoff_location?: string | null
          end_date?: string | null
          flight_number?: string | null
          hotel_name?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          passenger_cpf?: string | null
          passenger_email?: string | null
          passenger_first_name?: string | null
          passenger_last_name?: string | null
          passenger_phone?: string | null
          pickup_location?: string | null
          rejection_reason?: string | null
          requires_approval?: boolean | null
          room_type?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cost: number
          updated_at?: string
          user_id: string
        }
        Update: {
          airline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          arrival_time?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          cabin_class?: string | null
          car_category?: string | null
          car_company?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          confirmation_code?: string | null
          created_at?: string
          currency?: string | null
          departure_time?: string | null
          destination?: string
          dropoff_location?: string | null
          end_date?: string | null
          flight_number?: string | null
          hotel_name?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          passenger_cpf?: string | null
          passenger_email?: string | null
          passenger_first_name?: string | null
          passenger_last_name?: string | null
          passenger_phone?: string | null
          pickup_location?: string | null
          rejection_reason?: string | null
          requires_approval?: boolean | null
          room_type?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_limit: number | null
          company_name: string | null
          cost_center: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          manager_id: string | null
          updated_at: string
        }
        Insert: {
          approval_limit?: number | null
          company_name?: string | null
          cost_center?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id: string
          manager_id?: string | null
          updated_at?: string
        }
        Update: {
          approval_limit?: number | null
          company_name?: string | null
          cost_center?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          manager_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_manager_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "employee" | "manager" | "admin"
      booking_status:
        | "pending"
        | "approved"
        | "rejected"
        | "confirmed"
        | "cancelled"
      booking_type: "flight" | "hotel" | "car_rental"
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
      app_role: ["employee", "manager", "admin"],
      booking_status: [
        "pending",
        "approved",
        "rejected",
        "confirmed",
        "cancelled",
      ],
      booking_type: ["flight", "hotel", "car_rental"],
    },
  },
} as const
