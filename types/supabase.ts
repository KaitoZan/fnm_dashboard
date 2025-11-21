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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: number
          res_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          res_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          res_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_res_id_fkey"
            columns: ["res_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          comment_id: number | null
          created_at: string
          id: number
          reason: string
          reporter_id: string | null
          res_id: string | null
          status: string
        }
        Insert: {
          comment_id?: number | null
          created_at?: string
          id?: number
          reason: string
          reporter_id?: string | null
          res_id?: string | null
          status?: string
        }
        Update: {
          comment_id?: number | null
          created_at?: string
          id?: number
          reason?: string
          reporter_id?: string | null
          res_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_res_id_fkey"
            columns: ["res_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_restaurants: {
        Row: {
          created_at: string
          res_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          res_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          res_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_restaurants_res_id_fkey"
            columns: ["res_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_restaurants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          id: number
          name: string | null
          price: number | null
          res_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          price?: number | null
          res_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          price?: number | null
          res_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_res_id_fkey"
            columns: ["res_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_edits: {
        Row: {
          created_at: string
          edit_type: string
          id: number
          proposed_data: Json
          rejection_reason: string | null
          res_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          edit_type: string
          id?: number
          proposed_data: Json
          rejection_reason?: string | null
          res_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          edit_type?: string
          id?: number
          proposed_data?: Json
          rejection_reason?: string | null
          res_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_edits_res_id_fkey"
            columns: ["res_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_edits_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_edits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          created_at: string
          description: string
          detail: string | null
          food_type: string | null
          gallery_imgs_urls: string[] | null
          has_delivery: boolean
          has_dine_in: boolean
          id: string
          is_open: boolean
          latitude: number
          location: string | null
          longitude: number
          opening_hours: Json | null
          owner_id: string | null
          phone_no: string | null
          promo_imgs_urls: string[] | null
          rating: number
          res_img: string
          res_name: string
          status: string
        }
        Insert: {
          created_at?: string
          description: string
          detail?: string | null
          food_type?: string | null
          gallery_imgs_urls?: string[] | null
          has_delivery?: boolean
          has_dine_in?: boolean
          id?: string
          is_open?: boolean
          latitude: number
          location?: string | null
          longitude: number
          opening_hours?: Json | null
          owner_id?: string | null
          phone_no?: string | null
          promo_imgs_urls?: string[] | null
          rating?: number
          res_img: string
          res_name: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string
          detail?: string | null
          food_type?: string | null
          gallery_imgs_urls?: string[] | null
          has_delivery?: boolean
          has_dine_in?: boolean
          id?: string
          is_open?: boolean
          latitude?: number
          location?: string | null
          longitude?: number
          opening_hours?: Json | null
          owner_id?: string | null
          phone_no?: string | null
          promo_imgs_urls?: string[] | null
          rating?: number
          res_img?: string
          res_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          location: string | null
          phone_no: string | null
          role: string | null
          user_name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          location?: string | null
          phone_no?: string | null
          role?: string | null
          user_name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          location?: string | null
          phone_no?: string | null
          role?: string | null
          user_name?: string
        }
        Relationships: []
      }
      user_ratings_res: {
        Row: {
          created_at: string
          id: number
          rating: number
          res_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          rating: number
          res_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          rating?: number
          res_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_res_id_fkey"
            columns: ["res_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_restaurant_request: {
        Args: { p_admin_user_id: string; p_request_edit_id: number }
        Returns: undefined
      }
      reject_restaurant_request: {
        Args: {
          p_admin_user_id: string
          p_rejection_reason: string
          p_request_edit_id: number
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
