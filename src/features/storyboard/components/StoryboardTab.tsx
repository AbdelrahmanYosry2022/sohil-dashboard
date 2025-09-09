import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../../components/ui/dialog'
import { UnifiedModal } from '../../../components/ui/unified-modal'
import { storageOperations, tabOperations } from '../../../lib/supabase'
import type { StoryboardFrame, Scene, Folder } from '../types'
import {
  Plus,
  Edit,
  Trash2,
  Grid,
  List,
  FolderOpen,
  ArrowRight,
  ChevronLeft,
  ZoomOut,
  ZoomIn,
  Clock,
  MessageCircle
} from 'lucide-react'
import TabHeader from '../../../components/TabHeader'

// Types are imported from ../types

interface StoryboardTabProps {
  episodeId: string;
}

export default function StoryboardTab({ episodeId }: StoryboardTabProps) {
  const navigate = useNavigate()
  
  // navigation state like DrawingTab
  const [page, setPage] = useState<'library' | 'folder' | 'storyboard' | 'frame'>('library')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null)

  // sample folders and scenes
  const [folders, setFolders] = useState<Folder[]>([])

  // frames state belongs to the active scene
  const [frames, setFrames] = useState<StoryboardFrame[]>([])

  // zoom/pan for frame editor
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFrame, setEditingFrame] = useState<StoryboardFrame | null>(null)
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null)
  
  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  const [isSceneEditOpen, setIsSceneEditOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '2', // Default to 2 seconds as string for the input
    notes: '',
    image: null as File | null
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load saved storyboard frames from Supabase when episode changes
  React.useEffect(() => {
    const loadInitialData = async () => {
      if (!episodeId) return
      try {
        const savedFolders = await tabOperations.storyboard.loadFolders(episodeId)
        
        // Always load saved folders, even if empty (this preserves deletions)
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
        
        // Always use saved data, even if empty (no demo data)
        setFolders(mapped)

        const savedFrames = await tabOperations.storyboard.loadFrames(episodeId)
        if (savedFrames && savedFrames.length > 0) {
          setFrames(savedFrames as unknown as StoryboardFrame[])
        }
        
        // Ensure there is a selected folder/scene to continue navigation UX (only from saved data)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '2', // Reset to default 2 seconds
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
    resetForm()
    setInsertAfterIndex(afterIndex !== undefined ? afterIndex : null)
    setIsCreateDialogOpen(true)
  }

  const handleEditFrame = (frame: StoryboardFrame) => {
    setEditingFrame(frame)
    setFormData({
      title: frame.title,
      description: frame.description,
      duration: frame.duration.toString(), // Convert number to string for the input
      notes: frame.notes,
      image: null
    })
    // عرض الصورة الحالية للإطار
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
          await storageOperations.deleteStoryboardImage(episodeId, fileName)
        }
      }
      
      // احذف الإطار واحتفظ بباقي الإطارات
      let updated = frames.filter(frame => frame.id !== frameId)

      // إعادة ترقيم الإطارات داخل المشهد الحالي فقط
      const activeScene = folders.find(f => f.id === activeFolderId)?.scenes.find(s => s.id === activeSceneId)
      const sceneName = activeScene?.title || 'المشهد'

      const sceneFrames = updated.filter(f => f.sceneId === activeSceneId)
      const otherFrames = updated.filter(f => f.sceneId !== activeSceneId)

      const renumbered = sceneFrames.map((frame, index) => ({
        ...frame,
        title: `${sceneName} - إطار ${String(index + 1).padStart(2, '0')}`,
        order: index + 1
      }))
      updated = [...renumbered, ...otherFrames]
      
      setFrames(updated)
      // Persist changes
      try {
        if (episodeId) {
          await tabOperations.storyboard.saveFrames(episodeId, updated)
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
        const uploadedUrl = await storageOperations.uploadStoryboardImage(episodeId, fileName, formData.image)
        
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
    const frameId = `sb-f-${Date.now()}`
    const newFrame: StoryboardFrame = {
      id: frameId,
      frameId: frameId,
      title: formData.title.trim() || `إطار جديد ${frames.length + 1}`,
      description: formData.description.trim(),
      thumbnail: thumbnailUrl,
      duration: formData.duration ? Number(formData.duration) : 2,
      notes: formData.notes.trim(),
      order: insertAfterIndex !== null ? insertAfterIndex + 1 : frames.length + 1,
      sceneId: activeSceneId || undefined
    }

    let newFrames = [...frames]
    newFrames.splice(insertAfterIndex !== null ? insertAfterIndex + 1 : frames.length, 0, newFrame)

    // إعادة ترقيم الإطارات داخل المشهد الحالي فقط
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
      await tabOperations.storyboard.saveFrames(episodeId, newFrames)
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
        const uploadedUrl = await storageOperations.uploadStoryboardImage(episodeId, fileName, formData.image)
        
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
            duration: Number(formData.duration) || 2,
            notes: formData.notes.trim(),
            thumbnail: thumbnailUrl
          }
        : frame
    )
    setFrames(updated)
    // Persist changes
    try {
      await tabOperations.storyboard.saveFrames(episodeId, updated)
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
    try {
      if (episodeId) await tabOperations.storyboard.saveFolders(episodeId, updated)
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
    try { if (episodeId) await tabOperations.storyboard.saveFolders(episodeId, updated) } catch (e) { console.error('فشل حفظ تعديل المشهد:', e) }
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
            try { await storageOperations.deleteStoryboardImage(episodeId, fileName) } catch {}
          }
        }
      }
    }

    // Remove frames for this scene
    const remainingFrames = frames.filter(f => f.sceneId !== sceneId)
    setFrames(remainingFrames)
    // Persist frames update
    try { if (episodeId) await tabOperations.storyboard.saveFrames(episodeId, remainingFrames) } catch (e) { console.error(e) }

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
    try { if (episodeId) await tabOperations.storyboard.saveFolders(episodeId, updated) } catch (e) { console.error('فشل حفظ حذف المشهد:', e) }

    // Reset active scene if needed
    if (activeSceneId === sceneId) {
      setActiveSceneId(null)
      setPage('folder')
    }
  }

  // Library (Folders)
  const LibraryPage = () => (
    <div className="p-6">
      <TabHeader
        title="مكتبة الستوري بورد"
        actions={
          <React.Fragment key="header-actions">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 w-8 p-0"><Grid size={16} /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 w-8 p-0"><List size={16} /></Button>
            </div>
            <Button onClick={() => setIsFolderModalOpen(true)} className="flex items-center gap-2">
              <Plus size={16} />
              مجلد جديد
            </Button>
          </React.Fragment>
        }
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {folders.map((folder) => (
            <Card key={folder.id} className="cursor-pointer hover:shadow-lg transition-all group relative" onClick={() => openFolder(folder.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <FolderOpen className="text-primary mt-1" size={24} />
                  <span className="text-sm text-muted-foreground">{folder.scenes.length} مشهد</span>
                </div>
                <div className="flex items-start justify-between">
                  <CardTitle className="group-hover:text-primary transition-colors text-right leading-tight">{folder.name}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {folders.map((folder) => (
            <Card key={folder.id} className="hover:shadow-md transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <FolderOpen className="text-primary flex-shrink-0" size={24} />
                  <div className="flex-1 cursor-pointer" onClick={() => openFolder(folder.id)}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-right leading-tight">{folder.name}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">{folder.scenes.length} مشهد</div>
                  </div>
                  <ChevronLeft className="text-muted-foreground" size={20} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // Folder (Scenes)
  const FolderPage = () => {
    const folder = folders.find(f => f.id === activeFolderId)
    if (!folder) return null
    return (
      <div className="p-6">
        <TabHeader
          title={folder.name}
          description={`(${folder.scenes.length} مشهد)`}
          actions={(
            <>
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 w-8 p-0"><Grid size={16} /></Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 w-8 p-0"><List size={16} /></Button>
              </div>
              <Button onClick={() => setIsSceneModalOpen(true)} className="flex items-center gap-2">
                <Plus size={16} />
                مشهد جديد
              </Button>
            </>
          )}
        />

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folder.scenes.map((scene) => (
              <Card key={scene.id} className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden relative" onClick={() => openScene(scene.id)}>
                <div className="aspect-video bg-muted relative">
                  <img src={scene.thumbnail} alt={scene.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-background" onClick={(e) => { e.stopPropagation(); handleEditScene(scene) }}><Edit size={12} /></Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground" onClick={async (e) => { e.stopPropagation(); await handleDeleteScene(scene.id) }}><Trash2 size={12} /></Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <CardTitle className="mb-1 group-hover:text-primary transition-colors">{scene.title}</CardTitle>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {folder.scenes.map((scene) => (
              <Card key={scene.id} className="cursor-pointer hover:shadow-md transition-all group" onClick={() => openScene(scene.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden relative">
                      <img src={scene.thumbnail} alt={scene.title} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-background" onClick={(e) => { e.stopPropagation(); handleEditScene(scene) }}><Edit size={12} /></Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground" onClick={async (e) => { e.stopPropagation(); await handleDeleteScene(scene.id) }}><Trash2 size={12} /></Button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{scene.title}</h3>
                      {scene.description && (<p className="text-xs text-muted-foreground line-clamp-1">{scene.description}</p>)}
                    </div>
                    <ChevronLeft className="text-muted-foreground" size={20} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Storyboard (Timeline) - reuse existing UI and improve
  const StoryboardPage = () => {
    const sceneFrames = frames.filter(f => f.sceneId === activeSceneId)
    return (
      <div className="p-6">
        <TabHeader
          title="لوحة الستوري بورد"
          actions={(
            <Button onClick={() => handleCreateFrame()} className="flex items-center gap-2"><Plus size={16} />إطار جديد</Button>
          )}
        />

        <Card>
          <CardContent className="p-6">
            <div className="relative max-w-full">
              <div className="space-y-8">
                {Array.from({ length: Math.ceil((sceneFrames.length + 1) / 3) }, (_, rowIndex) => {
                  const startIndex = rowIndex * 3;
                  const rowFrames = sceneFrames.slice(startIndex, startIndex + 3);
                  
                  return (
                    <div key={rowIndex} className="flex items-center gap-4">
                      {/* خط قبل الكارد الأول في كل صف */}
                      <div className="relative group/separator flex items-center justify-center" style={{ width: '32px', height: '256px' }}>
                        {/* الخط الفاصل */}
                        <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-border -translate-x-1/2 -translate-y-1/2 z-5" />
                        
                        {/* علامة الزائد أعلى الخط */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/separator:opacity-100 transition-all duration-200 z-30">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-8 h-8 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                            onClick={() => handleCreateFrame(startIndex - 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      {/* الكاردات في الصف */}
                      {rowFrames.map((frame, cardIndex) => {
                        const globalIndex = startIndex + cardIndex;
                        return (
                          <React.Fragment key={frame.id}>
                            {/* الكارد */}
                            <div key={`frame-${frame.id}`} className="relative group">
                              <Card className="w-64 hover:shadow-lg transition-all bg-background relative z-10">
                                <div className="relative">
                                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden cursor-pointer" onClick={() => openFrame(frame.id)}>
                                    <img src={frame.thumbnail} alt={frame.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-background" onClick={() => handleEditFrame(frame)}><Edit size={12} /></Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground" onClick={async () => await handleDeleteFrame(frame.id)}><Trash2 size={12} /></Button>
                                  </div>
                                </div>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-semibold text-sm">{frame.title}</h3>
                                      <span className="text-xs text-muted-foreground">#{frame.order}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{frame.description}</p>
                                    <div className="flex items-center justify_between text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1"><Clock size={12} /><span>{frame.duration}</span></div>
                                      {frame.notes && (<div className="flex items-center gap-1"><MessageCircle size={12} /><span>ملاحظات</span></div>)}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* خط قبل الكارد التالي في نفس الصف */}
                            {cardIndex < rowFrames.length - 1 && (
                              <div key={`separator-${globalIndex}`} className="relative group/separator flex items-center justify-center" style={{ width: '32px', height: '256px' }}>
                                {/* الخط الفاصل */}
                                <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-border -translate-x-1/2 -translate-y-1/2 z-5" />
                                
                                {/* علامة الزائد أعلى الخط */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/separator:opacity-100 transition-all duration-200 z-30">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-8 h-8 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                                    onClick={() => handleCreateFrame(globalIndex)}
                                  >
                                    <Plus size={14} />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                      
                      {/* أزلنا الخط بعد آخر كارد حسب الطلب */}

                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Frame editor
  const FrameEditorPage = () => {
    const frame = frames.find(f => f.id === activeFrameId)
    if (!frame) return null
    return (
      <div className="h-full flex flex-col">
        <Card className="border-b border-border rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setPage('storyboard')} className="p-2"><ChevronLeft size={20} /></Button>
                <h1 className="text-lg font-semibold">{frame.title}</h1>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 flex" style={{ minHeight: '70vh' }}>
          <div className="flex-1 bg-muted/30 relative">
            <div className="h-full overflow-hidden relative bg-background" ref={viewerRef}>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
                <img src={frame.thumbnail} alt={frame.title} className="max-w-none shadow-lg rounded-lg" style={{ transform: `scale(${zoom / 100})` }} />
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}><ZoomOut size={16} /></Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}><ZoomIn size={16} /></Button>
                <Button variant="ghost" size="sm" onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }) }}>إعادة تعيين</Button>
              </div>
            </div>
          </div>

          <Card className="w-96 border-l border-border flex flex-col rounded-none">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg">تفاصيل الإطار</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">العنوان</label>
                <Input value={formData.title || frame.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="عنوان الإطار" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">الوصف</label>
                <Textarea value={formData.description || frame.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">المدة</label>
                  <Input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value.replace(/[^0-9.]/g, '') })}
                />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ملاحظات</label>
                  <Input value={formData.notes || frame.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={async () => await submitEditFrame()}>حفظ</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background">
      {page === 'library' && <LibraryPage />}
      {page === 'folder' && <FolderPage />}
      {page === 'storyboard' && <StoryboardPage />}
      {page === 'frame' && <FrameEditorPage />}

      {/* Create Frame Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {insertAfterIndex !== null ? 'إضافة إطار جديد' : 'إنشاء إطار جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* رفع الصورة */}
            <div>
              <label className="text-sm font-medium mb-2 block">صورة الإطار</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData({ ...formData, image: null })
                        }}
                      >
                        إزالة الصورة
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        تغيير الصورة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 text-muted-foreground mb-4">
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">اضغط لرفع صورة الإطار</p>
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      اختيار صورة
                    </Button>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* وصف المشهد */}
            <div>
              <label className="text-sm font-medium mb-2 block">وصف المشهد</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للمشهد..."
                rows={4}
                className="resize-none"
              />
            </div>
            
            {/* المدة الزمنية */}
            <div>
              <label className="text-sm font-medium mb-2 block">المدة الزمنية (بالثواني)</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.duration.replace(/[^0-9.]/g, '')}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="2.5"
                className="max-w-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={async () => await submitCreateFrame()} disabled={!formData.description.trim() || isUploading}>
              {isUploading ? '🔄 جاري رفع الصورة...' : 'إنشاء الإطار'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Unified Modals */}
      <UnifiedModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="إنشاء مجلد جديد"
        type="folder"
        onSubmit={handleCreateFolder}
      />
      
      <UnifiedModal
        isOpen={isSceneModalOpen}
        onClose={() => setIsSceneModalOpen(false)}
        title="إضافة مشهد جديد"
        type="scene"
        onSubmit={handleCreateScene}
      />

      {/* Edit Scene Dialog */}
      <Dialog open={isSceneEditOpen} onOpenChange={setIsSceneEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل المشهد</DialogTitle>
          </DialogHeader>
          {editingScene && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">اسم المشهد</label>
                <Input value={editingScene.title} onChange={(e) => setEditingScene({ ...editingScene, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">وصف المشهد (اختياري)</label>
                <Textarea value={editingScene.description || ''} onChange={(e) => setEditingScene({ ...editingScene, description: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">اختيار الصورة المصغرة من الإطارات</label>
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-auto">
                  {frames.filter(f => f.sceneId === editingScene.id).map(f => (
                    <button key={f.id} type="button" className={`relative rounded overflow-hidden border ${editingScene.thumbnail === f.thumbnail ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`} onClick={() => setEditingScene({ ...editingScene, thumbnail: f.thumbnail })}>
                      <img src={f.thumbnail} alt={f.title} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSceneEditOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveEditedScene()}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Frame Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الإطار</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* رفع الصورة */}
            <div>
              <label className="text-sm font-medium mb-2 block">صورة الإطار</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData({ ...formData, image: null })
                        }}
                      >
                        إزالة الصورة
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('image-upload-edit')?.click()}
                      >
                        تغيير الصورة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 text-muted-foreground mb-4">
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">اضغط لرفع صورة الإطار</p>
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('image-upload-edit')?.click()}
                    >
                      اختيار صورة
                    </Button>
                  </div>
                )}
                <input
                  id="image-upload-edit"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* وصف المشهد */}
            <div>
              <label className="text-sm font-medium mb-2 block">وصف المشهد</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للمشهد..."
                rows={4}
                className="resize-none"
              />
            </div>
            
            {/* المدة الزمنية */}
            <div>
              <label className="text-sm font-medium mb-2 block">المدة الزمنية (بالثواني)</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.duration.replace(/[^0-9.]/g, '')}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="2.5"
                className="max-w-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={async () => await submitEditFrame()} disabled={!formData.description.trim() || isUploading}>
              {isUploading ? '🔄 جاري رفع الصورة...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
