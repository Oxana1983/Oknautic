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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assistance_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          is_resolved: boolean
          message: string
          name: string
          topic_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_resolved?: boolean
          message: string
          name: string
          topic_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_resolved?: boolean
          message?: string
          name?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistance_requests_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "assistance_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      assistance_topics: {
        Row: {
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          additional_comment: string | null
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          variant_id: string | null
        }
        Insert: {
          additional_comment?: string | null
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          variant_id?: string | null
        }
        Update: {
          additional_comment?: string | null
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          show_in_menu: boolean
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          show_in_menu?: boolean
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          show_in_menu?: boolean
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_message_at: string | null
          quote_request_id: string
          seller_id: string
          unread_customer: number
          unread_seller: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_message_at?: string | null
          quote_request_id: string
          seller_id: string
          unread_customer?: number
          unread_seller?: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_message_at?: string | null
          quote_request_id?: string
          seller_id?: string
          unread_customer?: number
          unread_seller?: number
        }
        Relationships: [
          {
            foreignKeyName: "chats_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_slides: {
        Row: {
          button_text: string
          id: string
          image_url: string | null
          is_active: boolean
          link_page: string | null
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          button_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_page?: string | null
          sort_order?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          button_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_page?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      import_sources: {
        Row: {
          brand_id: string | null
          connection_config: Json
          created_at: string
          field_mapping: Json
          id: string
          is_active: boolean
          last_sync_at: string | null
          last_sync_count: number | null
          last_sync_status: string | null
          name: string
          source_type: string
        }
        Insert: {
          brand_id?: string | null
          connection_config?: Json
          created_at?: string
          field_mapping?: Json
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_count?: number | null
          last_sync_status?: string | null
          name: string
          source_type: string
        }
        Update: {
          brand_id?: string | null
          connection_config?: Json
          created_at?: string
          field_mapping?: Json
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_count?: number | null
          last_sync_status?: string | null
          name?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_sources_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          allows_pickup: boolean
          available_quantity: number
          comment: string | null
          created_at: string
          currency: string
          delivery_datetime: string
          id: string
          in_stock: boolean
          includes_vat: boolean
          is_new: boolean
          is_read_by_customer: boolean
          payment_cash: boolean
          payment_cashless: boolean
          price_per_unit: number
          quote_request_id: string
          seller_id: string
          status: string
          updated_at: string
          warranty_months: number
        }
        Insert: {
          allows_pickup?: boolean
          available_quantity: number
          comment?: string | null
          created_at?: string
          currency?: string
          delivery_datetime: string
          id?: string
          in_stock?: boolean
          includes_vat?: boolean
          is_new?: boolean
          is_read_by_customer?: boolean
          payment_cash?: boolean
          payment_cashless?: boolean
          price_per_unit: number
          quote_request_id: string
          seller_id: string
          status?: string
          updated_at?: string
          warranty_months?: number
        }
        Update: {
          allows_pickup?: boolean
          available_quantity?: number
          comment?: string | null
          created_at?: string
          currency?: string
          delivery_datetime?: string
          id?: string
          in_stock?: boolean
          includes_vat?: boolean
          is_new?: boolean
          is_read_by_customer?: boolean
          payment_cash?: boolean
          payment_cashless?: boolean
          price_per_unit?: number
          quote_request_id?: string
          seller_id?: string
          status?: string
          updated_at?: string
          warranty_months?: number
        }
        Relationships: [
          {
            foreignKeyName: "offers_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          external_link: string | null
          id: string
          meta_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          external_link?: string | null
          id?: string
          meta_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          external_link?: string | null
          id?: string
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_variant_types: {
        Row: {
          id: string
          name: string
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          product_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_types_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          created_at: string
          id: string
          is_active: boolean
          photos: string[]
          product_id: string
          sku: string
        }
        Insert: {
          attributes?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          photos?: string[]
          product_id: string
          sku: string
        }
        Update: {
          attributes?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          photos?: string[]
          product_id?: string
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_price: number | null
          brand_id: string | null
          category_id: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          photos: string[]
          sku: string
          updated_at: string
        }
        Insert: {
          avg_price?: number | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          photos?: string[]
          sku: string
          updated_at?: string
        }
        Update: {
          avg_price?: number | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          photos?: string[]
          sku?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email_notifications_offers: boolean
          email_notifications_quotes: boolean
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_notifications_offers?: boolean
          email_notifications_quotes?: boolean
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_notifications_offers?: boolean
          email_notifications_quotes?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          accepted_offer_id: string | null
          additional_comment: string | null
          brand_id: string | null
          category_id: string | null
          created_at: string
          customer_id: string
          delivery_datetime: string
          delivery_location: string
          id: string
          product_id: string | null
          product_name: string
          product_photo: string | null
          quantity: number
          sku: string
          status: string
          updated_at: string
          variant_attrs: Json | null
          variant_id: string | null
        }
        Insert: {
          accepted_offer_id?: string | null
          additional_comment?: string | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          customer_id: string
          delivery_datetime: string
          delivery_location: string
          id?: string
          product_id?: string | null
          product_name: string
          product_photo?: string | null
          quantity: number
          sku: string
          status?: string
          updated_at?: string
          variant_attrs?: Json | null
          variant_id?: string | null
        }
        Update: {
          accepted_offer_id?: string | null
          additional_comment?: string | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          customer_id?: string
          delivery_datetime?: string
          delivery_location?: string
          id?: string
          product_id?: string | null
          product_name?: string
          product_photo?: string | null
          quantity?: number
          sku?: string
          status?: string
          updated_at?: string
          variant_attrs?: Json | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_qr_accepted_offer"
            columns: ["accepted_offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_brand_categories: {
        Row: {
          brand_id: string
          category_id: string
          created_at: string
          id: string
          seller_id: string
        }
        Insert: {
          brand_id: string
          category_id: string
          created_at?: string
          id?: string
          seller_id: string
        }
        Update: {
          brand_id?: string
          category_id?: string
          created_at?: string
          id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_brand_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_brand_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_brand_categories_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_companies: {
        Row: {
          bank_account: string | null
          bank_bic: string | null
          bank_name: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_approved: boolean
          legal_name: string | null
          logo_url: string | null
          registration_number: string | null
          seller_id: string
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bank_account?: string | null
          bank_bic?: string | null
          bank_name?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          legal_name?: string | null
          logo_url?: string | null
          registration_number?: string | null
          seller_id: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bank_account?: string | null
          bank_bic?: string | null
          bank_name?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          legal_name?: string | null
          logo_url?: string | null
          registration_number?: string | null
          seller_id?: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_companies_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_stores: {
        Row: {
          address: string
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          postal_code: string | null
          seller_id: string
        }
        Insert: {
          address: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          postal_code?: string | null
          seller_id: string
        }
        Update: {
          address?: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          postal_code?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_stores_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_seller: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
