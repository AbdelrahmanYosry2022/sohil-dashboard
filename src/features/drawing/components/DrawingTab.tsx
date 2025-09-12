import { supabase } from '../../../lib/supabase/client'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../../components/ui/dialog'
import { UnifiedModal } from '../../../components/ui/unified-modal'
import { drawingApi, drawingStorage } from '../api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import type { StoryboardFrame, Scene, Folder } from '../types'
import { Plus, Grid, List, FolderOpen, ArrowRight, ChevronLeft, ZoomOut, ZoomIn, Clock, MessageCircle, Edit, Trash2 } from 'lucide-react'
import TabHeader from '../../../components/TabHeader'
import DrawingSingleView from './DrawingSingleView'



// Types are imported from ../types

interface DrawingTabProps {
  episodeId: string;
}

export default function DrawingTab({ episodeId }: DrawingTabProps) {
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
  const [cardsPerRow, setCardsPerRow] = useState<2 | 3>(3)
  // وضع عرض الإطارات: storyboard (الاسكتش)
  const [frameDisplayMode, setFrameDisplayMode] = useState<'storyboard'>('storyboard')

  // zoom/pan for frame editor
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFrame, setEditingFrame] = useState<StoryboardFrame | null>(null)
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<StoryboardFrame | null>(null)
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  
  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  const [isSceneEditOpen, setIsSceneEditOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '2', // Default duration in seconds
    notes: '',
    image: null as File | null,
    finalArtImage: null as File | null,
    frameType: 'storyboard' as 'storyboard' | 'final'
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [finalArtPreview, setFinalArtPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load saved storyboard frames from Supabase when episode changes
  React.useEffect(() => {
  const loadInitialData = async () => {
      if (!episodeId) return
      try {
        const { data: folders } = await drawingApi.loadFolders(episodeId);
        
        // Always load saved folders, even if empty (this preserves deletions)
        const mapped = (folders || []).map((f: any) => ({
          id: String(f.folderId || f.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))),
          name: f.name || '',
          scenes: (f.scenes || []).map((s: any) => ({
            id: String(s.sceneId || s.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))),
            title: s.title || '',
            thumbnail: s.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtmF2LTZh9ivPC90ZXh0Pjwvc3ZnPg==',
            description: s.description || ''
          }))
        }))
        
        // Always use saved data, even if empty (no demo data)
        setFolders(mapped)

        const existingFrames = await drawingApi.loadFrames(episodeId);
        if (existingFrames && existingFrames.length > 0) {
          setFrames(existingFrames as unknown as StoryboardFrame[])
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
  console.error('فشل تحميل إطارات الرسم من قاعدة البيانات:', e)
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
      image: null,
      finalArtImage: null,
      frameType: 'storyboard' as const
    })
    setImagePreview(null)
    setFinalArtPreview(null)
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

  const handleFinalArtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setFormData({ ...formData, finalArtImage: file })
    
    // Create preview using FileReader for immediate display
    const reader = new FileReader()
    reader.onload = (e) => {
      setFinalArtPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCreateFrame = (frameType: 'storyboard' | 'final' | number = 'storyboard') => {
    resetForm()
    
    // If frameType is a number, it's the afterIndex from the old signature
    if (typeof frameType === 'number') {
      setInsertAfterIndex(frameType)
    } else {
      // Set the frame type in the form data
      setFormData(prev => ({
        ...prev,
        frameType: frameType as 'storyboard' | 'final'
      }))
      setInsertAfterIndex(null)
    }
    
    setIsCreateDialogOpen(true)
  }

  const handleEditFrame = (frame: StoryboardFrame) => {
    setEditingFrame(frame)
    setFormData({
      title: frame.title,
      description: frame.description,
      duration: frame.duration.toString(), // Convert number to string for the input
      notes: frame.notes,
      image: null,
      frameType: frame.frameType || 'storyboard' // Default to 'storyboard' for backward compatibility
    })
    // عرض الصورة الحالية للإطار
    setImagePreview(frame.thumbnail)
    setIsEditDialogOpen(true)
  }

  const handleSelectFrame = (frameId: string) => {
    const frame = frames.find(f => f.id === frameId)
    setSelectedFrame(frame || null)
    setSelectedFrameId(frameId)
  }

  const handleUpdateFrame = async (updatedFrame: StoryboardFrame) => {
    const updated = frames.map(frame =>
      frame.id === updatedFrame.id ? updatedFrame : frame
    )
    setFrames(updated)
    try {
      if (episodeId) {
        await drawingApi.saveFrames(episodeId, updated)
      }
    } catch (e) {
      console.error('فشل حفظ الإطار المحدث:', e)
    }
  }

  const handleDeleteFrame = async (frameId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإطار؟')) {
      const frameToDelete = frames.find(frame => frame.id === frameId)
      
      // Delete image from Supabase Storage if it's not a default image
      if (frameToDelete && episodeId && frameToDelete.thumbnail && 
          !frameToDelete.thumbnail.startsWith('data:image/svg+xml')) {
        const fileName = frameToDelete.thumbnail.split('/').pop()
        if (fileName) {
          await drawingStorage.deleteFrameImage(episodeId, fileName)
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
          await drawingApi.saveFrames(episodeId, updated)
        }
      } catch (e) {
        console.error('فشل حفظ الإطارات بعد الحذف:', e)
      }
    }
  }

  // رفع/استبدال الرسم النهائي لإطار معين
  const handleUploadFinalArt = async (frameId: string, file: File) => {
    console.log('🎨 بدء رفع الرسم النهائي:', { frameId, fileName: file.name })
    if (!episodeId) return
    try {
  const safeName = `final-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      console.log('🎨 استدعاء uploadFinalArt مع:', { safeName })
      const uploaded = await drawingStorage.uploadFinalArt(episodeId, safeName, file);
      if (!uploaded) return
      const { path, publicUrl } = uploaded
      console.log('🎨 نجح رفع الرسم النهائي:', { path, publicUrl })
      
      // Update local state
      setFrames(prev => prev.map(f => f.id === frameId ? { 
        ...f, 
        finalArtPath: path, 
        finalThumbnail: publicUrl,
        frameType: 'final' 
      } : f))
      
      // Update in database
      await drawingApi.updateFrameFinalArt(episodeId, frameId, { 
        finalArtPath: path, 
        finalThumbnail: publicUrl,
        frameType: 'final' 
      })
    } catch (e) {
      console.error('فشل رفع الرسم النهائي:', e)
    }
  }

  const submitCreateFrame = async () => {
    if (!formData.description.trim() || !episodeId) return

    let thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtmF2LTZh9ivPC90ZXh0Pjwvc3ZnPg=='
    let finalArtUrl = null
    
    // Upload storyboard image to Supabase Storage if provided
    if (formData.image) {
      try {
        setIsUploading(true)
        console.log('🔄 بدء رفع صورة لوحة القصة...', formData.image.name)
        const fileName = `storyboard-${Date.now()}-${formData.image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const uploadedUrl = await drawingStorage.uploadFrameImage(episodeId, fileName, formData.image);
        
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
          console.log('✅ تم رفع صورة لوحة القصة بنجاح:', uploadedUrl);
        } else {
          throw new Error('Failed to upload storyboard image');
        }
      } catch (error) {
        console.error('❌ خطأ في رفع صورة لوحة القصة:', error);
        alert('حدث خطأ أثناء رفع صورة لوحة القصة. يرجى المحاولة مرة أخرى.');
        setIsUploading(false);
        return;
      }
    }
    
    // Upload final art image to Supabase Storage if provided
    if (formData.finalArtImage) {
      try {
        console.log('🔄 بدء رفع العمل الفني النهائي...', formData.finalArtImage.name)
        const fileName = `final-art-${Date.now()}-${formData.finalArtImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const uploadedUrl = await drawingStorage.uploadFrameImage(episodeId, fileName, formData.finalArtImage);
        
        if (uploadedUrl) {
          finalArtUrl = uploadedUrl;
          console.log('✅ تم رفع العمل الفني النهائي بنجاح:', uploadedUrl);
        } else {
          throw new Error('Failed to upload final art image');
        }
      } catch (error) {
        console.error('❌ خطأ في رفع العمل الفني النهائي:', error);
        alert('حدث خطأ أثناء رفع العمل الفني النهائي. يرجى المحاولة مرة أخرى.');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    } else {
      setIsUploading(false);
    }

    const frameId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    const newFrame: StoryboardFrame = {
      id: frameId,
      frameId: frameId,
      title: formData.title.trim() || `إطار جديد ${frames.length + 1}`,
      description: formData.description.trim(),
      thumbnail: thumbnailUrl,
      frameType: formData.frameType,
      finalThumbnail: finalArtUrl || undefined,
      finalArtPath: finalArtUrl || undefined,
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
      await drawingApi.saveFrames(episodeId, newFrames)
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
    let finalArtUrl = editingFrame.finalThumbnail
    
    // Upload new storyboard image to Supabase Storage if provided
    if (formData.image) {
      try {
        setIsUploading(true)
        console.log('🔄 بدء رفع صورة لوحة القصة الجديدة...', formData.image.name)
        const fileName = `storyboard-${Date.now()}-${formData.image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploadedUrl = await drawingStorage.uploadFrameImage(episodeId, fileName, formData.image);
        
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
          console.log('✅ تم رفع صورة لوحة القصة الجديدة بنجاح:', uploadedUrl);
        } else {
          console.error('❌ فشل في رفع صورة لوحة القصة الجديدة')
          alert('فشل في رفع صورة لوحة القصة الجديدة. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت.');
          setIsUploading(false)
          return;
        }
      } catch (error) {
        console.error('❌ خطأ في رفع صورة لوحة القصة الجديدة:', error)
        alert('حدث خطأ أثناء رفع صورة لوحة القصة الجديدة. يرجى المحاولة مرة أخرى.')
        setIsUploading(false)
        return;
      }
    }
    
    // Upload new final art image to Supabase Storage if provided
    if (formData.finalArtImage) {
      try {
        console.log('🔄 بدء رفع العمل الفني النهائي الجديد...', formData.finalArtImage.name)
        const fileName = `final-art-${Date.now()}-${formData.finalArtImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploadedUrl = await drawingStorage.uploadFrameImage(episodeId, fileName, formData.finalArtImage);
        
        if (uploadedUrl) {
          finalArtUrl = uploadedUrl;
          console.log('✅ تم رفع العمل الفني النهائي الجديد بنجاح:', uploadedUrl);
        } else {
          console.error('❌ فشل في رفع العمل الفني النهائي الجديد')
          alert('فشل في رفع العمل الفني النهائي الجديد. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت.');
          setIsUploading(false)
          return;
        }
      } catch (error) {
        console.error('❌ خطأ في رفع العمل الفني النهائي الجديد:', error)
        alert('حدث خطأ أثناء رفع العمل الفني النهائي الجديد. يرجى المحاولة مرة أخرى.')
        setIsUploading(false)
        return;
      } finally {
        setIsUploading(false)
      }
    } else {
      setIsUploading(false)
    }

    const updated = frames.map(frame =>
      frame.id === editingFrame.id
        ? {
            ...frame,
            title: formData.title.trim(),
            description: formData.description.trim(),
            duration: Number(formData.duration) || 2,
            notes: formData.notes.trim(),
            thumbnail: thumbnailUrl,
            finalThumbnail: finalArtUrl || undefined,
            finalArtPath: finalArtUrl || undefined
          }
        : frame
    )
    setFrames(updated)
    // Persist changes
    try {
      await drawingApi.saveFrames(episodeId, updated)
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
  const handleCreateFolder = async (data: { name: string; description?: string }) => {
    const newFolder: Folder = {
      id: `sb-f-${Date.now()}`,
      name: data.name,
      scenes: []
    }
    
    let updated: Folder[] = []
    setFolders(prev => {
      updated = [...prev, newFolder]
      return updated
    })
    
    try {
      if (episodeId) {
        await drawingApi.saveFolders(episodeId, updated)
        console.log('✅ تم حفظ المجلد بنجاح')
      }
    } catch (e) {
      console.error('فشل حفظ المجلد:', e)
      // Revert the state if save fails
      setFolders(prev => prev.filter(f => f.id !== newFolder.id))
    }
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
      if (episodeId) await drawingApi.saveFolders(episodeId, updated)
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
    try { if (episodeId) await drawingApi.saveFolders(episodeId, updated) } catch (e) { console.error('فشل حفظ تعديل المشهد:', e) }
    setIsSceneEditOpen(false)
    setEditingScene(null)
  }

  const handleDeleteScene = async (sceneId: string) => {
    if (!activeFolderId) return
    const confirmed = window.confirm('سيتم حذف المشهد وجميع الإطارات والرسومات النهائية بداخله. هل أنت متأكد؟')
    if (!confirmed) return

    // Get all frames for this scene
    const framesToDelete = frames.filter(f => f.sceneId === sceneId)
    if (episodeId) {
      for (const frame of framesToDelete) {
        try {
          // Delete storyboard thumbnail
          if (frame.thumbnail && !frame.thumbnail.startsWith('data:image/svg+xml')) {
            const fileName = frame.thumbnail.split('/').pop()
            if (fileName) {
              try { 
                await drawingStorage.deleteFrameImage(episodeId, fileName) 
              } catch (error) {
                console.error('❌ Failed to delete storyboard thumbnail:', error)
              }
            }
          }
          
          // Delete final art image if exists
          if (frame.finalArtPath) {
            try { 
              await drawingStorage.deleteFinalArtImage(frame.finalArtPath)
            } catch (error) {
              console.error('❌ Failed to delete final art image:', error)
            }
          }
          
          // Also check and clean up finalThumbnail if it's a direct URL
          if (frame.finalThumbnail && frame.finalThumbnail.includes('supabase.co/storage/v1/object/public/')) {
            try {
              const url = new URL(frame.finalThumbnail)
              const pathParts = url.pathname.split('/')
              if (pathParts.length > 3) {
                const bucket = pathParts[2]
                const filePath = pathParts.slice(3).join('/')
                if (bucket && filePath) {
                  await supabase.storage.from(bucket).remove([filePath])
                }
              }
            } catch (error) {
              console.error('❌ Failed to delete final thumbnail:', error)
            }
          }
        } catch (error) {
          console.error('❌ Error cleaning up frame assets:', error)
        }
      }
      
      // Final art files cleanup is handled above with individual frame deletion
    }

    // Remove frames for this scene
    const remainingFrames = frames.filter(f => f.sceneId !== sceneId)
    setFrames(remainingFrames)
    // Persist frames update
    try { if (episodeId) await drawingApi.saveFrames(episodeId, remainingFrames) } catch (e) { console.error(e) }

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
    try { if (episodeId) await drawingApi.saveFolders(episodeId, updated) } catch (e) { console.error('فشل حفظ حذف المشهد:', e) }

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
        title="مكتبة الرسم"
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setPage('library'); setActiveFolderId(null); }} className="p-2"><ChevronLeft size={18} /></Button>
            <h2 className="text-xl font-semibold">{folder.name} <span className="text-sm text-muted-foreground">({folder.scenes.length} مشهد)</span></h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 w-8 p-0"><Grid size={16} /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 w-8 p-0"><List size={16} /></Button>
            </div>
            <Button onClick={() => setIsSceneModalOpen(true)} className="flex items-center gap-2">
              <Plus size={16} />
              مشهد جديد
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folder.scenes.map((scene, idx) => (
              <Card key={`scene-grid-${scene.id}-${idx}`} className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden relative" onClick={() => openScene(scene.id)}>
                <div className="aspect-video bg-muted relative">
                      <img src={scene.thumbnail || undefined} alt={scene.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
            {folder.scenes.map((scene, idx) => (
              <Card key={`scene-list-${scene.id}-${idx}`} className="cursor-pointer hover:shadow-md transition-all group" onClick={() => openScene(scene.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden relative">
                      <img src={scene.thumbnail || undefined} alt={scene.title} className="w-full h-full object-cover" />
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
    const unassignedFrames = frames.filter(f => !f.sceneId)
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setPage('folder'); setActiveFrameId(null); }} className="p-2"><ChevronLeft size={18} /></Button>
            <h2 className="text-xl font-semibold">لوحة الرسم</h2>
          </div>
          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">عدد الأعمدة:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0 flex items-center justify-center">
                    {cardsPerRow}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {[2,3].map(n => (
                    <DropdownMenuItem key={n} onClick={() => setCardsPerRow(n as 2|3)} className={cardsPerRow === n ? 'bg-accent' : ''}>
                      {n} كارد في الصف {cardsPerRow === n && '✓'}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  إضافة إطار
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleCreateFrame('storyboard')}>
                  <div className="flex items-center gap-2">
                    <Grid size={16} />
          إضافة رسم
                  </div>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>



        <Card>
          <CardContent className="p-6">
            <div className="relative max-w-full">
              <div className="space-y-8">
                {(activeSceneId ? sceneFrames : unassignedFrames).length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    لا توجد إطارات
                  </div>
                ) : (
                  <DrawingSingleView
                    frames={activeSceneId ? sceneFrames : unassignedFrames}
                    onEditFrame={handleEditFrame}
                    onDeleteFrame={handleDeleteFrame}
                    onOpenFrame={openFrame}
                    onAddFrame={handleCreateFrame}
                    onUploadFinalArt={handleUploadFinalArt}
                    cardsPerRow={cardsPerRow}
                  />
                )}
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
                <Button variant="ghost" size="sm" onClick={() => { setPage('storyboard'); setActiveFrameId(null); }} className="p-2"><ChevronLeft size={20} /></Button>
                <h1 className="text-lg font-semibold">{frame.title}</h1>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 flex" style={{ minHeight: '70vh' }}>
          <div className="flex-1 bg-muted/30 relative">
            <div className="h-full overflow-hidden relative bg-background" ref={viewerRef}>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
                <img src={frame.thumbnail || undefined} alt={frame.title} className="max-w-none shadow-lg rounded-lg" style={{ transform: `scale(${zoom / 100})` }} />
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
            {/* رفع صورة لوحة القصة */}
            <div>
              <label className="text-sm font-medium mb-2 block">صورة لوحة القصة</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة صورة لوحة القصة" 
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
                    <p className="text-sm text-muted-foreground mb-2">اضغط لرفع صورة لوحة القصة</p>
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
            
            {/* رفع العمل الفني النهائي */}
            <div>
              <label className="text-sm font-medium mb-2 block">العمل الفني النهائي (اختياري)</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {finalArtPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={finalArtPreview} 
                      alt="معاينة العمل الفني النهائي" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFinalArtPreview(null)
                          setFormData({ ...formData, finalArtImage: null })
                        }}
                      >
                        إزالة الصورة
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('final-art-upload')?.click()}
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
                    <p className="text-sm text-muted-foreground mb-2">اضغط لرفع العمل الفني النهائي</p>
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('final-art-upload')?.click()}
                    >
                      اختيار صورة
                    </Button>
                  </div>
                )}
                <input
                  id="final-art-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFinalArtUpload}
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
                      <img src={f.thumbnail || undefined} alt={f.title} className="w-full h-20 object-cover" />
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
            {/* رفع صورة لوحة القصة */}
            <div>
              <label className="text-sm font-medium mb-2 block">صورة لوحة القصة</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة صورة لوحة القصة" 
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
                    <p className="text-sm text-muted-foreground mb-2">اضغط لرفع صورة لوحة القصة</p>
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
            
            {/* رفع العمل الفني النهائي */}
            <div>
              <label className="text-sm font-medium mb-2 block">العمل الفني النهائي (اختياري)</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {finalArtPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={finalArtPreview} 
                      alt="معاينة العمل الفني النهائي" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFinalArtPreview(null)
                          setFormData({ ...formData, finalArtImage: null })
                        }}
                      >
                        إزالة الصورة
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('final-art-upload-edit')?.click()}
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
                    <p className="text-sm text-muted-foreground mb-2">اضغط لرفع العمل الفني النهائي</p>
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('final-art-upload-edit')?.click()}
                    >
                      اختيار صورة
                    </Button>
                  </div>
                )}
                <input
                  id="final-art-upload-edit"
                  type="file"
                  accept="image/*"
                  onChange={handleFinalArtUpload}
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
