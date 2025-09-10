import { supabase } from '../../../lib/supabase/client'
import type { EpisodeContentInsert } from '../../../lib/supabase'

// Types for Text operations
export type TextScene = {
  id: string
  title: string
  content: string
  duration?: number
  order?: number
}

/**
 * API Layer for Text operations
 * Handles all database operations related to text scenes
 */
export const textApi = {
  /**
   * Save text scenes for an episode
   */
  async saveScenes(episodeId: string, scenes: TextScene[]) {
    try {
      // First, remove existing text content for this episode
      const { data: existing } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'text')

      if (existing) {
        const deletePromises = existing.map(item =>
          supabase
            .from('episode_content')
            .delete()
            .eq('id', item.id)
        )
        await Promise.all(deletePromises)
      }

      // Save new scenes
      const createPromises = scenes.map((scene, index) =>
        supabase
          .from('episode_content')
          .insert({
            episode_id: episodeId,
            type: 'text',
            content: {
              sceneId: scene.id,
              title: scene.title || 'Untitled Scene',
              content: scene.content || '',
              duration: scene.duration || 0,
              order: index + 1
            }
          })
      )

      const results = await Promise.all(createPromises)
      return results.map(result => {
        if (result.error) throw result.error
        return result.data
      })
    } catch (error) {
      console.error('Failed to save scenes:', error)
      throw new Error('فشل في حفظ المشاهد. يرجى المحاولة مرة أخرى')
    }
  },

  /**
   * Load text scenes for an episode
   */
  async loadScenes(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'text')
        .order('created_at', { ascending: true })

      if (error) throw error

      return data
        .map(item => {
          const content = item.content as {
            sceneId?: string
            title?: string
            content?: string
            duration?: number
            order?: number
          }
          return {
            id: content.sceneId || item.id,
            title: content.title || 'Untitled Scene',
            content: content.content || '',
            duration: content.duration || 0,
            order: content.order || 0
          }
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    } catch (error) {
      console.error('Failed to load scenes:', error)
      throw new Error('فشل في تحميل المشاهد. يرجى تحديث الصفحة والمحاولة مرة أخرى')
    }
  }
}
