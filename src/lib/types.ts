// Database Types
export interface Database {
  public: {
    Tables: {
      episodes: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'draft' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      episode_content: {
        Row: {
          id: string
          episode_id: string
          type: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
          content: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          type: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
          content: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          type?: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
          content?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_type: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
      episode_status: 'draft' | 'in_progress' | 'completed'
    }
  }
}

// Type aliases for easier usage
export type Episode = Database['public']['Tables']['episodes']['Row']
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']
export type EpisodeUpdate = Database['public']['Tables']['episodes']['Update']

export type EpisodeContent = Database['public']['Tables']['episode_content']['Row']
export type EpisodeContentInsert = Database['public']['Tables']['episode_content']['Insert']
export type EpisodeContentUpdate = Database['public']['Tables']['episode_content']['Update']

// Content type definitions for specific tabs
export interface StoryboardContent {
  scenes: Array<{
    id: string
    title: string
    description: string
    image?: string
    duration: number
  }>
}

export interface AnimationContent {
  keyframes: Array<{
    id: string
    time: number
    properties: Record<string, any>
  }>
}

export interface AudioContent {
  tracks: Array<{
    id: string
    name: string
    file?: string
    duration: number
    volume: number
  }>
}

export interface TextContent {
  scripts: Array<{
    id: string
    text: string
    voiceover?: boolean
    timing: {
      start: number
      end: number
    }
  }>
}

export interface EditingContent {
  timeline: Array<{
    id: string
    type: 'video' | 'audio' | 'text'
    start: number
    duration: number
    content: any
  }>
}

export interface DrawingContent {
  layers: Array<{
    id: string
    name: string
    visible: boolean
    opacity: number
    paths: Array<{
      id: string
      points: Array<{ x: number; y: number }>
      stroke: string
      strokeWidth: number
    }>
  }>
}

// Union type for all content types
export type TabContent =
  | StoryboardContent
  | AnimationContent
  | AudioContent
  | TextContent
  | EditingContent
  | DrawingContent
