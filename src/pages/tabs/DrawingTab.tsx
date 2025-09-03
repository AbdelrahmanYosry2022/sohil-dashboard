import React, { useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Plus,
  Grid3X3,
  List,
  FolderOpen,
  ChevronLeft,
  ArrowRight,
  Camera,
  MessageCircle,
  MapPin,
  ZoomOut,
  ZoomIn
} from 'lucide-react'

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

export default function DrawingTab() {
  const [page, setPage] = useState('library') // 'library' | 'folder' | 'review'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  
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
  
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  
  // Helper functions
  const createFolder = () => {
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      name: `مجلد جديد ${folders.length + 1}`,
      order: folders.length + 1,
      scenes: []
    }
    setFolders([...folders, newFolder])
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
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    const variant = status === 'approved' ? 'default' : status === 'review' ? 'outline' : status === 'changes' ? 'destructive' : 'secondary'
    const label = status === 'draft' ? 'مسودة' : status === 'review' ? 'مراجعة' : status === 'changes' ? 'تعديلات' : status === 'approved' ? 'معتمد' : status
    return <Badge variant={variant} className="text-xs">{label}</Badge>
  }



  // Library Page Component
  const LibraryPage = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">مكتبة المشاهد</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
               variant={viewMode === 'grid' ? 'default' : 'ghost'}
               size="sm"
               onClick={() => setViewMode('grid')}
               className="h-8 w-8 p-0"
             >
               <Grid3X3 size={16} />
             </Button>
             <Button
               variant={viewMode === 'list' ? 'default' : 'ghost'}
               size="sm"
               onClick={() => setViewMode('list')}
               className="h-8 w-8 p-0"
             >
               <List size={16} />
             </Button>
          </div>
          <Button
            onClick={createFolder}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            مجلد جديد
          </Button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              onClick={() => openFolder(folder.id)}
              className="cursor-pointer hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <FolderOpen className="text-primary" size={24} />
                  <span className="text-sm text-muted-foreground">{folder.scenes.length} مشهد</span>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {folder.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  {folder.scenes.slice(0, 3).map((scene) => (
                      <span key={scene.id}>{getStatusBadge(scene.status)}</span>
                    ))}
                  {folder.scenes.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{folder.scenes.length - 3}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
           <div className="space-y-4">
             {folders.map((folder) => (
               <Card
                 key={folder.id}
                 onClick={() => openFolder(folder.id)}
                 className="cursor-pointer hover:shadow-md transition-all"
               >
                 <CardContent className="p-4">
                   <div className="flex items-center gap-4">
                     <FolderOpen className="text-primary" size={24} />
                     <div className="flex-1">
                       <h3 className="font-semibold mb-1">{folder.name}</h3>
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <span>{folder.scenes.length} مشهد</span>
                         <div className="flex items-center gap-2">
                           {folder.scenes.slice(0, 3).map((scene) => (
                              <span key={scene.id}>{getStatusBadge(scene.status)}</span>
                            ))}
                           {folder.scenes.length > 3 && (
                             <span className="text-xs text-muted-foreground">+{folder.scenes.length - 3}</span>
                           )}
                         </div>
                       </div>
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
  
  // Folder Page Component
  const FolderPage = () => {
    const folder = folders.find(f => f.id === activeFolderId)
    if (!folder) return null
    
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setPage('library')}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowRight size={20} />
          </Button>
          <h1 className="text-2xl font-bold">{folder.name}</h1>
          <span className="text-muted-foreground">({folder.scenes.length} مشهد)</span>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folder.scenes.map((scene) => (
              <Card
                key={scene.id}
                onClick={() => openScene(scene.id)}
                className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden"
              >
                <div className="aspect-video bg-muted">
                  <img
                    src={scene.thumbnail}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4">
                  <CardTitle className="mb-2 group-hover:text-primary transition-colors">
                    {scene.title}
                  </CardTitle>
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(scene.status)}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera size={14} />
                      <span>{scene.shots}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>{scene.comments}</span>
                    </div>
                    <span>{new Date(scene.lastUpdateISO).toLocaleDateString('ar-SA')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {folder.scenes.map((scene) => (
              <Card
                key={scene.id}
                onClick={() => openScene(scene.id)}
                className="cursor-pointer hover:shadow-md transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={scene.thumbnail}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{scene.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         {getStatusBadge(scene.status)}
                        <div className="flex items-center gap-1">
                          <Camera size={14} />
                          <span>{scene.shots} لقطة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          <span>{scene.comments} تعليق</span>
                        </div>
                        <span>آخر تحديث: {new Date(scene.lastUpdateISO).toLocaleDateString('ar-SA')}</span>
                      </div>
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
  
  // Review Page Component
  const ReviewPage = () => {
    const scene = folders.flatMap(f => f.scenes).find(s => s.id === activeSceneId)
    if (!scene) return null
    
    const [versions] = useState<Version[]>([
      {
        id: 'v1',
        name: 'الإصدار 1.0',
        createdAt: '2025-08-24T10:00:00Z',
        thumbnail: scene.thumbnail,
        status: 'approved',
        notes: 'الإصدار الأولي'
      },
      {
        id: 'v2',
        name: 'الإصدار 1.1',
        createdAt: '2025-08-26T12:30:00Z',
        thumbnail: scene.thumbnail,
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
    
    const [zoom, setZoom] = useState(100)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const viewerRef = useRef<HTMLDivElement>(null)
    
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <Card className="border-b border-border rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage('folder')}
                  className="p-2"
                >
                  <ChevronLeft size={20} />
                </Button>
                <h1 className="text-lg font-semibold">{scene.title}</h1>
              </div>
              <Button variant="outline" size="sm">
                تحميل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="flex-1 flex" style={{ minHeight: '80vh' }}>
          {/* Image Viewer */}
          <div className="flex-1 bg-muted/30 relative">
            <div className="h-full overflow-hidden relative bg-background" ref={viewerRef}>
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px)`
                }}
              >
                <div className="relative">
                  <img
                    src={scene.thumbnail}
                    alt={scene.title}
                    className="max-w-none shadow-lg rounded-lg"
                    style={{
                      transform: `scale(${zoom / 100})`
                    }}
                  />
                  {/* Comment Pins */}
                  {comments.filter(c => c.pin).map((comment) => (
                    <div
                      key={comment.id}
                      className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                      style={{
                        left: `${comment.pin!.xPct}%`,
                        top: `${comment.pin!.yPct}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={comment.text}
                    >
                      <MessageCircle size={12} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Zoom Controls - Bottom Right */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <ZoomIn size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }) }}
                >
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Panel - Right Side */}
          <Card className="w-80 border-l border-border flex flex-col rounded-none">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">التعليقات</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {comments.map((comment) => (
                  <Card key={comment.id} className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">{comment.author}</div>
                          <div className="text-xs text-muted-foreground">{comment.role}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.pin && (
                            <MapPin size={12} className="text-primary" />
                          )}
                          <Badge variant={comment.status === 'open' ? 'destructive' : 'default'} className="text-xs">
                            {comment.status === 'open' ? 'مفتوح' : 'محلول'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.at).toLocaleString('ar-SA')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Versions Section - Full Width Below */}
        <Card className="border-t border-border rounded-none">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg">الإصدارات</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {versions.map((version) => (
                <Card key={version.id} className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                        <img src={version.thumbnail} alt={version.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{version.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                      <Badge variant={version.status === 'approved' ? 'default' : version.status === 'review' ? 'secondary' : version.status === 'changes' ? 'destructive' : 'outline'}>
                        {version.status === 'draft' ? 'مسودة' : version.status === 'review' ? 'مراجعة' : version.status === 'changes' ? 'تعديلات' : 'معتمد'}
                      </Badge>
                    </div>
                    {version.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{version.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="h-full bg-background">
      {page === 'library' && <LibraryPage />}
      {page === 'folder' && <FolderPage />}
      {page === 'review' && <ReviewPage />}
    </div>
  )
}
