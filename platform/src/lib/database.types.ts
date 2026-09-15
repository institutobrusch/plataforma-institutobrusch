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
  public: {
    Tables: {
      blog_posts: {
        Row: {
          autor: string | null
          cargo: string | null
          corpo: string[] | null
          created_at: string | null
          data: string | null
          id: string
          imagem_path: string | null
          publicado: boolean | null
          resumo: string | null
          slug: string
          titulo: string
        }
        Insert: {
          autor?: string | null
          cargo?: string | null
          corpo?: string[] | null
          created_at?: string | null
          data?: string | null
          id?: string
          imagem_path?: string | null
          publicado?: boolean | null
          resumo?: string | null
          slug: string
          titulo: string
        }
        Update: {
          autor?: string | null
          cargo?: string | null
          corpo?: string[] | null
          created_at?: string | null
          data?: string | null
          id?: string
          imagem_path?: string | null
          publicado?: boolean | null
          resumo?: string | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      carto_cartas: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          imagem_path: string | null
          titulo: string
          topicos: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          imagem_path?: string | null
          titulo: string
          topicos?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          imagem_path?: string | null
          titulo?: string
          topicos?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      carto_materials: {
        Row: {
          arquivo_path: string | null
          created_at: string
          id: string
          session_id: string
          tipo: string | null
          titulo: string
          url: string | null
          user_id: string
        }
        Insert: {
          arquivo_path?: string | null
          created_at?: string
          id?: string
          session_id: string
          tipo?: string | null
          titulo: string
          url?: string | null
          user_id: string
        }
        Update: {
          arquivo_path?: string | null
          created_at?: string
          id?: string
          session_id?: string
          tipo?: string | null
          titulo?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carto_materials_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "carto_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      carto_sessions: {
        Row: {
          audio_path: string | null
          created_at: string
          data: string | null
          duracao: string | null
          id: string
          ordem: number | null
          resumo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          audio_path?: string | null
          created_at?: string
          data?: string | null
          duracao?: string | null
          id?: string
          ordem?: number | null
          resumo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          audio_path?: string | null
          created_at?: string
          data?: string | null
          duracao?: string | null
          id?: string
          ordem?: number | null
          resumo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          created_at: string
          id: string
          post_id: string
          status: string
          texto: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          post_id: string
          status?: string
          texto: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          post_id?: string
          status?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          slug: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          slug: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          created_at: string
          group_id: string | null
          id: string
          status: string
          texto: string
        }
        Insert: {
          author_id: string
          created_at?: string
          group_id?: string | null
          id?: string
          status?: string
          texto: string
        }
        Update: {
          author_id?: string
          created_at?: string
          group_id?: string | null
          id?: string
          status?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          course_id: string | null
          id: string
          module_id: string | null
          ordem: number | null
          titulo: string | null
          youtube_id: string | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          module_id?: string | null
          ordem?: number | null
          titulo?: string | null
          youtube_id?: string | null
        }
        Update: {
          course_id?: string | null
          id?: string
          module_id?: string | null
          ordem?: number | null
          titulo?: string | null
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string | null
          id: string
          ordem: number | null
          titulo: string | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          ordem?: number | null
          titulo?: string | null
        }
        Update: {
          course_id?: string | null
          id?: string
          ordem?: number | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          ativo: boolean | null
          capa_path: string | null
          created_at: string | null
          descricao: string | null
          id: string
          preco: number | null
          slug: string
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          capa_path?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          preco?: number | null
          slug: string
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          capa_path?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          preco?: number | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      daily_thoughts: {
        Row: {
          audio_path: string | null
          created_at: string
          data: string
          id: string
          publicado_por: string | null
          texto: string | null
          titulo: string
        }
        Insert: {
          audio_path?: string | null
          created_at?: string
          data?: string
          id?: string
          publicado_por?: string | null
          texto?: string | null
          titulo: string
        }
        Update: {
          audio_path?: string | null
          created_at?: string
          data?: string
          id?: string
          publicado_por?: string | null
          texto?: string | null
          titulo?: string
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          arquivo_path: string | null
          ativo: boolean | null
          capa_path: string | null
          created_at: string | null
          descricao: string | null
          id: string
          preco: number | null
          slug: string
          titulo: string
        }
        Insert: {
          arquivo_path?: string | null
          ativo?: boolean | null
          capa_path?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          preco?: number | null
          slug: string
          titulo: string
        }
        Update: {
          arquivo_path?: string | null
          ativo?: boolean | null
          capa_path?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          preco?: number | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          pagamento_ref: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          pagamento_ref?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          pagamento_ref?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data: string | null
          descricao: string | null
          id: string
          local: string | null
          poster_path: string | null
          preco: number | null
          slug: string
          tipo: string | null
          titulo: string
          vagas: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          local?: string | null
          poster_path?: string | null
          preco?: number | null
          slug: string
          tipo?: string | null
          titulo: string
          vagas?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          local?: string | null
          poster_path?: string | null
          preco?: number | null
          slug?: string
          tipo?: string | null
          titulo?: string
          vagas?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          ativo: boolean | null
          id: string
          ordem: number | null
          pergunta: string | null
          resposta: string | null
        }
        Insert: {
          ativo?: boolean | null
          id?: string
          ordem?: number | null
          pergunta?: string | null
          resposta?: string | null
        }
        Update: {
          ativo?: boolean | null
          id?: string
          ordem?: number | null
          pergunta?: string | null
          resposta?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string
          criado_por: string | null
          email: string
          expira_em: string | null
          id: string
          product_id: string | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          email: string
          expira_em?: string | null
          id?: string
          product_id?: string | null
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          email?: string
          expira_em?: string | null
          id?: string
          product_id?: string | null
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          preco: number
          slug: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          preco?: number
          slug: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          preco?: number
          slug?: string
          tipo?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string | null
          papel: string
        }
        Insert: {
          created_at?: string
          id: string
          nome?: string | null
          papel?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
          papel?: string
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          texto: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          texto: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          texto?: string
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          contexto: string | null
          id: string
          iniciais: string | null
          nome: string | null
          ordem: number | null
          texto: string | null
        }
        Insert: {
          contexto?: string | null
          id?: string
          iniciais?: string | null
          nome?: string | null
          ordem?: number | null
          texto?: string | null
        }
        Update: {
          contexto?: string | null
          id?: string
          iniciais?: string | null
          nome?: string | null
          ordem?: number | null
          texto?: string | null
        }
        Relationships: []
      }
      user_products: {
        Row: {
          created_at: string
          id: string
          origem: string
          product_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          origem?: string
          product_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          origem?: string
          product_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_product: { Args: { p_slug: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
