import { supabase } from '../../../lib/supabase/client'
import type { EpisodeContentInsert } from '../../../lib/supabase'

// Types for Storyboard operations
export type StoryboardFrame = {
  frameId: string
  title: string
  description?: string
  thumbnail: string
  // الصورة النهائية (الرسم النهائي) اختيارية
  finalThumbnail?: string
  duration: number
  notes?: string
  order: number
  sceneId?: string
}

export type StoryboardFolders = {
  type: 'folders'
  folders: Array<{
    id: string
    name: string
    parentId: string | null
    order: number
  }>
}

/**
 * API Layer for Storyboard operations
 * Handles all database operations related to storyboard frames and folders
 */
export const storyboardApi = {
  /**
   * Save storyboard frames for an episode
   */
  async saveFrames(episodeId: string, frames: StoryboardFrame[]) {
    try {
      // Remove only existing frame items (preserve folders record)
      const existing = await this.loadFrames(episodeId)
      const existingIds = existing.map(frame => frame.id)

      if (existingIds.length > 0) {
        // Delete existing frames from database
        const deletePromises = existingIds.map(id =>
          supabase
            .from('episode_content')
            .delete()
            .eq('id', id)
        )
        await Promise.all(deletePromises)
      }

      // Save new frames
      const createPromises = frames.map((frame, index) => {
        const content: EpisodeContentInsert = {
          episode_id: episodeId,
          type: 'storyboard',
          content: {
            ...frame,
            order: index + 1
          }
        }
        return supabase
          .from('episode_content')
          .insert(content)
          .select()
          .single()
      })

      const results = await Promise.all(createPromises)
      return results.map(result => {
        if (result.error) throw result.error
        return result.data
      })
    } catch (error) {
      console.error('Failed to save frames:', error)
      throw new Error('فشل في حفظ الإطارات. يرجى المحاولة مرة أخرى')
    }
  },

  /**
   * Load storyboard frames for an episode
   */
  async loadFrames(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'storyboard')
        .order('created_at', { ascending: true })

      if (error) throw error

      return data
        .map(item => {
          const content = item.content as StoryboardFrame | StoryboardFolders | null
          if (!content || 'type' in content) return null // Skip folders

          return {
            id: item.id,
            frameId: content.frameId || item.id,
            title: content.title || 'Untitled Frame',
            description: content.description || '',
            thumbnail: content.thumbnail || '',
            finalThumbnail: (content as any).finalThumbnail || '',
            duration: content.duration || 0,
            notes: content.notes || '',
            order: content.order || 0,
            sceneId: content.sceneId
          }
        })
        .filter((frame): frame is NonNullable<typeof frame> => frame !== null)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    } catch (error) {
      console.error('Failed to load frames:', error)
      throw new Error('فشل في تحميل الإطارات. يرجى تحديث الصفحة والمحاولة مرة أخرى')
    }
  },

  /**
   * Save storyboard folders for an episode
   */
  async saveFolders(episodeId: string, folders: any[]) {
    try {
      console.log('💾 جاري حفظ المجلدات...', { episodeId, folders })

      // Replace existing folders record
      const { data: existing } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'storyboard')

      if (existing) {
        for (const item of existing) {
          const c = item.content as any
          if (c && c.type === 'folders') {
            await supabase
              .from('episode_content')
              .delete()
              .eq('id', item.id)
          }
        }
      }

      // Always save folders data, even if empty array (to preserve deletions)
      const folderData = folders.map((folder, idx) => ({
        folderId: folder.id,
        name: folder.name,
        order: typeof folder.order === 'number' ? folder.order : idx,
        scenes: folder.scenes
      }))

      const content: EpisodeContentInsert = {
        episode_id: episodeId,
        type: 'storyboard',
        content: {
          type: 'folders',
          folders: folderData
        }
      }

      const { data, error } = await supabase
        .from('episode_content')
        .insert(content)
        .select()
        .single()

      if (error) throw error

      console.log('✅ تم حفظ المجلدات بنجاح.')
      return data
    } catch (error) {
      console.error('Failed to save folders:', error)
      throw new Error('فشل في حفظ المجلدات')
    }
  },

  /**
   * Load storyboard folders for an episode
   */
  async loadFolders(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'storyboard')
        .order('created_at', { ascending: true })

      if (error) throw error

      const foldersItem = data.find(item => {
        const content = item.content as any
        return content?.type === 'folders'
      })

      if (!foldersItem) return []

      const content = foldersItem.content as any
      const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtmF2LTZh9ivPC90ZXh0Pjwvc3ZnPg==';

      return content.folders.map((folder: any, index: number) => ({
        id: folder.folderId || folder.id,
        name: folder.name || '',
        parentId: folder.parentId || null,
        order: typeof folder.order === 'number' ? folder.order : index,
        scenes: (folder.scenes || []).map((s: any, i: number) => ({
          id: s.sceneId || s.id || crypto.randomUUID(),
          title: s.title || '',
          thumbnail: s.thumbnail || PLACEHOLDER,
          description: s.description || '',
          order: typeof s.order === 'number' ? s.order : i,
        }))
      }))
    } catch (error) {
      console.error('Failed to load folders:', error)
      throw new Error('فشل في تحميل المجلدات')
    }
  }
}
