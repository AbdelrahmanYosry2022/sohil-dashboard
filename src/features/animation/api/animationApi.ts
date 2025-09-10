import { supabase } from '../../../lib/supabase/client'
import type { EpisodeContentInsert } from '../../../lib/supabase'

// Types for Animation operations
export type AnimationKeyframe = {
  id: string
  frameId: string
  time: number // in seconds
  properties: Record<string, any> // CSS properties or animation data
  easing?: string
}

export type AnimationSequence = {
  id: string
  name: string
  keyframes: AnimationKeyframe[]
  duration: number
  sceneId?: string
}

export type AnimationProject = {
  id: string
  name: string
  sequences: AnimationSequence[]
  totalDuration: number
}

/**
 * API Layer for Animation operations
 * Handles all database operations related to animations, keyframes, and sequences
 * Currently prepared for future use when animation features are implemented
 */
export const animationApi = {
  /**
   * Save animation sequences for an episode
   */
  async saveSequences(episodeId: string, sequences: AnimationSequence[]) {
    try {
      // First, remove existing animation content for this episode
      const { data: existing } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'animation')

      if (existing) {
        const deletePromises = existing.map(item =>
          supabase
            .from('episode_content')
            .delete()
            .eq('id', item.id)
        )
        await Promise.all(deletePromises)
      }

      // Save animation sequences
      const promises = sequences.map(sequence =>
        supabase
          .from('episode_content')
          .insert({
            episode_id: episodeId,
            type: 'animation',
            content: {
              sequenceId: sequence.id,
              name: sequence.name,
              keyframes: sequence.keyframes,
              duration: sequence.duration,
              sceneId: sequence.sceneId
            }
          })
      )

      const results = await Promise.all(promises)
      return results.map(result => {
        if (result.error) throw result.error
        return result.data
      })
    } catch (error) {
      console.error('Failed to save animation sequences:', error)
      throw new Error('فشل في حفظ تسلسلات التحريك')
    }
  },

  /**
   * Load animation sequences for an episode
   */
  async loadSequences(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'animation')
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(item => {
        const content = item.content as {
          sequenceId?: string
          name?: string
          keyframes?: AnimationKeyframe[]
          duration?: number
          sceneId?: string
        } | null

        if (!content) {
          return {
            id: item.id,
            name: '',
            keyframes: [],
            duration: 0
          }
        }

        return {
          id: content.sequenceId || item.id,
          name: content.name || '',
          keyframes: content.keyframes || [],
          duration: content.duration || 0,
          sceneId: content.sceneId
        }
      })
    } catch (error) {
      console.error('Failed to load animation sequences:', error)
      throw new Error('فشل في تحميل تسلسلات التحريك')
    }
  },

  /**
   * Save animation keyframes for a sequence
   */
  async saveKeyframes(episodeId: string, sequenceId: string, keyframes: AnimationKeyframe[]) {
    try {
      const content: EpisodeContentInsert = {
        episode_id: episodeId,
        type: 'animation',
        content: {
          type: 'keyframes',
          sequenceId,
          keyframes: keyframes.map(keyframe => ({
            keyframeId: keyframe.id,
            frameId: keyframe.frameId,
            time: keyframe.time,
            properties: keyframe.properties,
            easing: keyframe.easing
          }))
        }
      }

      const { data, error } = await supabase
        .from('episode_content')
        .insert(content)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to save animation keyframes:', error)
      throw new Error('فشل في حفظ الإطارات الرئيسية للتحريك')
    }
  },

  /**
   * Save animation project metadata
   */
  async saveProject(episodeId: string, project: AnimationProject) {
    try {
      const content: EpisodeContentInsert = {
        episode_id: episodeId,
        type: 'animation',
        content: {
          type: 'project',
          ...project
        }
      }

      const { data, error } = await supabase
        .from('episode_content')
        .insert(content)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to save animation project:', error)
      throw new Error('فشل في حفظ مشروع التحريك')
    }
  },

  /**
   * Load animation project metadata
   */
  async loadProject(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'animation')
        .order('created_at', { ascending: false })

      if (error) throw error

      const projectItem = data.find(item => {
        const content = item.content as any
        return content?.type === 'project'
      })

      if (!projectItem) return null

      const content = projectItem.content as AnimationProject
      return content
    } catch (error) {
      console.error('Failed to load animation project:', error)
      throw new Error('فشل في تحميل مشروع التحريك')
    }
  }
}
