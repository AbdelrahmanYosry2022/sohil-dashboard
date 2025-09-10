import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Badge } from '../../../components/ui/badge'
import {
  ChevronLeft,
  ZoomOut,
  ZoomIn,
  MessageCircle,
  MapPin,
  Plus,
  Upload,
  Loader2,
  FileText as FileTextIcon,
  AudioLines,
  Layers,
  PencilRuler,
  Clapperboard,
  Scissors,
  Film,
  Folder,
  Wallet,
  LayoutDashboard
} from 'lucide-react'
import { storyboardApi, storyboardStorage } from '../api'
import { EpisodeDetailHeader } from '../../episodes/components/EpisodeDetailHeader'
import { EpisodeSidebar } from '../../episodes/components/EpisodeSidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import type { StoryboardFrame } from '../types'

interface Comment {
  id: string
  author: string
  role: string
  at: string
  text: string
  status: 'open' | 'resolved'
  pin?: { xPct: number; yPct: number }
}

interface Version {
  id: string
  name: string
  createdAt: string
  thumbnail: string
  status: 'draft' | 'review' | 'changes' | 'approved'
  notes?: string
}

type TabKey =
  | 'overview'
  | 'script'
  | 'audio'
  | 'storyboard'
  | 'draw'
  | 'animation'
  | 'edit'
  | 'final'
  | 'assets'
  | 'budget'

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { key: 'script', label: 'النص', icon: FileTextIcon },
  { key: 'audio', label: 'الصوت', icon: AudioLines },
  { key: 'storyboard', label: 'الستوري بورد', icon: Layers },
  { key: 'draw', label: 'الرسم', icon: PencilRuler },
  { key: 'animation', label: 'التحريك', icon: Clapperboard },
  { key: 'edit', label: 'المونتاج', icon: Scissors },
  { key: 'final', label: 'المشاهد النهائية', icon: Film },
  { key: 'assets', label: 'أصول الحلقة', icon: Folder },
  { key: 'budget', label: 'الميزانية', icon: Wallet },
]

export default function StoryboardFrameTab() {
  const { id: episodeId, frameId } = useParams<{ id: string; frameId: string }>()
  const navigate = useNavigate()
  
  const [frames, setFrames] = useState<StoryboardFrame[]>([])
  const [frame, setFrame] = useState<StoryboardFrame | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form data for editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 2,
    notes: '',
    image: null as File | null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Zoom and pan for image viewer
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)
  
  // Sample comments (could be loaded from Supabase later)
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

  // Sample versions for the frame
  const [versions] = useState<Version[]>([
    {
      id: 'v1',
      name: 'الإصدار 1.0',
      createdAt: '2025-08-24T10:00:00Z',
      thumbnail: frame?.thumbnail || '',
      status: 'approved',
      notes: 'الإصدار الأولي للإطار'
    },
    {
      id: 'v2',
      name: 'الإصدار 1.1',
      createdAt: '2025-08-26T12:30:00Z',
      thumbnail: frame?.thumbnail || '',
      status: 'review',
      notes: 'تحديثات على التكوين والألوان'
    }
  ])

  const [activeSidebarTab, setActiveSidebarTab] = useState<TabKey>('storyboard')
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Load frames and find target frame
  useEffect(() => {
    const loadFrameData = async () => {
      if (!episodeId || !frameId) return
      
      try {
        setLoading(true)
        const savedFrames = await storyboardApi.loadFrames(episodeId)
        if (savedFrames && savedFrames.length > 0) {
          const framesData = savedFrames as unknown as StoryboardFrame[]
          setFrames(framesData)
          
          const targetFrame = framesData.find(f => f.id === frameId)
          if (targetFrame) {
            setFrame(targetFrame)
            setFormData({
              title: targetFrame.title,
              description: targetFrame.description,
              duration: parseFloat(targetFrame.duration.toString().replace(/[^0-9.]/g, '')) || 2,
              notes: targetFrame.notes,
              image: null
            })
            setImagePreview(targetFrame.thumbnail)
          }
        }
      } catch (e) {
        console.error('فشل تحميل بيانات الإطار:', e)
      } finally {
        setLoading(false)
      }
    }
    
    loadFrameData()
  }, [episodeId, frameId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !episodeId) return

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      alert('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.')
      e.target.value = ''
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.')
      e.target.value = ''
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

  const handleSave = async () => {
    if (!frame || !episodeId || !formData.title.trim()) return

    try {
      setSaving(true)
      let thumbnailUrl = frame.thumbnail
      
      // Upload new image to Supabase Storage if provided
      if (formData.image) {
        try {
          setIsUploading(true)
          console.log('🔄 بدء رفع الصورة الجديدة...', formData.image.name)
          const fileName = `frame-${Date.now()}-${formData.image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const uploadedUrl = await storyboardStorage.uploadStoryboardImage(episodeId, fileName, formData.image)
          
          if (uploadedUrl) {
            thumbnailUrl = uploadedUrl
            console.log('✅ تم رفع الصورة بنجاح:', uploadedUrl)
          }
        } catch (uploadError) {
          console.error('❌ فشل رفع الصورة:', uploadError)
          alert('فشل في رفع الصورة. سيتم حفظ التعديلات الأخرى.')
        } finally {
          setIsUploading(false)
        }
      }

      // Update frame data
      const updatedFrames = frames.map(f =>
        f.id === frame.id
          ? {
              ...f,
              title: formData.title.trim(),
              description: formData.description.trim(),
              duration: formData.duration,
              notes: formData.notes.trim(),
              thumbnail: thumbnailUrl
            }
          : f
      )
      
      setFrames(updatedFrames)
      
      // Update local frame state
      const updatedFrame = updatedFrames.find(f => f.id === frame.id)
      if (updatedFrame) {
        setFrame(updatedFrame)
      }
      
      // Persist changes to Supabase
      await storyboardApi.saveFrames(episodeId, updatedFrames)
      
      // Reset form image
      setFormData({ ...formData, image: null })
      
      console.log('✅ تم حفظ تعديلات الإطار بنجاح')
    } catch (e) {
      console.error('فشل حفظ تعديلات الإطار:', e)
      alert('فشل في حفظ التعديلات. يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري تحميل بيانات الإطار...</span>
        </div>
      </div>
    )
  }

  if (!frame) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">الإطار غير موجود</p>
          <Button onClick={() => navigate(`/episodes/${episodeId}`)}>
            العودة للحلقة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <EpisodeDetailHeader
          title={frame.title}
          description="تعديل إطار الستوري بورد"
          onHome={() => navigate('/')}
          onEpisodes={() => navigate('/episodes')}
        />
      </div>

      {/* Main Content with Fixed Sidebar */}
      <div className="flex-1 flex">
        {/* Fixed Sidebar */}
        <div className="sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
          <div className="w-[260px] p-4">
            <EpisodeSidebar
              items={TABS}
              active={activeSidebarTab}
              onChange={(k) => {
                setActiveSidebarTab(k)
                if (k !== 'storyboard') {
                  navigate(`/episodes/${episodeId}`)
                }
              }}
            />
          </div>
        </div>

        {/* Scrollable Content with 80% width */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto p-6">
            {/* Frame Toolbar (no Card frame) */}
            <div className="mb-6 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/episodes/${episodeId}`)}
                    className="p-2"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <h1 className="text-lg font-semibold">{frame.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary"
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center gap-2"
                  >
                    تعديل الإطار
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || isUploading || !formData.title.trim()}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ التعديلات'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-[1fr_320px] gap-6 min-h-[70vh]">
              {/* Image Viewer */}
              <div className="flex-1 relative">
                <div
                  className="h-full overflow-hidden relative"
                  ref={viewerRef}
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px)`
                    }}
                  >
                    <div className="relative">
                      <img
                        src={imagePreview || frame.thumbnail}
                        alt={frame.title}
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
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
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

              {/* Edit Panel removed: replaced with modal */}

              {/* Comments Panel - Far Right */}
              <Card className="w-[320px] flex flex-col rounded-lg border">
                <CardHeader className="border-b border-border bg-muted/30">
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
            <Card className="border-t border-border rounded-none mt-6">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg">إصدارات الإطار</CardTitle>
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
        </main>
      </div>

      {/* Edit Frame Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل الإطار</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">العنوان</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان الإطار"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">الوصف</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الإطار"
                rows={3}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium mb-2 block">المدة (بالثواني)</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 2 })}
                placeholder="2.5"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">ملاحظات</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
                rows={2}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">استبدال الصورة</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-modal"
                />
                <label
                  htmlFor="image-upload-modal"
                  className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload size={16} />
                  <span className="text-sm">اختر صورة جديدة</span>
                </label>
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري رفع الصورة...
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>إلغاء</Button>
              <Button onClick={async () => { await handleSave(); setIsEditOpen(false) }}>حفظ</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}