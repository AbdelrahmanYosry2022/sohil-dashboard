import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database tables
export interface Episode {
  id: string
  title: string
  description?: string
  status: 'draft' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface EpisodeContent {
  id: string
  episode_id: string
  type: 'storyboard' | 'animation' | 'audio' | 'text' | 'editing' | 'drawing'
  content: any
  created_at: string
  updated_at: string
}

// Helper functions for database operations
export const episodeOperations = {
  // Get all episodes
  async getAll() {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get episode by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new episode
  async create(episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('episodes')
      .insert(episode)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update episode
  async update(id: string, updates: Partial<Episode>) {
    const { data, error } = await supabase
      .from('episodes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete episode
  async delete(id: string) {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const contentOperations = {
  // Get content for an episode
  async getByEpisodeId(episodeId: string) {
    const { data, error } = await supabase
      .from('episode_content')
      .select('*')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // Create content for an episode
  async create(content: Omit<EpisodeContent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('episode_content')
      .insert(content)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update content
  async update(id: string, updates: Partial<EpisodeContent>) {
    const { data, error } = await supabase
      .from('episode_content')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete content
  async delete(id: string) {
    const { error } = await supabase
      .from('episode_content')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
