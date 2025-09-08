// Generated TypeScript types for Supabase database
// Based on the schema in supabase-schema.sql

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
          content: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          type: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
          content?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          type?: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
          content?: Record<string, any>
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
      episode_status: 'draft' | 'in_progress' | 'completed'
      content_type: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
    }
  }
}

// Convenience types for easier usage
export type Episode = Database['public']['Tables']['episodes']['Row']
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']
export type EpisodeUpdate = Database['public']['Tables']['episodes']['Update']

export type EpisodeContent = Database['public']['Tables']['episode_content']['Row']
export type EpisodeContentInsert = Database['public']['Tables']['episode_content']['Insert']
export type EpisodeContentUpdate = Database['public']['Tables']['episode_content']['Update']

export type EpisodeStatus = Database['public']['Enums']['episode_status']
export type ContentType = Database['public']['Enums']['content_type']

// Specialized content types based on the content field structure
export interface TextContent {
  sceneId: string
  title: string
  content: string
  duration?: number
  order: number
}

export interface AudioContent {
  fileId: string
  name: string
  url: string
  duration: number
  size: number
  type: string
  sceneId?: string
  notes: string
  createdAt: string
}

export interface StoryboardFrameContent {
  frameId: string
  title: string
  description: string
  thumbnail: string
  duration: string
  notes: string
  order: number
}

export interface StoryboardFolderContent {
  type: 'folders'
  folders: Array<{
    folderId: string
    name: string
    order: number
    scenes: any[]
  }>
}

export interface DrawingContent {
  folderId?: string
  name?: string
  order?: number
  scenes?: Array<{
    sceneId: string
    title: string
    thumbnail: string
    status: string
    shots: any[]
    comments: number
    lastUpdateISO: string
  }>
  type?: 'versions' | 'comments'
  sceneId?: string
  versions?: any[]
  comments?: any[]
}

// Union type for all content types
export type ContentData = 
  | TextContent 
  | AudioContent 
  | StoryboardFrameContent 
  | StoryboardFolderContent 
  | DrawingContent

// Statistics interface
export interface EpisodeStatistics {
  text: {
    scenes: number
    words: number
    characters: number
    estimatedMinutes: number
  }
  audio: {
    files: number
    totalDuration: number
    totalSize: number
  }
  storyboard: {
    frames: number
    scenes: number
  }
  drawing: {
    scenes: number
    comments: number
    approved: number
  }
}