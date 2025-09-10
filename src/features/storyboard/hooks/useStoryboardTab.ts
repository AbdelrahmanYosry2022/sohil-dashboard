import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { storyboardApi, storyboardStorage } from '../api'
import type { StoryboardFrame, Scene, Folder } from '../types'

export const useStoryboardTab = () => {
  const { id: episodeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // navigation state
  const [page, setPage] = useState<'library' | 'folder' | 'storyboard' | 'frame'>('library')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null)

  // data state
  const [folders, setFolders] = useState<Folder[]>([])
  const [frames, setFrames] = useState<StoryboardFrame[]>([])

  // zoom/pan for frame editor
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)

  // dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFrame, setEditingFrame] = useState<StoryboardFrame | null>(null)
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null)
  
  // modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  const [isSceneEditOpen, setIsSceneEditOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  
  // form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    notes: '',
    image: null as File | null
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load saved storyboard data from Supabase when episode changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (!episodeId) return
      try {
        const savedFolders = await storyboardApi.loadFolders(episodeId)
        
        const mapped = (savedFolders || []).map((f: any) => ({
          id: f.folderId || f.id,
          name: f.name || '',
          scenes: (f.scenes || []).map((s: any) => ({
            id: s.sceneId || s.id,
            title: s.title || '',
            thumbnail: s.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtmF2LTZh9ivPC90ZXh0Pjwvc3ZnPg==',
            description: s.description || ''
          }))
        }))
        
        setFolders(mapped)

        const savedFrames = await storyboardApi.loadFrames(episodeId)
        if (savedFrames && savedFrames.length > 0) {
          setFrames(savedFrames as unknown as StoryboardFrame[])
        }
        
        // Ensure there is a selected folder/scene to continue navigation UX
        if (!activeFolderId && mapped.length > 0) {
          setActiveFolderId(mapped[0].id)
        }
        if (!activeSceneId && mapped.length > 0 && mapped[0].scenes.length > 0) {
          const firstScene = mapped[0].scenes[0]
          setActiveSceneId(firstScene.sceneId || firstScene.id)
        }
      } catch (e) {
        console.error('فشل تحميل إطارات الستوري بورد من قاعدة البيانات:', e)
      }
    }
    loadInitialData()
  }, [episodeId, activeFolderId, activeSceneId])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      notes: '',
      image: null
    })
    setImagePreview(null)
    setIsUploading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !episodeId) return

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      alert('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.')
      e.target.value = '' // Clear the input
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.')
      e.target.value = '' // Clear the input
      return
    }

    setFormData({ ...formData, image: file })
    
    // Create preview using FileReader for immediate display
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCreateFrame = (afterIndex?: number) => {
    setInsertAfterIndex(afterIndex ?? null)
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const handleEditFrame = (frame: StoryboardFrame) => {
    setEditingFrame({
      ...frame,
      duration: typeof frame.duration === 'string' ? parseFloat(frame.duration) || 0 : frame.duration
    })
    setFormData({
      title: frame.title,
      description: frame.description,
      duration: frame.duration.toString(),
      notes: frame.notes,
      image: null
    })
    setImagePreview(frame.thumbnail)
    setIsEditDialogOpen(true)
  }

  const handleDeleteFrame = async (frameId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإطار؟')) {
      const frameToDelete = frames.find(frame => frame.id === frameId)
      
      // Delete image from Supabase Storage if it's not a default image
      if (frameToDelete && episodeId && frameToDelete.thumbnail && 
          !frameToDelete.thumbnail.startsWith('data:image/svg+xml')) {
        const fileName = frameToDelete.thumbnail.split('/').pop()
        if (fileName) {
          await storyboardStorage.deleteStoryboardImage(episodeId, fileName)
        }
      }
      
      let updated = frames.filter(frame => frame.id !== frameId)

      // إعادة ترقيم الإطارات داخل المشهد الحالي فقط
      const activeScene = folders.find(f => f.id === activeFolderId)?.scenes.find(s => s.id === activeSceneId)
      const sceneName = activeScene?.title || 'المشهد'

      const sceneFrames = updated.filter(f => f.sceneId === activeSceneId)
      const otherFrames = updated.filter(f => f.sceneId !== activeSceneId)

      const renumbered = sceneFrames.map((frame, index) => ({
        ...frame,
        frameId: frame.frameId || frame.id, // Ensure frameId is always set
        title: `${sceneName} - إطار ${String(index + 1).padStart(2, '0')}`,
        order: index + 1
      }))
      updated = [...renumbered, ...otherFrames]
      
      setFrames(updated)
      // Persist changes
      try {
        if (episodeId) {
          await storyboardApi.saveFrames(episodeId, updated)
        }
      } catch (e) {
        console.error('فشل حفظ الإطارات بعد الحذف:', e)
      }
    }
  }

  const submitCreateFrame = async () => {
    if (!formData.description.trim() || !episodeId) return

    let thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtmF2LTZh9ivPC90ZXh0Pjwvc3ZnPg=='
    
    // Upload image to Supabase Storage if provided
    if (formData.image) {
      try {
        setIsUploading(true)
        console.log('🔄 بدء رفع الصورة...', formData.image.name)
        const fileName = `frame-${Date.now()}-${formData.image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploadedUrl = await storyboardStorage.uploadStoryboardImage(episodeId, fileName, formData.image)
        
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl
          console.log('✅ تم رفع الصورة بنجاح:', uploadedUrl)
        } else {
          console.error('❌ فشل في رفع الصورة')
          alert('فشل في رفع الصورة. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت.')
          setIsUploading(false)
          return
        }
      } catch (error) {
        console.error('❌ خطأ في رفع الصورة:', error)
        alert('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.')
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    // Create new frame with proper frameId and duration type
    const newFrame: StoryboardFrame = {
      id: `sb-f-${Date.now()}`,
      frameId: `sb-f-${Date.now()}`,
      title: formData.title.trim() || `إطار جديد ${frames.length + 1}`,
      description: formData.description.trim(),
      thumbnail: thumbnailUrl,
      duration: formData.duration ? Number(formData.duration) : 2,
      notes: formData.notes.trim(),
      order: insertAfterIndex !== null ? insertAfterIndex + 1 : frames.length + 1,
      sceneId: activeSceneId || undefined
    }

    let newFrames = [...frames]
    newFrames.push(newFrame)

    // إعادة ترقيم الإطارات وتطبيق التسمية التلقائية
    const activeScene = folders.find(f => f.id === activeFolderId)?.scenes.find(s => s.id === activeSceneId)
    const sceneName = activeScene?.title || 'المشهد'
    
    const sceneFrames = newFrames.filter(f => f.sceneId === activeSceneId)
    const otherFrames = newFrames.filter(f => f.sceneId !== activeSceneId)
    const renumbered = sceneFrames.map((frame, index) => ({
      ...frame,
      title: `${sceneName} - إطار ${String(index + 1).padStart(2, '0')}`,
      order: index + 1
    }))
    newFrames = [...renumbered, ...otherFrames]

    setFrames(newFrames)
    // Persist new frames to Supabase
    try {
      await storyboardApi.saveFrames(episodeId, newFrames)
    } catch (e) {
      console.error('فشل حفظ الإطارات بعد الإضافة:', e)
    }
    setIsCreateDialogOpen(false)
    setInsertAfterIndex(null)
    resetForm()
  }

  const submitEditFrame = async () => {
    if (!editingFrame || !formData.title.trim() || !episodeId) return

    let thumbnailUrl = editingFrame.thumbnail
    
    // Upload new image to Supabase Storage if provided
    if (formData.image) {
      try {
        setIsUploading(true)
        console.log('🔄 بدء رفع الصورة الجديدة...', formData.image.name)
        const fileName = `frame-${Date.now()}-${formData.image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploadedUrl = await storyboardStorage.uploadStoryboardImage(episodeId, fileName, formData.image)
        
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl
          console.log('✅ تم رفع الصورة الجديدة بنجاح:', uploadedUrl)
        } else {
          console.error('❌ فشل في رفع الصورة الجديدة')
          alert('فشل في رفع الصورة الجديدة. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت.')
          setIsUploading(false)
          return
        }
      } catch (error) {
        console.error('❌ خطأ في رفع الصورة الجديدة:', error)
        alert('حدث خطأ أثناء رفع الصورة الجديدة. يرجى المحاولة مرة أخرى.')
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    const updated = frames.map(frame =>
      frame.id === editingFrame.id
        ? {
            ...frame,
            title: formData.title.trim(),
            description: formData.description.trim(),
            duration: formData.duration ? Number(formData.duration) : 2,
            notes: formData.notes.trim(),
            thumbnail: thumbnailUrl
          }
        : frame
    )
    setFrames(updated)
    // Persist changes
    try {
      await storyboardApi.saveFrames(episodeId, updated)
    } catch (e) {
      console.error('فشل حفظ الإطارات بعد التعديل:', e)
    }
    setIsEditDialogOpen(false)
    setEditingFrame(null)
    resetForm()
  }

  // navigation helpers
  const openFolder = (folderId: string) => { setActiveFolderId(folderId); setPage('folder') }
  const openScene = (sceneId: string) => { setActiveSceneId(sceneId); setPage('storyboard') }
  const openFrame = (frameId: string) => { 
    navigate(`/episodes/${episodeId}/storyboard/frame/${frameId}`)
  }

  // Folder management functions
  const handleCreateFolder = (data: { name: string; description?: string }) => {
    const newFolder: Folder = {
      id: `sb-f-${Date.now()}`,
      name: data.name,
      scenes: []
    }
    setFolders(prev => [...prev, newFolder])
  }

  // Scene management functions
  const handleCreateScene = async (data: { name: string; description?: string }) => {
    if (!activeFolderId) return
    console.log('🔄 جاري إنشاء مشهد جديد...', data);
    const newScene: Scene = {
      id: `sb-s-${Date.now()}`,
      title: data.name,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtmF2LTZh9ivPC90ZXh0Pjwvc3ZnPg==',
      description: data.description || ''
    }
    
    let updated: Folder[] = []
    setFolders(prev => {
      updated = prev.map(folder => 
        folder.id === activeFolderId 
          ? { ...folder, scenes: [...folder.scenes, newScene] }
          : folder
      )
      return updated
    })
    console.log('📊 حالة المجلدات بعد إضافة المشهد الجديد:', updated);
    
    // تحديث المشهد النشط ليعرض المشهد الجديد الذي تم إنشاؤه
    setActiveSceneId(newScene.id)
    setPage('storyboard')
    
    try {
      if (episodeId) await storyboardApi.saveFolders(episodeId, updated)
    } catch (e) { console.error('فشل حفظ المشاهد:', e) }
  }

  // Scene edit/delete handlers
  const handleEditScene = (scene: Scene) => {
    setEditingScene(scene)
    setIsSceneEditOpen(true)
  }

  const saveEditedScene = async () => {
    if (!editingScene) return
    let updated: Folder[] = []
    setFolders(prev => {
      updated = prev.map(folder =>
        folder.id === activeFolderId
          ? {
              ...folder,
              scenes: folder.scenes.map(s => s.id === editingScene.id ? { ...s, ...editingScene } : s)
            }
          : folder
      )
      return updated
    })
    try { if (episodeId) await storyboardApi.saveFolders(episodeId, updated) } catch (e) { console.error('فشل حفظ تعديل المشهد:', e) }
    setIsSceneEditOpen(false)
    setEditingScene(null)
  }

  const handleDeleteScene = async (sceneId: string) => {
    if (!activeFolderId) return
    const confirmed = window.confirm('سيتم حذف المشهد وجميع الإطارات بداخله. هل أنت متأكد؟')
    if (!confirmed) return

    // Delete frames thumbnails from storage when applicable
    const framesToDelete = frames.filter(f => f.sceneId === sceneId)
    if (episodeId) {
      for (const f of framesToDelete) {
        if (f.thumbnail && !f.thumbnail.startsWith('data:image/svg+xml')) {
          const fileName = f.thumbnail.split('/').pop()
          if (fileName) {
            try { await storyboardStorage.deleteStoryboardImage(episodeId, fileName) } catch {}
          }
        }
      }
    }

    // Remove frames for this scene
    const remainingFrames = frames.filter(f => f.sceneId !== sceneId)
    setFrames(remainingFrames)
    // Persist frames update
    try { if (episodeId) await storyboardApi.saveFrames(episodeId, remainingFrames) } catch (e) { console.error(e) }

    // Remove the scene from folder
    let updated: Folder[] = []
    setFolders(prev => {
      updated = prev.map(folder => 
        folder.id === activeFolderId
          ? { ...folder, scenes: folder.scenes.filter(s => s.id !== sceneId) }
          : folder
      )
      return updated
    })
    try { if (episodeId) await storyboardApi.saveFolders(episodeId, updated) } catch (e) { console.error('فشل حفظ حذف المشهد:', e) }

    // Reset active scene if needed
    if (activeSceneId === sceneId) {
      setActiveSceneId(null)
      setPage('folder')
    }
  }

  return {
    // State
    page,
    viewMode,
    activeFolderId,
    activeSceneId,
    activeFrameId,
    folders,
    frames,
    zoom,
    pan,
    viewerRef,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingFrame,
    insertAfterIndex,
    isFolderModalOpen,
    isSceneModalOpen,
    isSceneEditOpen,
    editingScene,
    formData,
    imagePreview,
    isUploading,
    episodeId,
    
    // Actions
    setPage,
    setViewMode,
    setActiveFolderId,
    setActiveSceneId,
    setActiveFrameId,
    setZoom,
    setPan,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsFolderModalOpen,
    setIsSceneModalOpen,
    setIsSceneEditOpen,
    setEditingScene,
    setFormData,
    setImagePreview,
    
    // Functions
    resetForm,
    handleImageUpload,
    handleCreateFrame,
    handleEditFrame,
    handleDeleteFrame,
    submitCreateFrame,
    submitEditFrame,
    openFolder,
    openScene,
    openFrame,
    handleCreateFolder,
    handleCreateScene,
    handleEditScene,
    saveEditedScene,
    handleDeleteScene
  }
}