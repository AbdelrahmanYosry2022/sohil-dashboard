import React from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { 
  Plus, 
  Grid3X3, 
  List, 
  FolderPlus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MessageCircle, 
  Clock, 
  Eye, 
  Camera 
} from 'lucide-react'
import { useDrawingTab } from '../hooks/useDrawingTab'

const DrawingTab = () => {
  const {
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
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setNewFolderName,
    setIsFolderModalOpen,
    setIsSceneModalOpen,
    
    // Functions
    createFolder,
    handleCreateFolder,
    handleCreateScene,
    handleEditFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    openScene,
    openFolder,
    getStatusBadge,
    zoomIn,
    zoomOut,
    resetView
  } = useDrawingTab()

  const LibraryPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">مكتبة الرسوم</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={createFolder}>
          <FolderPlus className="h-4 w-4 mr-2" />
          مجلد جديد
        </Button>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {folders.map((folder) => (
          <Card key={folder.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openFolder(folder.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{folder.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditFolder(folder)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFolder(folder.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{folder.scenes.length} مشهد</span>
                <span>المجلد #{folder.order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const FolderPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setPage('library')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <h2 className="text-2xl font-bold">{currentFolder?.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsSceneModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            مشهد جديد
          </Button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {currentFolder?.scenes.map((scene) => {
          const statusBadge = getStatusBadge(scene.status)
          return (
            <Card key={scene.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openScene(scene.id)}>
              <CardHeader className="pb-3">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                  <img src={scene.thumbnail} alt={scene.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{scene.title}</CardTitle>
                  <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      {scene.shots}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {scene.comments}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(scene.lastUpdateISO).toLocaleDateString('ar')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const ReviewPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setPage('folder')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <h2 className="text-2xl font-bold">{currentScene?.title}</h2>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          تحميل
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="relative bg-muted" ref={viewerRef}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={currentScene?.thumbnail} 
                    alt={currentScene?.title}
                    className="w-full h-full object-contain"
                    style={{
                      transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`
                    }}
                  />
                  {comments.filter(c => c.pin).map((comment) => (
                    <div
                      key={comment.id}
                      className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                      style={{
                        left: `${comment.pin!.xPct}%`,
                        top: `${comment.pin!.yPct}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {comments.indexOf(comment) + 1}
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium bg-background px-2 py-1 rounded">
                    {zoom}%
                  </span>
                  <Button variant="secondary" size="sm" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={resetView}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                التعليقات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment, index) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.author}</span>
                        <Badge variant="outline" className="text-xs">{comment.role}</Badge>
                        <Badge variant={comment.status === 'open' ? 'destructive' : 'default'} className="text-xs">
                          {comment.status === 'open' ? 'مفتوح' : 'محلول'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{comment.text}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.at).toLocaleString('ar')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                الإصدارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {versions.map((version) => {
                const statusBadge = getStatusBadge(version.status)
                return (
                  <div key={version.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <img src={version.thumbnail} alt={version.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{version.name}</span>
                          <Badge variant={statusBadge.variant as any} className="text-xs">{statusBadge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{version.notes}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString('ar')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      {page === 'library' && <LibraryPage />}
      {page === 'folder' && <FolderPage />}
      {page === 'review' && <ReviewPage />}

      {/* Create Folder Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء مجلد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">اسم المجلد</Label>
              <Input id="folder-name" placeholder="أدخل اسم المجلد" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>إلغاء</Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>إنشاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المجلد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-folder-name">اسم المجلد</Label>
              <Input 
                id="edit-folder-name" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="أدخل اسم المجلد" 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleUpdateFolder}>حفظ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Folder Modal */}
      <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء مجلد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="modal-folder-name">اسم المجلد</Label>
              <Input id="modal-folder-name" placeholder="أدخل اسم المجلد" />
            </div>
            <div>
              <Label htmlFor="modal-folder-description">الوصف (اختياري)</Label>
              <Textarea id="modal-folder-description" placeholder="أدخل وصف المجلد" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFolderModalOpen(false)}>إلغاء</Button>
              <Button onClick={() => {
                const nameInput = document.getElementById('modal-folder-name') as HTMLInputElement
                const descInput = document.getElementById('modal-folder-description') as HTMLTextAreaElement
                handleCreateFolder({ name: nameInput.value, description: descInput.value })
              }}>إنشاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Scene Modal */}
      <Dialog open={isSceneModalOpen} onOpenChange={setIsSceneModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء مشهد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="modal-scene-name">اسم المشهد</Label>
              <Input id="modal-scene-name" placeholder="أدخل اسم المشهد" />
            </div>
            <div>
              <Label htmlFor="modal-scene-description">الوصف (اختياري)</Label>
              <Textarea id="modal-scene-description" placeholder="أدخل وصف المشهد" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSceneModalOpen(false)}>إلغاء</Button>
              <Button onClick={() => {
                const nameInput = document.getElementById('modal-scene-name') as HTMLInputElement
                const descInput = document.getElementById('modal-scene-description') as HTMLTextAreaElement
                handleCreateScene({ name: nameInput.value, description: descInput.value })
              }}>إنشاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DrawingTab
