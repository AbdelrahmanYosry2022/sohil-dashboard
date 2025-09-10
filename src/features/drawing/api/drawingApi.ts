import { supabase } from '../../../lib/supabase/client'
import type { EpisodeContentInsert } from '../../../lib/supabase'

// Types for Drawing operations
export type DrawingFolder = {
  id: string
  name: string
  order: number
  scenes: DrawingScene[]
}

export type DrawingScene = {
  id: string
  title: string
  thumbnail: string
  status: 'draft' | 'review' | 'changes' | 'approved'
  shots: number
  comments: number
  lastUpdateISO: string
}

export type DrawingVersion = {
  id: string
  name: string
  createdAt: string
  thumbnail: string
  status: 'draft' | 'review' | 'changes' | 'approved'
  notes?: string
}

export type DrawingComment = {
  id: string
  author: string
  role: string
  at: string
  text: string
  status: 'open' | 'resolved'
  pin?: { xPct: number; yPct: number }
}

/**
 * API Layer for Drawing operations
 * Handles all database operations related to drawing scenes, versions, and comments
 */
export const drawingApi = {
  /**
   * Save drawing folders and scenes for an episode
   */
  async saveScenes(episodeId: string, folders: DrawingFolder[]) {
    try {
      // First, remove existing drawing content for this episode
      const { data: existing } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'drawing')

      if (existing) {
        const deletePromises = existing.map(item =>
          supabase
            .from('episode_content')
            .delete()
            .eq('id', item.id)
        )
        await Promise.all(deletePromises)
      }

      // Save folders and scenes
      const promises = folders.map(folder =>
        supabase
          .from('episode_content')
          .insert({
            episode_id: episodeId,
            type: 'drawing',
            content: {
              folderId: folder.id,
              name: folder.name,
              order: folder.order,
              scenes: folder.scenes.map((scene: DrawingScene) => ({
                sceneId: scene.id,
                title: scene.title,
                thumbnail: scene.thumbnail,
                status: scene.status,
                shots: scene.shots,
                comments: scene.comments,
                lastUpdateISO: scene.lastUpdateISO
              }))
            }
          })
      )

      const results = await Promise.all(promises)
      return results.map(result => {
        if (result.error) throw result.error
        return result.data
      })
    } catch (error) {
      console.error('Failed to save drawing scenes:', error)
      throw new Error('فشل في حفظ مشاهد الرسم')
    }
  },

  /**
   * Load drawing folders and scenes for an episode
   */
  async loadScenes(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'drawing')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => {
        const content = item.content as {
          folderId?: string
          name?: string
          order?: number
          scenes?: DrawingScene[]
        } | null

        if (!content) {
          return {
            id: item.id,
            name: '',
            order: 0,
            scenes: []
          }
        }

        return {
          id: content.folderId || item.id,
          name: content.name || '',
          order: content.order || 0,
          scenes: content.scenes || []
        }
      }).sort((a, b) => a.order - b.order)
    } catch (error) {
      console.error('Failed to load drawing scenes:', error)
      throw new Error('فشل في تحميل مشاهد الرسم')
    }
  },

  /**
   * Save versions for a drawing scene
   */
  async saveVersions(episodeId: string, sceneId: string, versions: DrawingVersion[]) {
    try {
      const content: EpisodeContentInsert = {
        episode_id: episodeId,
        type: 'drawing',
        content: {
          type: 'versions',
          sceneId,
          versions: versions.map(version => ({
            versionId: version.id,
            name: version.name,
            createdAt: version.createdAt,
            thumbnail: version.thumbnail,
            status: version.status,
            notes: version.notes
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
      console.error('Failed to save drawing versions:', error)
      throw new Error('فشل في حفظ إصدارات الرسم')
    }
  },

  /**
   * Save comments for a drawing scene
   */
  async saveComments(episodeId: string, sceneId: string, comments: DrawingComment[]) {
    try {
      const content: EpisodeContentInsert = {
        episode_id: episodeId,
        type: 'drawing',
        content: {
          type: 'comments',
          sceneId,
          comments: comments.map(comment => ({
            commentId: comment.id,
            author: comment.author,
            role: comment.role,
            at: comment.at,
            text: comment.text,
            status: comment.status,
            pin: comment.pin
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
      console.error('Failed to save drawing comments:', error)
      throw new Error('فشل في حفظ تعليقات الرسم')
    }
  }
}
