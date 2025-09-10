import { supabase } from '../../../lib/supabase/client'

export const STORAGE_BUCKET = import.meta.env.VITE_STORYBOARD_BUCKET ?? 'storyboard-images';

/**
 * Storage operations for Storyboard images
 * Handles all file upload/download operations related to storyboard
 */
export const storyboardStorage = {
  /**
   * Upload storyboard image to episode folder
   */
  async uploadStoryboardImage(episodeId: string, fileName: string, file: File): Promise<string | null> {
    try {
      console.log('📤 بدء رفع الصورة:', { episodeId, fileName, fileSize: file.size, fileType: file.type })

      // Validate inputs
      if (!episodeId || !fileName || !file) {
        console.error('❌ معاملات غير صحيحة لرفع الصورة')
        return null
      }

      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        console.error('❌ حجم الملف كبير جداً:', file.size)
        return null
      }

      // Ensure user is authenticated
      console.log('🔐 التحقق من المصادقة...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ المستخدم غير مصادق - يجب تسجيل الدخول أولاً')
        alert('يجب تسجيل الدخول أولاً لرفع الصور')
        return null
      }

  // لا تقم بفحص listBuckets()، ارفع مباشرة وتعامل مع الخطأ

      // Create file path: episodes/{episodeId}/storyboard/{fileName}
      const filePath = `episodes/${episodeId}/storyboard/${fileName}`
      console.log('📁 مسار الملف:', filePath)

      const { data, error } = await supabase.storage
  .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('❌ خطأ في رفع الصورة:', error)
        console.error('تفاصيل الخطأ:', error.message)
        return null
      }

      console.log('✅ تم رفع الصورة بنجاح:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
  .from(STORAGE_BUCKET)
        .getPublicUrl(data.path)

      console.log('🔗 رابط الصورة العام:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      console.error('❌ خطأ غير متوقع في رفع الصورة:', error)
      return null
    }
  },

  /**
   * Delete storyboard image
   */
  async deleteStoryboardImage(episodeId: string, fileName: string): Promise<boolean> {
    try {
      // Ensure user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ المستخدم غير مصادق - يجب تسجيل الدخول أولاً')
        alert('يجب تسجيل الدخول أولاً لحذف الصور')
        return false
      }

      const filePath = `episodes/${episodeId}/storyboard/${fileName}`

      const { error } = await supabase.storage
  .from(STORAGE_BUCKET)
        .remove([filePath])

      if (error) {
        console.error('Error deleting storyboard image:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error deleting storyboard image:', error)
      return false
    }
  },

  /**
   * List all storyboard images for an episode
   */
  async listStoryboardImages(episodeId: string): Promise<string[]> {
    try {
      const folderPath = `episodes/${episodeId}/storyboard`

      const { data, error } = await supabase.storage
  .from(STORAGE_BUCKET)
        .list(folderPath)

      if (error) {
        console.error('Error listing storyboard images:', error)
        return []
      }

      return data?.map(file => file.name) || []
    } catch (error) {
      console.error('Unexpected error listing storyboard images:', error)
      return []
    }
  },

  /**
   * Get public URL for storyboard image
   */
  getStoryboardImageUrl(episodeId: string, fileName: string): string {
    const filePath = `episodes/${episodeId}/storyboard/${fileName}`
    const { data } = supabase.storage
  .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}
