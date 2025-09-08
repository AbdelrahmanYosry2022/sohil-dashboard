import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

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
export const ensureAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('🔐 No user authenticated - storage operations require login')
      return false
    }
    
    console.log('✅ User authenticated:', user.email)
    return true
  } catch (error) {
    console.error('❌ Authentication check failed:', error)
    return false
  }
}

// Types from the actual database schema
export type Episode = Database['public']['Tables']['episodes']['Row']
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']
export type EpisodeUpdate = Database['public']['Tables']['episodes']['Update']

export type EpisodeContent = Database['public']['Tables']['episode_content']['Row']
export type EpisodeContentInsert = Database['public']['Tables']['episode_content']['Insert']
export type EpisodeContentUpdate = Database['public']['Tables']['episode_content']['Update']

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
    async saveScenes(episodeId: string, scenes: any[]) {
      // First, remove existing text content for this episode
      const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'text')
      for (const item of existing) {
        await contentOperations.delete(item.id)
      }

      // Save new scenes
      const promises = scenes.map(scene =>
        contentOperations.create({
          episode_id: episodeId,
          type: 'text',
          content: {
            sceneId: scene.id,
            title: scene.title,
            content: scene.content,
            duration: scene.duration,
            order: scenes.indexOf(scene) + 1
          }
        })
      )

      return Promise.all(promises)
    },

    async loadScenes(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'text')
      return data.map(item => ({
        id: item.content.sceneId || item.id,
        title: item.content.title || '',
        content: item.content.content || '',
        duration: item.content.duration
      })).sort((a, b) => (item => item.content.order || 0))
    }
  },

  // Audio Tab Operations
  audio: {
    async saveAudioFiles(episodeId: string, audioFiles: any[]) {
      // First, remove existing audio content for this episode
      const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'audio')
      for (const item of existing) {
        await contentOperations.delete(item.id)
      }

      // Save new audio files
      const promises = audioFiles.map(audioFile =>
        contentOperations.create({
          episode_id: episodeId,
          type: 'audio',
          content: {
            fileId: audioFile.id,
            name: audioFile.name,
            url: audioFile.url,
            duration: audioFile.duration,
            size: audioFile.size,
            type: audioFile.type,
            sceneId: audioFile.sceneId,
            notes: audioFile.notes,
            createdAt: audioFile.createdAt
          }
        })
      )

      return Promise.all(promises)
    },

    async loadAudioFiles(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'audio')
      return data.map(item => ({
        id: item.content.fileId || item.id,
        name: item.content.name || '',
        url: item.content.url || '',
        duration: item.content.duration || 0,
        size: item.content.size || 0,
        type: item.content.type || '',
        sceneId: item.content.sceneId,
        notes: item.content.notes || '',
        createdAt: item.content.createdAt ? new Date(item.content.createdAt) : new Date()
      }))
    }
  },

  // Storyboard Tab Operations
  storyboard: {
    async saveFrames(episodeId: string, frames: any[]) {
      // Remove only existing frame items (preserve folders record)
      const existing = await contentOperations.getByEpisodeIdAndType(episodeId, 'storyboard')
      for (const item of existing) {
        const c = item.content as any
        if (c && (c.frameId || (!c.type || c.type !== 'folders'))) {
          // delete items that look like frames
          await contentOperations.delete(item.id)
        }
      }

      // Save new frames
      const promises = frames.map(frame =>
        contentOperations.create({
          episode_id: episodeId,
          type: 'storyboard',
          content: {
            frameId: frame.id,
            title: frame.title,
            description: frame.description,
            thumbnail: frame.thumbnail,
            duration: frame.duration,
            notes: frame.notes,
            order: frame.order,
            sceneId: frame.sceneId || frame.scene_id || null
          }
        })
      )

      return Promise.all(promises)
    },

    async loadFrames(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'storyboard')
      return data.map(item => ({
        id: item.content.frameId || item.id,
        title: item.content.title || '',
        description: item.content.description || '',
        thumbnail: item.content.thumbnail || '',
        duration: item.content.duration || '2s',
        notes: item.content.notes || '',
        order: item.content.order || 1,
        sceneId: item.content.sceneId || null
      })).sort((a, b) => a.order - b.order)
    },

    async saveFolders(episodeId: string, folders: any[]) {
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
    },

    async loadFolders(episodeId: string) {
      const data = await contentOperations.getByEpisodeIdAndType(episodeId, 'storyboard')
      const folderItem = data.find(item => item.content.type === 'folders')
      return folderItem ? folderItem.content.folders || [] : null
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
      return data.map(item => ({
        id: item.content.folderId || item.id,
        name: item.content.name || '',
        order: item.content.order || 0,
        scenes: item.content.scenes || []
      })).sort((a, b) => a.order - b.order)
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
      console.log('🔍 Checking Supabase connection...')
      
      // First, test basic connection
      const { data: testData, error: testError } = await supabase.from('episodes').select('count').limit(1)
      if (testError) {
        console.error('❌ Supabase connection failed:', testError)
        return false
      }
      console.log('✅ Supabase connection successful')
      
      // Check if bucket already exists
      console.log('📋 Listing existing buckets...')
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('❌ Error listing buckets:', listError)
        console.log('💡 This might be a permissions issue. Check if Storage is enabled in your Supabase project.')
        return false
      }

      console.log('📦 Existing buckets:', buckets?.map(b => b.name) || [])
      const bucketExists = buckets?.some(bucket => bucket.name === 'storyboard-images')
      
      if (bucketExists) {
        console.log('✅ Storyboard bucket already exists')
        return true
      }

      // Client (anon key) should NOT attempt to create buckets due to RLS/permissions.
      // Guide the user to create the bucket from the dashboard or SQL, then return false for now.
      console.warn('⚠️ Bucket storyboard-images not found. Please create it from the Supabase dashboard or run the provided SQL policies. لن يتم إنشاؤه من الواجهة العميلية.')
      console.warn('📝 See STORAGE_SETUP_GUIDE.md or storage-policies.sql/apply-storage-policies.sql in the repo.')
      return false
    } catch (error) {
      console.error('❌ Unexpected error creating storyboard bucket:', error)
      return false
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

      // Ensure bucket exists (client-safe check)
      console.log('🔍 التحقق من وجود البوكيت...')
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      if (listError) {
        console.error('❌ Error listing buckets before upload:', listError)
        alert('تعذر التحقق من مخزن الصور. يرجى التأكد من تمكين Storage في Supabase.')
        return null
      }
      const exists = buckets?.some(b => b.name === 'storyboard-images')
      if (!exists) {
        console.error('❌ Bucket storyboard-images غير موجود')
        alert('مخزن الصور storyboard-images غير موجود. قم بإنشائه من لوحة تحكم Supabase واجعله Public ثم أعد المحاولة. راجع STORAGE_SETUP_GUIDE.md')
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
        console.error('تفاصيل الخطأ:', { message: error.message, statusCode: error.statusCode })
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
      switch (item.type) {
        case 'text':
          stats.text.scenes++
          if (item.content.content) {
            const content = item.content.content
            stats.text.words += content.trim().split(/\s+/).length
            stats.text.characters += content.length
            stats.text.estimatedMinutes += Math.ceil(stats.text.words / 150)
          }
          break

        case 'audio':
          stats.audio.files++
          stats.audio.totalDuration += item.content.duration || 0
          stats.audio.totalSize += item.content.size || 0
          break

        case 'storyboard':
          if (item.content.type === 'folders') {
            stats.storyboard.scenes += item.content.folders?.length || 0
          } else {
            stats.storyboard.frames++
          }
          break

        case 'drawing':
          if (item.content.scenes) {
            stats.drawing.scenes += item.content.scenes.length
            item.content.scenes.forEach((scene: any) => {
              stats.drawing.comments += scene.comments || 0
              if (scene.status === 'approved') stats.drawing.approved++
            })
          }
          break
      }
    }

    return stats
  }
}
