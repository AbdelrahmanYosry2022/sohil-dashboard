import { supabase } from '../../../lib/supabase/client'
import { drawingStorage } from './drawingStorage'
import type { EpisodeContentInsert } from '../../../lib/supabase'

// Types for Drawing operations
export type StoryboardFrame = {
  // ... (يمكنك ترك هذا النوع كما هو أو تغيير اسمه إلى DrawingFrame)
  frameId: string
  title: string
  description?: string
  thumbnail: string
  finalThumbnail?: string
  duration: number
  notes?: string
  order: number
  sceneId?: string
  finalArtPath?: string | null
  frameType?: 'drawing' | 'final' // 💡 تم التعديل
}

export type StoryboardFolders = {
  // ... (يمكنك ترك هذا النوع كما هو أو تغيير اسمه إلى DrawingFolders)
  type: 'folders'
  folders: Array<{
    id: string
    name: string
    parentId: string | null
    order: number
  }>
}

/**
 * API Layer for Drawing operations
 */
export const drawingApi = {
  /**
   * Save drawing frames for an episode
   */
  async saveFrames(episodeId: string, frames: StoryboardFrame[]) {
    try {
      const { data: existing, error: deleteError } = await supabase
        .from('episode_content')
        .delete()
        .eq('episode_id', episodeId)
        .eq('type', 'art_asset'); // 💡 تم التعديل

      if (deleteError) throw deleteError;
      
      const createPromises = frames.map((frame, index) => {
        const { order, ...frameContent } = frame;

        const recordToInsert = {
          episode_id: episodeId,
          type: 'art_asset', // 💡 تم التعديل
          order_index: index + 1,
          content: {
            ...frameContent,
            frameType: frameContent.finalArtPath ? 'final' : 'drawing' // 💡 تم التعديل
          }
        };
        return supabase
          .from('episode_content')
          .insert(recordToInsert as unknown as EpisodeContentInsert)
          .select()
          .single();
      });

      const results = await Promise.all(createPromises);
      return results.map(result => {
        if (result.error) throw result.error;
        return result.data;
      });
    } catch (error) {
      console.error('Failed to save frames:', error);
      throw new Error('فشل في حفظ إطارات الرسم. يرجى المحاولة مرة أخرى');
    }
  },

  /**
   * Load drawing frames for an episode
   */
  async loadFrames(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'art_asset') // 💡 تم التعديل
        .order('order_index', { ascending: true }); // 💡 تم التعديل

      if (error) throw error;

      return data
        .map(item => {
          const content = item.content as StoryboardFrame | null;
          if (!content) return null;

          const finalArtPath = content.finalArtPath ?? null;
          const finalThumb = content.finalThumbnail || (finalArtPath ? drawingStorage.getFinalArtPublicUrl(finalArtPath) || '' : '');
          
          return {
            id: item.id,
            ...content,
            order: item.order_index,
            finalThumbnail: finalThumb,
            frameType: finalArtPath ? 'final' : (content.frameType || 'drawing') // 💡 تم التعديل
          };
        })
        .filter((frame): frame is NonNullable<typeof frame> => frame !== null);
    } catch (error) {
      console.error('Failed to load frames:', error);
      throw new Error('فشل في تحميل إطارات الرسم. يرجى تحديث الصفحة والمحاولة مرة أخرى');
    }
  },
  
  /**
   * Update final art for a specific frame
   */
  async updateFrameFinalArt(episodeId: string, frameId: string, finalArtData: { finalArtPath: string; finalThumbnail: string; frameType: string }) {
    try {
      // Find the specific frame record
      const { data: frames, error: fetchError } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'art_asset');

      if (fetchError) throw fetchError;
      if (!frames || frames.length === 0) throw new Error('No frames found for this episode');

      // Find the frame with matching frameId
      const frameRecord = frames.find(frame => {
        const content = frame.content as any;
        return content.frameId === frameId;
      });
      
      if (!frameRecord) throw new Error('Frame not found');

      // Update the frame content with final art data
      const updatedContent = {
        ...frameRecord.content,
        ...finalArtData
      };

      // Save back to database
      const { data, error } = await supabase
        .from('episode_content')
        .update({ content: updatedContent })
        .eq('id', frameRecord.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update frame final art:', error);
      throw new Error('فشل في تحديث الرسم النهائي للإطار');
    }
  },

  /**
   * Get a specific frame by ID
   */
  async getFrame(frameId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('type', 'art_asset');

      if (error) throw error;
      
      for (const item of data) {
        const content = item.content as any;
        const frame = content.frames?.find((f: any) => f.frameId === frameId);
        if (frame) {
          return { data: frame };
        }
      }
      
      return { data: null };
    } catch (error) {
      console.error('Failed to get frame:', error);
      throw new Error('فشل في جلب الإطار');
    }
  },

  /**
   * Unlink final art from frame
   */
  async unlinkFinalArtFromFrame(episodeId: string, frameId: string) {
    try {
      return await this.updateFrameFinalArt(episodeId, frameId, {
        finalArtPath: '',
        finalThumbnail: '',
        frameType: 'drawing'
      });
    } catch (error) {
      console.error('Failed to unlink final art:', error);
      throw new Error('فشل في إلغاء ربط الرسم النهائي');
    }
  },

  /**
   * Save drawing folders for an episode
   */
  async saveFolders(episodeId: string, folders: any[]) {
    try {
      await supabase
        .from('episode_content')
        .delete()
        .eq('episode_id', episodeId)
        .eq('type', 'drawing_meta'); // 💡 تم التعديل

      if (!folders || folders.length === 0) {
        // حفظ مصفوفة فارغة بدلاً من عدم الحفظ
        const contentToInsert = {
          episode_id: episodeId,
          type: 'drawing_meta',
          content: {
            type: 'folders',
            folders: []
          }
        };
        
        const { data, error } = await supabase
          .from('episode_content')
          .insert(contentToInsert as unknown as EpisodeContentInsert)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }

      // حفظ المجلدات مع المشاهد كاملة
      const folderData = folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        scenes: folder.scenes || []
      }));

      const contentToInsert = {
        episode_id: episodeId,
        type: 'drawing_meta', // 💡 تم التعديل
        content: {
          type: 'folders',
          folders: folderData
        }
      };

      const { data, error } = await supabase
        .from('episode_content')
        .insert(contentToInsert as unknown as EpisodeContentInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to save folders:', error);
      throw new Error('فشل في حفظ المجلدات');
    }
  },

  /**
   * Load drawing folders for an episode
   */
  async loadFolders(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_content')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('type', 'drawing_meta') // 💡 تم التعديل
        .maybeSingle();

      if (error) throw error;
      if (!data) return { data: [] };

      const content = data.content as any;
      // إرجاع البيانات الكاملة مع المشاهد
      return { data: content?.folders || [] };
    } catch (error) {
      console.error('Failed to load folders:', error);
      throw new Error('فشل في تحميل المجلدات');
    }
  }
}