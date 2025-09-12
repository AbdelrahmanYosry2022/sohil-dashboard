// Import the supabase client from our centralized location
import { supabase } from './supabase/client';
import type { Database } from '../types/supabase'

// Authentication functions
export const authOperations = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Sign in failed:', error.message)
        return { user: null, error: error.message }
      }
      
      console.log('✅ Sign in successful:', data.user?.email)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { user: null, error: 'حدث خطأ أثناء تسجيل الدخول' }
    }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Sign up failed:', error.message)
        return { user: null, error: error.message }
      }
      
      console.log('✅ Sign up successful:', data.user?.email)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('❌ Sign up error:', error)
      return { user: null, error: 'حدث خطأ أثناء إنشاء الحساب' }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out failed:', error.message)
        return { error: error.message }
      }
      
      console.log('✅ Sign out successful')
      return { error: null }
    } catch (error) {
      console.error('❌ Sign out error:', error)
      return { error: 'حدث خطأ أثناء تسجيل الخروج' }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ Get user failed:', error.message)
        return { user: null, error: error.message }
      }
      
      return { user, error: null }
    } catch (error) {
      console.error('❌ Get user error:', error)
      return { user: null, error: 'حدث خطأ أثناء جلب بيانات المستخدم' }
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const { user } = await authOperations.getCurrentUser()
    return !!user
  }
}

// Updated authentication check for storage operations
export const ensureAuthenticated = async (): Promise<{ isAuthenticated: boolean; error?: string }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.warn('🔐 Authentication required:', error?.message || 'No active session')
      return { 
        isAuthenticated: false, 
        error: error?.message || 'يجب تسجيل الدخول أولاً' 
      }
    }
    
    console.log('✅ User authenticated:', user.email)
    return { isAuthenticated: true }
  } catch (error) {
    console.error('❌ Authentication check failed:', error)
    return { 
      isAuthenticated: false, 
      error: 'حدث خطأ في التحقق من المصادقة' 
    }
  }
}

// Types from the actual database schema
export type Episode = Database['public']['Tables']['episodes']['Row']
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']
export type EpisodeUpdate = Database['public']['Tables']['episodes']['Update']

export type EpisodeContent = Database['public']['Tables']['episode_content']['Row']
export type EpisodeContentInsert = Database['public']['Tables']['episode_content']['Insert']
export type EpisodeContentUpdate = Database['public']['Tables']['episode_content']['Update']

// Define proper types for content objects
type SceneContent = {
  sceneId: string
  title: string
  content: string
  duration: number
  order: number
}

type AudioContent = {
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

type StoryboardFrame = {
  frameId: string
  title: string
  description?: string
  thumbnail: string
  duration: number
  notes?: string
  order: number
  sceneId?: string
}

type StoryboardFolders = {
  type: 'folders'
  folders: Array<{
    id: string
    name: string
    parentId: string | null
    order: number
  }>
}

// Helper functions for database operations
export const episodeOperations = {
  // Get all episodes
  async getAll(): Promise<Episode[]> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get episode by ID
  async getById(id: string): Promise<Episode> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new episode
  async create(episode: EpisodeInsert): Promise<Episode> {
    const { data, error } = await supabase
      .from('episodes')
      .insert(episode)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update episode
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

  // Delete episode
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get episode with content
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

export const contentOperations = {
  // Get all content
  async getAll(): Promise<EpisodeContent[]> {
    const { data, error } = await supabase
      .from('episode_content')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get content by ID
  async getById(id: string): Promise<EpisodeContent> {
    const { data, error } = await supabase
      .from('episode_content')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get content for an episode
  async getByEpisodeId(episodeId: string): Promise<EpisodeContent[]> {
    const { data, error } = await supabase
      .from('episode_content')
      .select('*')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get content for an episode by type
  async getByEpisodeIdAndType(episodeId: string, type: EpisodeContent['type']): Promise<EpisodeContent[]> {
    const { data, error } = await supabase
      .from('episode_content')
      .select('*')
      .eq('episode_id', episodeId)
      .eq('type', type)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Create content for an episode
  async create(content: EpisodeContentInsert): Promise<EpisodeContent> {
    const { data, error } = await supabase
      .from('episode_content')
      .insert(content)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update content
  async update(id: string, updates: EpisodeContentUpdate): Promise<EpisodeContent> {
    const { data, error } = await supabase
      .from('episode_content')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete content
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('episode_content')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Upsert content
  async upsert(content: EpisodeContentInsert): Promise<EpisodeContent> {
    const { data, error } = await supabase
      .from('episode_content')
      .upsert(content)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Specialized operations for each tab type
export const tabOperations = {
  // Text Tab Operations
  text: {
    async saveScenes(episodeId: string, scenes: Array<{
      id: string;
      title: string;
      content: string;
      duration?: number;
    }>) {
      try {
        // First, remove existing text content for this episode
        const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'text')
        const deletePromises = existing.map(item => contentOperations.delete(item.id))
        await Promise.all(deletePromises)

        // Save new scenes
        const createPromises = scenes.map((scene, index) =>
          contentOperations.create({
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

        return await Promise.all(createPromises)
      } catch (error) {
        console.error('Failed to save scenes:', error)
        throw new Error('فشل في حفظ المشاهد. يرجى المحاولة مرة أخرى')
      }
    },

    async loadScenes(episodeId: string) {
      try {
        const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'text')
        return data
          .map(item => {
            const content = item.content as {
              sceneId?: string;
              title?: string;
              content?: string;
              duration?: number;
              order?: number;
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
  },

  // Audio Tab Operations
  audio: {
    async saveAudioFiles(episodeId: string, audioFiles: AudioContent[]) {
      try {
        // First, remove existing audio content for this episode
        const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'audio')
        const deletePromises = existing.map(item => contentOperations.delete(item.id))
        await Promise.all(deletePromises)

        // Save new audio files
        const createPromises = audioFiles.map(audioFile =>
          contentOperations.create({
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

        return await Promise.all(createPromises)
      } catch (error) {
        console.error('Failed to save audio files:', error)
        throw new Error('فشل في حفظ ملفات الصوت. يرجى المحاولة مرة أخرى')
      }
    },

    async loadAudioFiles(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'audio')
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
    }
  },

  // Storyboard Tab Operations
  storyboard: {
    async saveFrames(episodeId: string, frames: StoryboardFrame[]) {
      // Remove only existing frame items (preserve folders record)
      const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'storyboard')
      const deletePromises = existing
        .filter(item => {
          const content = item.content as StoryboardFrame | StoryboardFolders | null
          return content && 'frameId' in content
        })
        .map(item => contentOperations.delete(item.id))
      
      await Promise.all(deletePromises)
      
      // Save new frames
      const createPromises = frames.map((frame, index) =>
        contentOperations.create({
          episode_id: episodeId,
          type: 'storyboard',
          content: {
            ...frame,
            order: index + 1
          }
        })
      )
      
      return Promise.all(createPromises)
    },

    async loadFrames(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'storyboard')
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
            duration: content.duration || 0,
            notes: content.notes || '',
            order: content.order || 0,
            sceneId: content.sceneId
          }
        })
        .filter((frame): frame is NonNullable<typeof frame> => frame !== null)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    },

    async saveFolders(episodeId: string, folders: any[]) {
      console.log('💾 جاري حفظ المجلدات...', { episodeId, folders });
      // Replace existing folders record
      const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'storyboard')
      for (const item of existing) {
        const c = item.content as any
        if (c && c.type === 'folders') {
          await contentOperations.delete(item.id)
        }
      }

      // Always save folders data, even if empty array (to preserve deletions)
      const folderData = folders.map((folder, idx) => ({
        folderId: folder.id,
        name: folder.name,
        order: typeof folder.order === 'number' ? folder.order : idx,
        scenes: folder.scenes
      }))

      return contentOperations.create({
        episode_id: episodeId,
        type: 'storyboard',
        content: {
          type: 'folders',
          folders: folderData
        }
      })
      console.log('✅ تم حفظ المجلدات بنجاح.');
    },

    async loadFolders(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'storyboard')
      const foldersItem = data.find(item => {
        const content = item.content as StoryboardFolders | null
        return content?.type === 'folders'
      })
      
      if (!foldersItem) return []
      
      const content = foldersItem.content as StoryboardFolders
      return content.folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        order: folder.order,
        scenes: [] // Initialize empty scenes array, to be populated by the client if needed
      }))
    }
  },

  // Drawing Tab Operations
  drawing: {
    async saveScenes(episodeId: string, folders: any[]) {
      // First, remove existing drawing content for this episode
      const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'drawing')
      for (const item of existing) {
        await contentOperations.delete(item.id)
      }

      // Save folders and scenes
      const promises = folders.map(folder =>
        contentOperations.create({
          episode_id: episodeId,
          type: 'drawing',
          content: {
            folderId: folder.id,
            name: folder.name,
            order: folder.order,
            scenes: folder.scenes.map((scene: any) => ({
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

      return Promise.all(promises)
    },

    async loadScenes(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'drawing')
      return data.map(item => {
        const content = item.content as {
          folderId?: string;
          name?: string;
          order?: number;
          scenes?: any[];
        } | null;
        
        if (!content) {
          return {
            id: item.id,
            name: '',
            order: 0,
            scenes: []
          };
        }
        
        return {
          id: content.folderId || item.id,
          name: content.name || '',
          order: content.order || 0,
          scenes: content.scenes || []
        };
      }).sort((a, b) => a.order - b.order)
    },

    async saveVersions(episodeId: string, sceneId: string, versions: any[]) {
      return contentOperations.create({
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
      })
    },

    async saveComments(episodeId: string, sceneId: string, comments: any[]) {
      return contentOperations.create({
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
      })
    }
  }
}

// Storage operations for managing buckets and files
export const storageOperations = {
  // Check storyboard bucket existence (client-safe)
  async createStoryboardBucket(): Promise<boolean> {
    try {
      console.log('🔍 التحقق من توفر مجلد storyboard-images بطريقة آمنة للعميل...')

      // بدلاً من listBuckets (صلاحية إدارية)، نجرب سرد محتويات الجذر داخل البوكيت.
      // هذا ينجح إذا كان البوكيت موجود وسياسة SELECT مفعلة (وهي عامة لدينا)،
      // وسيفشل فقط إن كان البوكيت غير موجود فعلاً.
      const { data, error } = await supabase.storage
        .from('storyboard-images')
        .list('', { limit: 1 })

      if (error) {
        const msg = (error as any)?.message?.toString()?.toLowerCase() || ''
        // لو الخطأ بسبب عدم وجود البوكيت
        if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('404')) {
          console.warn('⚠️ لم يتم العثور على مجلد القصص المصورة storyboard-images. يرجى التأكد من:')
          console.warn('1. إنشاء مجلد باسم storyboard-images في قسم Storage في لوحة تحكم Supabase')
          console.warn('2. تفعيل سياسات الأمان الخاصة بالمجموعة (قراءة عامة + صلاحيات للمصادقين)')
          return false
        }
        // أخطاء صلاحيات أو غيرها: لا نُفشل التهيئة لأن البوكيت قد يكون موجوداً
        console.warn('ℹ️ لا يمكن التحقق من المحتويات (قد تكون صلاحيات). سنستمر باعتبار البوكيت متاحاً.')
        return true
      }

      // نجاح السرد حتى لو بدون ملفات يعني البوكيت موجود
      console.log('✅ مجلد القصص المصورة storyboard-images متاح')
      return true
    } catch (error) {
      console.error('❌ خطأ غير متوقع في التحقق من مجلد القصص المصورة:', error)
      // Continue anyway to allow the app to function, but log the error
      return true
    }
  },

  // Upload storyboard image to episode folder
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
      const isAuthenticated = await ensureAuthenticated()
      if (!isAuthenticated) {
        console.error('❌ المستخدم غير مصادق - يجب تسجيل الدخول أولاً')
        alert('يجب تسجيل الدخول أولاً لرفع الصور')
        return null
      }

      // Create file path: episodes/{episodeId}/storyboard/{fileName}
      const filePath = `episodes/${episodeId}/storyboard/${fileName}`
      console.log('📁 مسار الملف:', filePath)

      const { data, error } = await supabase.storage
        .from('storyboard-images')
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
        .from('storyboard-images')
        .getPublicUrl(data.path)

      console.log('🔗 رابط الصورة العام:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      console.error('❌ خطأ غير متوقع في رفع الصورة:', error)
      return null
    }
  },

  // Delete storyboard image
  async deleteStoryboardImage(episodeId: string, fileName: string): Promise<boolean> {
    try {
      // Ensure user is authenticated
      const isAuthenticated = await ensureAuthenticated()
      if (!isAuthenticated) {
        console.error('❌ المستخدم غير مصادق - يجب تسجيل الدخول أولاً')
        alert('يجب تسجيل الدخول أولاً لحذف الصور')
        return false
      }

      const filePath = `episodes/${episodeId}/storyboard/${fileName}`
      
      const { error } = await supabase.storage
        .from('storyboard-images')
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

  // List all storyboard images for an episode
  async listStoryboardImages(episodeId: string): Promise<string[]> {
    try {
      const folderPath = `episodes/${episodeId}/storyboard`
      
      const { data, error } = await supabase.storage
        .from('storyboard-images')
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

  // Get public URL for storyboard image
  getStoryboardImageUrl(episodeId: string, fileName: string): string {
    const filePath = `episodes/${episodeId}/storyboard/${fileName}`
    const { data } = supabase.storage
      .from('storyboard-images')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  },

  // Initialize storage on app startup
  async initializeStorage(): Promise<boolean> {
    try {
      console.log('Initializing Supabase Storage...')
      
      // Ensure user is authenticated
      console.log('🔐 التحقق من المصادقة عند التهيئة...')
      const isAuthenticated = await ensureAuthenticated()
      if (!isAuthenticated) {
        console.warn('⚠️ المستخدم غير مصادق - سيتم تهيئة Storage عند تسجيل الدخول')
        return false
      }
      
      const bucketReady = await this.createStoryboardBucket()
      if (bucketReady) {
        console.log('✅ Storyboard storage is ready')
      } else {
        console.warn('⚠️ Bucket storyboard-images غير متاح حالياً. لن يمنع هذا تشغيل التطبيق، لكن رفع الصور سيفشل حتى إنشائه.')
      }
      return bucketReady
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error)
      return false
    }
  }
}

// Statistics and overview operations
export const statisticsOperations = {
  async getEpisodeStats(episodeId: string) {
    const allContent = await contentOperations.getByEpisodeId(episodeId)

    const stats = {
      text: { scenes: 0, words: 0, characters: 0, estimatedMinutes: 0 },
      audio: { files: 0, totalDuration: 0, totalSize: 0 },
      storyboard: { frames: 0, scenes: 0 },
      drawing: { scenes: 0, comments: 0, approved: 0 }
    }

    for (const item of allContent) {
      const content = item.content as any; // Using any here since content structure varies by type
      
      switch (item.type) {
        case 'text':
          stats.text.scenes++
          if (content?.content && typeof content.content === 'string') {
            const textContent = content.content;
            const wordCount = textContent.trim().split(/\s+/).length;
            stats.text.words += wordCount;
            stats.text.characters += textContent.length;
            stats.text.estimatedMinutes = Math.ceil(stats.text.words / 150);
          }
          break

        case 'audio':
          stats.audio.files++
          if (content) {
            stats.audio.totalDuration += typeof content.duration === 'number' ? content.duration : 0;
            stats.audio.totalSize += typeof content.size === 'number' ? content.size : 0;
          }
          break

        case 'storyboard':
          if (content?.type === 'folders' && Array.isArray(content.folders)) {
            stats.storyboard.scenes += content.folders.length;
          } else if (content) {
            stats.storyboard.frames++
          }
          break

        case 'drawing':
          if (Array.isArray(content?.scenes)) {
            stats.drawing.scenes += content.scenes.length;
            content.scenes.forEach((scene: any) => {
              if (typeof scene.comments === 'number') {
                stats.drawing.comments += scene.comments;
              }
              if (scene.status === 'approved') {
                stats.drawing.approved++;
              }
            });
          }
          break
      }
    }

    return stats
  }
}
