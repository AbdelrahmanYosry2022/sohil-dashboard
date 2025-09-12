import { supabase } from '../../../lib/supabase/client'

/**
 * Storage operations for Storyboard images
 * Handles all file upload/download operations related to storyboard
 */
export const drawingStorage = {
  /**
   * Upload storyboard image to episode folder
   */
  async uploadFrameImage(episodeId: string, fileName: string, file: File): Promise<string | null> {
    try {
      console.log('� DRAWING: استدعاء uploadFrameImage')
      console.log('�📤 بدء رفع الصورة:', { episodeId, fileName, fileSize: file.size, fileType: file.type })

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

  // محاولة الرفع مباشرة؛ التحقق من البوكيت عبر API يحتاج صلاحيات Service Role
  // سنعتمد على رسالة الخطأ من عملية الرفع نفسها.

  // Create file path: episodes/{episodeId}/storyboard/{fileName}
  const filePath = `episodes/${episodeId}/storyboard/${fileName}`
      console.log('📁 مسار الملف:', filePath)

      const { data, error } = await supabase.storage
        .from('episode-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('❌ خطأ في رفع الصورة:', error)
        alert('تعذر رفع الصورة. تأكد من وجود bucket باسم "episode-assets" وأن الصلاحيات صحيحة.')
        return null
      }

      console.log('✅ تم رفع الصورة بنجاح:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('episode-assets')
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
  async deleteFrameImage(episodeId: string, fileName: string): Promise<boolean> {
    try {
      // Ensure user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ المستخدم غير مصادق - يجب تسجيل الدخول أولاً')
        alert('يجب تسجيل الدخول أولاً لحذف الصور')
        return false
      }

      const filePath = `episodes/${episodeId}/drawing/${fileName}`

      let { error } = await supabase.storage
        .from('episode-assets')
        .remove([filePath])

      if (error) {
        // Try legacy path fallback
        const legacyPath = `episodes/${episodeId}/storyboard/${fileName}`
        const legacy = await supabase.storage
          .from('episode-assets')
          .remove([legacyPath])
        if (legacy.error) {
          console.error('Error deleting drawing image (including legacy):', error)
          return false
        }
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
  async listFrameImages(episodeId: string): Promise<string[]> {
    try {
      const folderPath = `episodes/${episodeId}/drawing`

      let { data, error } = await supabase.storage
        .from('episode-assets')
        .list(folderPath)

      if (error) {
        // Fallback to legacy 'storyboard' folder
        const legacyPath = `episodes/${episodeId}/storyboard`
        const legacy = await supabase.storage
          .from('episode-assets')
          .list(legacyPath)
        if (legacy.error) {
          console.error('Error listing drawing images (including legacy):', error)
          return []
        }
        data = legacy.data
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
  getFrameImageUrl(episodeId: string, fileName: string): string {
    const filePath = `episodes/${episodeId}/drawing/${fileName}`
    const { data } = supabase.storage
      .from('episode-assets')
      .getPublicUrl(filePath)

    if (!data.publicUrl) {
      // Legacy path fallback
      const legacyPath = `episodes/${episodeId}/storyboard/${fileName}`
      const legacy = supabase.storage
        .from('episode-assets')
        .getPublicUrl(legacyPath)
      return legacy.data.publicUrl
    }
    return data.publicUrl
  }
  ,

  /**
   * Upload final art image to episode folder in final-art-images bucket
   */
  async uploadFinalArt(episodeId: string, fileName: string, file: File): Promise<{ publicUrl: string; path: string } | null> {
    try {
      console.log('🎨 FINAL ART: استدعاء uploadFinalArtImage')
      console.log('📤 بدء رفع الرسم النهائي:', { episodeId, fileName, fileSize: file.size })
      if (!episodeId || !fileName || !file) return null

      // Ensure user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('يجب تسجيل الدخول لرفع الرسم النهائي')
        return null
      }

      // Skip bucket check and try direct upload to final-art folder
      const filePath = `episodes/${episodeId}/final-art/${fileName}`
      console.log('📁 مسار الملف النهائي:', filePath)
      console.log('🪣 البكيت المستهدف: episode-assets')
      
      const { data, error } = await supabase.storage
        .from('episode-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })
      
      if (error) {
        console.error('❌ خطأ في رفع الرسم النهائي:', error)
        alert('تعذر رفع الرسم النهائي. تأكد من وجود bucket باسم "episode-assets" وأن الصلاحيات صحيحة.')
        return null
      }

      console.log('✅ تم رفع الرسم النهائي بنجاح:', data)
      const { data: urlData } = supabase.storage
        .from('episode-assets')
        .getPublicUrl(data.path)
      
      console.log('🔗 رابط الرسم النهائي:', urlData.publicUrl)
      return { publicUrl: urlData.publicUrl, path: data.path }
    } catch (error) {
      console.error('❌ خطأ غير متوقع في رفع الرسم النهائي:', error)
      return null
    }
  },

  /**
   * Delete final art image by path
   */
  async deleteFinalArtImage(path: string): Promise<boolean> {
    try {
      if (!path) return true
      const { error } = await supabase.storage
        .from('episode-assets')
        .remove([path])
      return !error
    } catch {
      return false
    }
  },

  /**
   * List all final art images for a scene
   */
  async listFinalArtForScene(episodeId: string, sceneId: string): Promise<{path: string}[]> {
    try {
      const { data, error } = await supabase.storage
        .from('episode-assets')
        .list(`episodes/${episodeId}/final-art`, {
          search: sceneId
        })
      
      if (error) {
        console.error('❌ Failed to list final art images:', error)
        return []
      }
      
      return data.map(item => ({
        path: `episodes/${episodeId}/final-art/${item.name}`
      }))
    } catch (error) {
      console.error('❌ Error listing final art images:', error)
      return []
    }
  },

  /**
   * Get public URL for final art path
   */
  getFinalArtPublicUrl(path: string): string | null {
    if (!path) return null
    const { data } = supabase.storage
      .from('episode-assets')
      .getPublicUrl(path)
    return data.publicUrl
  }
}
