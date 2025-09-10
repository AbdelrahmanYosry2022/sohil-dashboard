import { supabase } from '../../../lib/supabase/client'
import type { EpisodeContentInsert } from '../../../lib/supabase'

// Types for Audio operations
export type AudioContent = {
  fileId: string
  name: string
  url: string
  duration: number
  size: number
  type: string
  sceneId?: string
  notes?: string
  createdAt?: string
}

/**
 * API Layer for Audio operations
 * Handles all database operations related to audio files
 */
export const audioApi = {
  /**
   * Save audio files for an episode
   */
  async saveAudioFiles(episodeId: string, audioFiles: AudioContent[]) {
    try {
      // First, remove existing audio content for this episode
      const { data: existing } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'audio')

      if (existing) {
        const deletePromises = existing.map(item =>
          supabase
            .from('episode_content')
            .delete()
            .eq('id', item.id)
        )
        await Promise.all(deletePromises)
      }

      // Save new audio files
      const createPromises = audioFiles.map(audioFile =>
        supabase
          .from('episode_content')
          .insert({
            episode_id: episodeId,
            type: 'audio',
            content: {
              fileId: audioFile.fileId || crypto.randomUUID(),
              name: audioFile.name || 'Untitled Audio',
              url: audioFile.url || '',
              duration: audioFile.duration || 0,
              size: audioFile.size || 0,
              type: audioFile.type || 'audio/mp3',
              sceneId: audioFile.sceneId,
              notes: audioFile.notes || '',
              createdAt: audioFile.createdAt || new Date().toISOString()
            }
          })
      )

      const results = await Promise.all(createPromises)
      return results.map(result => {
        if (result.error) throw result.error
        return result.data
      })
    } catch (error) {
      console.error('Failed to save audio files:', error)
      throw new Error('فشل في حفظ ملفات الصوت. يرجى المحاولة مرة أخرى')
    }
  },

  /**
   * Load audio files for an episode
   */
  async loadAudioFiles(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'audio')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => {
        const content = item.content as {
          fileId?: string;
          name?: string;
          url?: string;
          duration?: number;
          size?: number;
          type?: string;
          sceneId?: string;
          notes?: string;
          createdAt?: string;
        } | null;

        if (!content) {
          return {
            id: item.id,
            name: '',
            url: '',
            duration: 0,
            size: 0,
            type: '',
            sceneId: undefined,
            notes: '',
            createdAt: new Date()
          };
        }

        return {
          id: content.fileId || item.id,
          name: content.name || '',
          url: content.url || '',
          duration: content.duration || 0,
          size: content.size || 0,
          type: content.type || '',
          sceneId: content.sceneId,
          notes: content.notes || '',
          createdAt: content.createdAt ? new Date(content.createdAt) : new Date()
        };
      })
    } catch (error) {
      console.error('Failed to load audio files:', error)
      throw new Error('فشل في تحميل ملفات الصوت')
    }
  }
}
