import React, { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
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

interface StoryboardFrame {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  notes: string
  order: number
}

interface Scene {
  id: string
  title: string
  thumbnail: string
}

interface Folder {
  id: string
  name: string
  scenes: Scene[]
}

export default function StoryboardTab() {
  // navigation state like DrawingTab
  const [page, setPage] = useState<'library' | 'folder' | 'storyboard' | 'frame'>('library')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null)

  // sample folders and scenes
  const [folders] = useState<Folder[]>([
    {
      id: 'sb-f-01',
      name: 'المقدمة – الحلقة 01',
      scenes: [
        { id: 'sb-s-01', title: 'المشهد 01 – الافتتاح', thumbnail: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop' },
        { id: 'sb-s-02', title: 'المشهد 02 – اكتشاف', thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop' }
      ]
    },
    {
      id: 'sb-f-02',
      name: 'منتصف الحلقة – الأكشن',
      scenes: [
        { id: 'sb-s-03', title: 'المشهد 03 – التحوّل', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  ])

  // frames state belongs to the active scene
  const [frames, setFrames] = useState<StoryboardFrame[]>([
    {
      id: 'frame-1',
      title: 'المشهد الافتتاحي',
      description: 'لقطة واسعة للمدينة في الصباح',
      thumbnail: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=800&auto=format&fit=crop',
      duration: '3s',
      notes: 'إضاءة ذهبية، حركة كاميرا بطيئة',
      order: 1
    },
    {
      id: 'frame-2',
      title: 'تقديم الشخصية',
      description: 'لقطة متوسطة للبطل وهو يستيقظ',
      thumbnail: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?q=80&w=800&auto=format&fit=crop',
      duration: '2s',
      notes: 'تركيز على تعبيرات الوجه',
      order: 2
    },
    {
      id: 'frame-3',
      title: 'الانتقال للخارج',
      description: 'لقطة تتبع البطل وهو يخرج من المنزل',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=800&auto=format&fit=crop',
      duration: '4s',
      notes: 'حركة كاميرا انسيابية',
      order: 3
    }
  ])

  // zoom/pan for frame editor
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFrame, setEditingFrame] = useState<StoryboardFrame | null>(null)
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    notes: ''
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      notes: ''
    })
  }

  const handleCreateFrame = (afterIndex?: number) => {
    setInsertAfterIndex(afterIndex ?? null)
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const handleEditFrame = (frame: StoryboardFrame) => {
    setEditingFrame(frame)
    setFormData({
      title: frame.title,
      description: frame.description,
      duration: frame.duration,
      notes: frame.notes
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteFrame = (frameId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإطار؟')) {
      setFrames(frames.filter(frame => frame.id !== frameId))
    }
  }

  const submitCreateFrame = () => {
    if (!formData.title.trim()) return

    const newFrame: StoryboardFrame = {
      id: `frame-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800&auto=format&fit=crop',
      duration: formData.duration.trim() || '2s',
      notes: formData.notes.trim(),
      order: 0
    }

    let newFrames = [...frames]
    
    if (insertAfterIndex !== null) {
      // إدراج بين الإطارات
      newFrames.splice(insertAfterIndex + 1, 0, newFrame)
    } else {
      // إضافة في النهاية
      newFrames.push(newFrame)
    }

    // إعادة ترقيم الإطارات
    newFrames = newFrames.map((frame, index) => ({
      ...frame,
      order: index + 1
    }))

    setFrames(newFrames)
    setIsCreateDialogOpen(false)
    setInsertAfterIndex(null)
    resetForm()
  }

  const submitEditFrame = () => {
    if (!editingFrame || !formData.title.trim()) return

    setFrames(frames.map(frame =>
      frame.id === editingFrame.id
        ? {
            ...frame,
            title: formData.title.trim(),
            description: formData.description.trim(),
            duration: formData.duration.trim() || '2s',
            notes: formData.notes.trim()
          }
        : frame
    ))
    setIsEditDialogOpen(false)
    setEditingFrame(null)
    resetForm()
  }

  // navigation helpers
  const openFolder = (folderId: string) => { setActiveFolderId(folderId); setPage('folder') }
  const openScene = (sceneId: string) => { setActiveSceneId(sceneId); setPage('storyboard') }
  const openFrame = (frameId: string) => { setActiveFrameId(frameId); setPage('frame') }

  // Library (Folders)
  const LibraryPage = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">مكتبة الستوري بورد</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 w-8 p-0"><Grid size={16} /></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 w-8 p-0"><List size={16} /></Button>
          </div>
        </div>
      </div>

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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setPage('library')} className="p-2 text-muted-foreground hover:text-foreground"><ArrowRight size={20} /></Button>
          <h1 className="text-2xl font-bold">{folder.name}</h1>
          <span className="text-muted-foreground">({folder.scenes.length} مشهد)</span>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folder.scenes.map((scene) => (
              <Card key={scene.id} onClick={() => openScene(scene.id)} className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img src={scene.thumbnail} alt={scene.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
              <Card key={scene.id} onClick={() => openScene(scene.id)} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      <img src={scene.thumbnail} alt={scene.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{scene.title}</h3>
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
  const StoryboardPage = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setPage('folder')} className="p-2 text-muted-foreground hover:text-foreground"><ArrowRight size={20} /></Button>
          <h1 className="text-2xl font-bold">لوحة الستوري بورد</h1>
        </div>
        <Button onClick={() => handleCreateFrame()} className="flex items-center gap-2"><Plus size={16} />إطار جديد</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
            <div className="flex items-stretch gap-8 overflow-x-auto pb-4 snap-x">
              {frames.map((frame, index) => (
                <React.Fragment key={frame.id}>
                  <div className="flex-shrink-0 relative snap-start">
                    <Card className="w-64 hover:shadow-lg transition-all group bg-background">
                      <div className="relative">
                        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden cursor-pointer" onClick={() => openFrame(frame.id)}>
                          <img src={frame.thumbnail} alt={frame.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-background" onClick={() => handleEditFrame(frame)}><Edit size={12} /></Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDeleteFrame(frame.id)}><Trash2 size={12} /></Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">{frame.title}</h3>
                            <span className="text-xs text-muted-foreground">#{frame.order}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{frame.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><Clock size={12} /><span>{frame.duration}</span></div>
                            {frame.notes && (<div className="flex items-center gap-1"><MessageCircle size={12} /><span>ملاحظات</span></div>)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-background z-20" />
                  </div>
                  {index < frames.length - 1 && (
                    <div className="flex-shrink-0 relative">
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all z-20" onClick={() => handleCreateFrame(index)}>
                        <Plus size={14} />
                      </Button>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

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
                  <Input value={formData.duration || frame.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ملاحظات</label>
                  <Input value={formData.notes || frame.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={submitEditFrame}>حفظ</Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {insertAfterIndex !== null ? 'إضافة إطار جديد' : 'إنشاء إطار جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عنوان الإطار</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان الإطار"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">وصف المشهد</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للمشهد..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">المدة الزمنية</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال: 3s أو 2.5s"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">ملاحظات إضافية</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات حول الإضاءة، الحركة، التأثيرات..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={submitCreateFrame} disabled={!formData.title.trim()}>
                إنشاء الإطار
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Frame Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الإطار</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عنوان الإطار</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان الإطار"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">وصف المشهد</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للمشهد..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">المدة الزمنية</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال: 3s أو 2.5s"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">ملاحظات إضافية</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات حول الإضاءة، الحركة، التأثيرات..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={submitEditFrame} disabled={!formData.title.trim()}>
                حفظ التغييرات
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
