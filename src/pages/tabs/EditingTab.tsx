import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  Scissors, 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Upload, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  MoreHorizontal,
  Film,
  Layers,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  Clipboard,
  Merge,
  Split,
  Crop
} from 'lucide-react'
import TabHeader from '../../components/TabHeader'

interface EditingClip {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'text'
  status: 'raw' | 'editing' | 'review' | 'final'
  duration: number // in seconds
  startTime: number
  endTime: number
  trackId: string
  sceneId: string
  effects: string[]
  transitions: string[]
  assignedTo: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface EditingTrack {
  id: string
  name: string
  type: 'video' | 'audio' | 'subtitle'
  clips: string[]
  muted: boolean
  volume: number
  locked: boolean
}

interface EditingProject {
  id: string
  name: string
  duration: number
  frameRate: number
  resolution: string
  status: 'draft' | 'review' | 'final'
  progress: number
}

export default function EditingTab() {
  const [clips, setClips] = useState<EditingClip[]>([
    {
      id: '1',
      name: 'المشهد الأول - لقطة عامة',
      type: 'video',
      status: 'final',
      duration: 15.5,
      startTime: 0,
      endTime: 15.5,
      trackId: 'video1',
      sceneId: '1',
      effects: ['color_correction', 'stabilization'],
      transitions: ['fade_in'],
      assignedTo: 'أحمد محمد',
      notes: 'تم تطبيق تصحيح الألوان',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '2',
      name: 'حوار الشخصية الرئيسية',
      type: 'audio',
      status: 'review',
      duration: 12.0,
      startTime: 2.0,
      endTime: 14.0,
      trackId: 'audio1',
      sceneId: '1',
      effects: ['noise_reduction', 'eq'],
      transitions: [],
      assignedTo: 'فاطمة علي',
      notes: 'يحتاج ضبط مستوى الصوت',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-18')
    },
    {
      id: '3',
      name: 'تأثير الانفجار السحري',
      type: 'video',
      status: 'editing',
      duration: 3.0,
      startTime: 10.0,
      endTime: 13.0,
      trackId: 'effects1',
      sceneId: '2',
      effects: ['glow', 'particles'],
      transitions: ['cross_dissolve'],
      assignedTo: 'محمد حسن',
      notes: 'قيد إضافة التأثيرات البصرية',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-19')
    }
  ])

  const [tracks] = useState<EditingTrack[]>([
    {
      id: 'video1',
      name: 'الفيديو الرئيسي',
      type: 'video',
      clips: ['1'],
      muted: false,
      volume: 100,
      locked: false
    },
    {
      id: 'audio1',
      name: 'الصوت الرئيسي',
      type: 'audio',
      clips: ['2'],
      muted: false,
      volume: 85,
      locked: false
    },
    {
      id: 'effects1',
      name: 'التأثيرات البصرية',
      type: 'video',
      clips: ['3'],
      muted: false,
      volume: 100,
      locked: false
    }
  ])

  const [project] = useState<EditingProject>({
    id: '1',
    name: 'الحلقة الأولى - المونتاج النهائي',
    duration: 180, // 3 minutes
    frameRate: 24,
    resolution: '1920x1080',
    status: 'review',
    progress: 75
  })

  const [selectedClip, setSelectedClip] = useState<EditingClip | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)

  const getStatusColor = (status: EditingClip['status']) => {
    switch (status) {
      case 'raw': return 'bg-gray-500'
      case 'editing': return 'bg-blue-500'
      case 'review': return 'bg-yellow-500'
      case 'final': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: EditingClip['status']) => {
    switch (status) {
      case 'final': return <CheckCircle className="h-4 w-4" />
      case 'review': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: EditingClip['type']) => {
    switch (type) {
      case 'video': return <Film className="h-4 w-4" />
      case 'audio': return <Volume2 className="h-4 w-4" />
      case 'image': return <Eye className="h-4 w-4" />
      case 'text': return <Edit3 className="h-4 w-4" />
      default: return <Film className="h-4 w-4" />
    }
  }

  const totalClips = clips.length
  const finalClips = clips.filter(c => c.status === 'final').length
  const overallProgress = totalClips > 0 ? (finalClips / totalClips) * 100 : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="إدارة المونتاج"
        description="تحرير ومونتاج المقاطع والمشاهد النهائية"
        actions={(
          <>
            <Button variant="outline">
              <Upload className="h-4 w-4" />
              رفع مقطع
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              مقطع جديد
            </Button>
          </>
        )}
      />

      {/* Project Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                {project.name}
              </CardTitle>
              <CardDescription>
                {project.resolution} • {project.frameRate} fps • {formatTime(project.duration)}
              </CardDescription>
            </div>
            <Badge 
              variant={project.status === 'final' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {project.status === 'draft' && 'مسودة'}
              {project.status === 'review' && 'مراجعة'}
              {project.status === 'final' && 'نهائي'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>تقدم المشروع</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
                معاينة
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي المقاطع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClips}</div>
            <p className="text-xs text-muted-foreground">مقطع</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">المقاطع النهائية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{finalClips}</div>
            <p className="text-xs text-muted-foreground">مكتملة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {clips.filter(c => c.status === 'review').length}
            </div>
            <p className="text-xs text-muted-foreground">ينتظر الموافقة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">التقدم العام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  معاينة المونتاج
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2 py-1">{zoomLevel}%</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Canvas */}
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Film className="h-16 w-16 mx-auto mb-4" />
                  <p>معاينة الفيديو</p>
                  <p className="text-sm">{formatTime(currentTime)} / {formatTime(project.duration)}</p>
                </div>
              </div>
              
              {/* Timeline Controls */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(project.duration)}</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full cursor-pointer">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(currentTime / project.duration) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm">
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button variant="outline" size="sm">
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Tracks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                المسارات الزمنية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div key={track.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Toggle mute logic here
                          }}
                        >
                          {track.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <div>
                          <h4 className="font-medium text-sm">{track.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {track.type === 'video' && 'فيديو'}
                            {track.type === 'audio' && 'صوت'}
                            {track.type === 'subtitle' && 'ترجمة'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{track.volume}%</span>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Track Timeline */}
                    <div className="relative h-12 bg-muted/20 rounded border-2 border-dashed">
                      {track.clips.map((clipId) => {
                        const clip = clips.find(c => c.id === clipId)
                        if (!clip) return null
                        
                        const leftPercent = (clip.startTime / project.duration) * 100
                        const widthPercent = (clip.duration / project.duration) * 100
                        
                        return (
                          <div
                            key={clipId}
                            className={`absolute top-1 bottom-1 rounded cursor-pointer transition-colors ${
                              selectedClip?.id === clipId ? 'bg-primary' : 'bg-primary/70'
                            } hover:bg-primary`}
                            style={{ 
                              left: `${leftPercent}%`, 
                              width: `${widthPercent}%` 
                            }}
                            onClick={() => setSelectedClip(clip)}
                          >
                            <div className="p-1 text-xs text-white truncate">
                              {clip.name}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Editing Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                أدوات المونتاج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Scissors className="h-4 w-4" />
                قص
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Copy className="h-4 w-4" />
                نسخ
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Clipboard className="h-4 w-4" />
                لصق
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Split className="h-4 w-4" />
                تقسيم
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Merge className="h-4 w-4" />
                دمج
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Crop className="h-4 w-4" />
                اقتصاص
              </Button>
            </CardContent>
          </Card>

          {/* Clip Details */}
          {selectedClip && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getTypeIcon(selectedClip.type)}
                  تفاصيل المقطع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">{selectedClip.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    المدة: {formatTime(selectedClip.duration)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>الحالة</span>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(selectedClip.status)} text-white text-xs`}
                    >
                      {selectedClip.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-xs">
                  <p><span className="text-muted-foreground">المسؤول:</span> {selectedClip.assignedTo}</p>
                  <p><span className="text-muted-foreground">التأثيرات:</span> {selectedClip.effects.length}</p>
                  <p><span className="text-muted-foreground">الانتقالات:</span> {selectedClip.transitions.length}</p>
                </div>
                
                {selectedClip.notes && (
                  <div className="bg-muted/50 p-2 rounded text-xs">
                    {selectedClip.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4" />
                تصدير المشروع
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4" />
                استيراد مقاطع
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4" />
                معاينة نهائية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
