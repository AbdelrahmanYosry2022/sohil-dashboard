import { supabase } from '../../../lib/supabase/client'
import type { EpisodeContentInsert } from '../../../lib/supabase'

// Types for Editing operations
export type EditingClip = {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'text'
  status: 'raw' | 'editing' | 'review' | 'final'
  duration: number // in seconds
  startTime: number
  endTime: number
  trackId: string
  sceneId: string
  effects: string[]
  transitions: string[]
  assignedTo: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type EditingTrack = {
  id: string
  name: string
  type: 'video' | 'audio' | 'subtitle'
  clips: string[]
  muted: boolean
  volume: number
  locked: boolean
}

export type EditingProject = {
  id: string
  name: string
  duration: number
  frameRate: number
  resolution: string
  status: 'draft' | 'review' | 'final'
  progress: number
}

/**
 * API Layer for Editing operations
 * Handles all database operations related to editing projects, tracks, and clips
 */
export const editingApi = {
  /**
   * Save editing clips for an episode
   */
  async saveClips(episodeId: string, clips: EditingClip[]) {
    try {
      // First, remove existing editing content for this episode
      const { data: existing } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'editing')

      if (existing) {
        const deletePromises = existing.map(item =>
          supabase
            .from('episode_content')
            .delete()
            .eq('id', item.id)
        )
        await Promise.all(deletePromises)
      }

      // Save clips
      const promises = clips.map(clip =>
        supabase
          .from('episode_content')
          .insert({
            episode_id: episodeId,
            type: 'editing',
            content: {
              clipId: clip.id,
              name: clip.name,
              type: clip.type,
              status: clip.status,
              duration: clip.duration,
              startTime: clip.startTime,
              endTime: clip.endTime,
              trackId: clip.trackId,
              sceneId: clip.sceneId,
              effects: clip.effects,
              transitions: clip.transitions,
              assignedTo: clip.assignedTo,
              notes: clip.notes,
              createdAt: clip.createdAt.toISOString(),
              updatedAt: clip.updatedAt.toISOString()
            }
          })
      )

      const results = await Promise.all(promises)
      return results.map(result => {
        if (result.error) throw result.error
        return result.data
      })
    } catch (error) {
      console.error('Failed to save editing clips:', error)
      throw new Error('فشل في حفظ مشاهد التحرير')
    }
  },

  /**
   * Load editing clips for an episode
   */
  async loadClips(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'editing')
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(item => {
        const content = item.content as {
          clipId?: string
          name?: string
          type?: 'video' | 'audio' | 'image' | 'text'
          status?: 'raw' | 'editing' | 'review' | 'final'
          duration?: number
          startTime?: number
          endTime?: number
          trackId?: string
          sceneId?: string
          effects?: string[]
          transitions?: string[]
          assignedTo?: string
          notes?: string
          createdAt?: string
          updatedAt?: string
        } | null

        if (!content) {
          return {
            id: item.id,
            name: '',
            type: 'video' as const,
            status: 'raw' as const,
            duration: 0,
            startTime: 0,
            endTime: 0,
            trackId: '',
            sceneId: '',
            effects: [],
            transitions: [],
            assignedTo: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }

        return {
          id: content.clipId || item.id,
          name: content.name || '',
          type: content.type || 'video',
          status: content.status || 'raw',
          duration: content.duration || 0,
          startTime: content.startTime || 0,
          endTime: content.endTime || 0,
          trackId: content.trackId || '',
          sceneId: content.sceneId || '',
          effects: content.effects || [],
          transitions: content.transitions || [],
          assignedTo: content.assignedTo || '',
          notes: content.notes,
          createdAt: content.createdAt ? new Date(content.createdAt) : new Date(),
          updatedAt: content.updatedAt ? new Date(content.updatedAt) : new Date()
        }
      })
    } catch (error) {
      console.error('Failed to load editing clips:', error)
      throw new Error('فشل في تحميل مشاهد التحرير')
    }
  },

  /**
   * Save editing project metadata
   */
  async saveProject(episodeId: string, project: EditingProject) {
    try {
      const content: EpisodeContentInsert = {
        episode_id: episodeId,
        type: 'editing',
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
      console.error('Failed to save editing project:', error)
      throw new Error('فشل في حفظ مشروع التحرير')
    }
  },

  /**
   * Load editing project metadata
   */
  async loadProject(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'editing')
        .order('created_at', { ascending: false })

      if (error) throw error

      const projectItem = data.find(item => {
        const content = item.content as any
        return content?.type === 'project'
      })

      if (!projectItem) return null

      const content = projectItem.content as EditingProject
      return content
    } catch (error) {
      console.error('Failed to load editing project:', error)
      throw new Error('فشل في تحميل مشروع التحرير')
    }
  }
}
