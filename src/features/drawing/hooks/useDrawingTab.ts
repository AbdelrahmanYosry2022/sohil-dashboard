import { useState, useRef } from 'react'

interface Scene {
  id: string
  title: string
  thumbnail: string
  status: 'draft' | 'review' | 'changes' | 'approved'
  shots: number
  comments: number
  lastUpdateISO: string
}

interface Folder {
  id: string
  name: string
  order: number
  scenes: Scene[]
}

interface Version {
  id: string
  name: string
  createdAt: string
  thumbnail: string
  status: 'draft' | 'review' | 'changes' | 'approved'
  notes?: string
}

interface Comment {
  id: string
  author: string
  role: string
  at: string
  text: string
  status: 'open' | 'resolved'
  pin?: { xPct: number; yPct: number }
}

export const useDrawingTab = () => {
  // Page and view state
  const [page, setPage] = useState('library') // 'library' | 'folder' | 'review'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  
  // Data state
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 'f-01',
      name: 'المقدمة – الحلقة 01',
      order: 1,
      scenes: [
        {
          id: 's-01',
          title: 'المشهد 01 – الافتتاح',
          thumbnail: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop',
          status: 'approved',
          shots: 8,
          comments: 0,
          lastUpdateISO: '2025-08-24T10:00:00Z'
        },
        {
          id: 's-02',
          title: 'المشهد 02 – اكتشاف الكتاب',
          thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop',
          status: 'review',
          shots: 12,
          comments: 3,
          lastUpdateISO: '2025-08-26T12:30:00Z'
        }
      ]
    },
    {
      id: 'f-02',
      name: 'منتصف الحلقة – الأكشن',
      order: 2,
      scenes: [
        {
          id: 's-03',
          title: 'المشهد 03 – التحوّل',
          thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
          status: 'changes',
          shots: 16,
          comments: 2,
          lastUpdateISO: '2025-08-25T15:15:00Z'
        }
      ]
    }
  ])
  
  // Active states
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  
  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  
  // Review page states
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)
  
  // Sample data for review page
  const [versions] = useState<Version[]>([
    {
      id: 'v1',
      name: 'الإصدار 1.0',
      createdAt: '2025-08-24T10:00:00Z',
      thumbnail: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop',
      status: 'approved',
      notes: 'الإصدار الأولي'
    },
    {
      id: 'v2',
      name: 'الإصدار 1.1',
      createdAt: '2025-08-26T12:30:00Z',
      thumbnail: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop',
      status: 'review',
      notes: 'تحديثات على الإضاءة'
    }
  ])
  
  const [comments] = useState<Comment[]>([
    {
      id: 'c1',
      author: 'أحمد محمد',
      role: 'مخرج',
      at: '2025-08-26T14:30:00Z',
      text: 'يحتاج تعديل في الإضاءة هنا',
      status: 'open',
      pin: { xPct: 45, yPct: 30 }
    },
    {
      id: 'c2',
      author: 'فاطمة علي',
      role: 'مصممة',
      at: '2025-08-26T15:00:00Z',
      text: 'ممتاز! الألوان متناسقة',
      status: 'resolved'
    }
  ])
  
  // Helper functions
  const createFolder = () => {
    setIsFolderModalOpen(true)
  }
  
  const handleCreateFolder = (data: { name: string; description?: string }) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: data.name,
      order: folders.length,
      scenes: []
    }
    setFolders([...folders, newFolder])
    setIsFolderModalOpen(false)
  }
  
  const handleCreateScene = (data: { name: string; description?: string }) => {
    if (!activeFolderId) return
    
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: data.name,
      thumbnail: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop',
      status: 'draft',
      shots: 0,
      comments: 0,
      lastUpdateISO: new Date().toISOString()
    }
    
    setFolders(prev => prev.map(folder => 
      folder.id === activeFolderId 
        ? { ...folder, scenes: [...folder.scenes, newScene] }
        : folder
    ))
    setIsSceneModalOpen(false)
  }
  
  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder)
    setNewFolderName(folder.name)
    setIsEditDialogOpen(true)
  }
  
  const handleUpdateFolder = () => {
    if (!editingFolder || !newFolderName.trim()) return
    
    setFolders(folders.map(folder => 
      folder.id === editingFolder.id 
        ? { ...folder, name: newFolderName.trim() }
        : folder
    ))
    setIsEditDialogOpen(false)
    setEditingFolder(null)
    setNewFolderName('')
  }
  
  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المجلد؟ سيتم حذف جميع المشاهد بداخله.')) {
      setFolders(folders.filter(folder => folder.id !== folderId))
    }
  }
  
  const renameFolder = (folderId: string, newName: string) => {
    setFolders(folders.map(f => f.id === folderId ? { ...f, name: newName } : f))
  }
  
  const reorderFolders = (fromIndex: number, toIndex: number) => {
    const newFolders = [...folders]
    const [moved] = newFolders.splice(fromIndex, 1)
    newFolders.splice(toIndex, 0, moved)
    setFolders(newFolders.map((f, i) => ({ ...f, order: i + 1 })))
  }
  
  const moveScene = (sceneId: string, fromFolderId: string, toFolderId: string) => {
    const fromFolder = folders.find(f => f.id === fromFolderId)
    const scene = fromFolder?.scenes.find(s => s.id === sceneId)
    if (!scene) return
    
    setFolders(folders.map(f => {
      if (f.id === fromFolderId) {
        return { ...f, scenes: f.scenes.filter(s => s.id !== sceneId) }
      }
      if (f.id === toFolderId) {
        return { ...f, scenes: [...f.scenes, scene] }
      }
      return f
    }))
  }
  
  const openScene = (sceneId: string) => {
    setActiveSceneId(sceneId)
    setPage('review')
  }
  
  const openFolder = (folderId: string) => {
    setActiveFolderId(folderId)
    setPage('folder')
  }
  
  const getStatusBadge = (status: string) => {
    const variant = status === 'approved' ? 'default' : status === 'review' ? 'outline' : status === 'changes' ? 'destructive' : 'secondary'
    const label = status === 'draft' ? 'مسودة' : status === 'review' ? 'مراجعة' : status === 'changes' ? 'تعديلات' : status === 'approved' ? 'معتمد' : status
    return { variant, label }
  }
  
  // Zoom and pan functions
  const zoomIn = () => setZoom(Math.min(200, zoom + 25))
  const zoomOut = () => setZoom(Math.max(25, zoom - 25))
  const resetView = () => {
    setZoom(100)
    setPan({ x: 0, y: 0 })
  }
  
  // Get current folder and scene
  const currentFolder = folders.find(f => f.id === activeFolderId)
  const currentScene = folders.flatMap(f => f.scenes).find(s => s.id === activeSceneId)
  
  return {
    // State
    page,
    viewMode,
    folders,
    activeFolderId,
    activeSceneId,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingFolder,
    newFolderName,
    isFolderModalOpen,
    isSceneModalOpen,
    zoom,
    pan,
    viewerRef,
    versions,
    comments,
    currentFolder,
    currentScene,
    
    // Actions
    setPage,
    setViewMode,
    setFolders,
    setActiveFolderId,
    setActiveSceneId,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setEditingFolder,
    setNewFolderName,
    setIsFolderModalOpen,
    setIsSceneModalOpen,
    setZoom,
    setPan,
    
    // Functions
    createFolder,
    handleCreateFolder,
    handleCreateScene,
    handleEditFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    renameFolder,
    reorderFolders,
    moveScene,
    openScene,
    openFolder,
    getStatusBadge,
    zoomIn,
    zoomOut,
    resetView
  }
}

export type { Scene, Folder, Version, Comment }