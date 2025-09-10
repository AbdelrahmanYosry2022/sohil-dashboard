import { supabase } from '../../../lib/supabase/client'
import type { Episode, EpisodeInsert, EpisodeUpdate, EpisodeContent } from '../../../lib/supabase'

// Types for Episodes operations
export type EpisodeStats = {
  text: { scenes: number; words: number; characters: number; estimatedMinutes: number }
  audio: { files: number; totalDuration: number; totalSize: number }
  storyboard: { frames: number; scenes: number }
  drawing: { scenes: number; comments: number; approved: number }
}

/**
 * API Layer for Episodes operations
 * Handles all database operations related to episodes management
 */
export const episodesApi = {
  /**
   * Get all episodes
   */
  async getAll(): Promise<Episode[]> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get episode by ID
   */
  async getById(id: string): Promise<Episode> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create new episode
   */
  async create(episode: EpisodeInsert): Promise<Episode> {
    const { data, error } = await supabase
      .from('episodes')
      .insert(episode)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update episode
   */
  async update(id: string, updates: EpisodeUpdate): Promise<Episode> {
    const { data, error } = await supabase
      .from('episodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete episode
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Get episode with content
   */
  async getWithContent(id: string): Promise<Episode & { content: EpisodeContent[] }> {
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        episode_content (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return {
      ...data,
      content: data.episode_content || []
    }
  }
}

/**
 * API Layer for Statistics operations
 * Handles all statistics and overview operations
 */
export const statisticsApi = {
  /**
   * Get episode statistics
   */
  async getEpisodeStats(episodeId: string): Promise<EpisodeStats> {
    const allContent = await supabase
      .from('episode_content')
      .select('*')
      .eq('episode_id', episodeId)

    const stats: EpisodeStats = {
      text: { scenes: 0, words: 0, characters: 0, estimatedMinutes: 0 },
      audio: { files: 0, totalDuration: 0, totalSize: 0 },
      storyboard: { frames: 0, scenes: 0 },
      drawing: { scenes: 0, comments: 0, approved: 0 }
    }

    if (allContent.data) {
      for (const item of allContent.data) {
        const content = item.content as any // Using any here since content structure varies by type

        switch (item.type) {
          case 'text':
            stats.text.scenes++
            if (content?.content && typeof content.content === 'string') {
              const textContent = content.content
              const wordCount = textContent.trim().split(/\s+/).length
              stats.text.words += wordCount
              stats.text.characters += textContent.length
              stats.text.estimatedMinutes = Math.ceil(stats.text.words / 150)
            }
            break

          case 'audio':
            stats.audio.files++
            if (content) {
              stats.audio.totalDuration += typeof content.duration === 'number' ? content.duration : 0
              stats.audio.totalSize += typeof content.size === 'number' ? content.size : 0
            }
            break

          case 'storyboard':
            if (content?.type === 'folders' && Array.isArray(content.folders)) {
              stats.storyboard.scenes += content.folders.length
            } else if (content) {
              stats.storyboard.frames++
            }
            break

          case 'drawing':
            if (Array.isArray(content?.scenes)) {
              stats.drawing.scenes += content.scenes.length
              content.scenes.forEach((scene: any) => {
                if (typeof scene.comments === 'number') {
                  stats.drawing.comments += scene.comments
                }
                if (scene.status === 'approved') {
                  stats.drawing.approved++
                }
              })
            }
            break
        }
      }
    }

    return stats
  }
}
