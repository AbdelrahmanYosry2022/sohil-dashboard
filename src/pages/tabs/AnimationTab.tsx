import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  Clapperboard, 
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
  Zap,
  RotateCw,
  Move3D,
  Timer,
  Target,
  Workflow
} from 'lucide-react'

interface AnimationSequence {
  id: string
  name: string
  type: 'character' | 'camera' | 'effect' | 'transition'
  status: 'draft' | 'review' | 'approved' | 'revision'
  progress: number
  duration: number // in seconds
  frameRate: number
  totalFrames: number
  assignedTo: string
  dueDate: Date
  sceneId: string
  keyframes: number[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface AnimationScene {
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed'
  sequences: string[]
  totalDuration: number
  complexity: 'simple' | 'medium' | 'complex'
  estimatedHours: number
  actualHours?: number
}

export default function AnimationTab() {
  const [sequences, setSequences] = useState<AnimationSequence[]>([
    {
      id: '1',
      name: 'حركة الشخصية الرئيسية - المشي',
      type: 'character',
      status: 'approved',
      progress: 100,
      duration: 3.5,
      frameRate: 24,
      totalFrames: 84,
      assignedTo: 'سارة أحمد',
      dueDate: new Date('2024-02-15'),
      sceneId: '1',
      keyframes: [1, 12, 24, 36, 48, 60, 72, 84],
      notes: 'تم اعتماد الحركة النهائية',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '2',
      name: 'حركة الكاميرا - زوم للداخل',
      type: 'camera',
      status: 'review',
      progress: 85,
      duration: 2.0,
      frameRate: 24,
      totalFrames: 48,
      assignedTo: 'محمد علي',
      dueDate: new Date('2024-02-20'),
      sceneId: '1',
      keyframes: [1, 16, 32, 48],
      notes: 'في انتظار مراجعة سرعة الحركة',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-18')
    },
    {
      id: '3',
      name: 'تأثير الانفجار السحري',
      type: 'effect',
      status: 'draft',
      progress: 60,
      duration: 1.5,
      frameRate: 30,
      totalFrames: 45,
      assignedTo: 'أمينة حسن',
      dueDate: new Date('2024-02-25'),
      sceneId: '2',
      keyframes: [1, 15, 30, 45],
      notes: 'يحتاج إضافة جزيئات الضوء',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-19')
    }
  ])

  const [scenes] = useState<AnimationScene[]>([
    {
      id: '1',
      title: 'المشهد الأول: الافتتاحية',
      status: 'completed',
      sequences: ['1', '2'],
      totalDuration: 5.5,
      complexity: 'medium',
      estimatedHours: 16,
      actualHours: 18
    },
    {
      id: '2',
      title: 'المشهد الثاني: السحر',
      status: 'in_progress',
      sequences: ['3'],
      totalDuration: 1.5,
      complexity: 'complex',
      estimatedHours: 24,
      actualHours: 12
    },
    {
      id: '3',
      title: 'المشهد الثالث: التحول',
      status: 'not_started',
      sequences: [],
      totalDuration: 0,
      complexity: 'complex',
      estimatedHours: 28
    }
  ])

  const [selectedSequence, setSelectedSequence] = useState<AnimationSequence | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)

  const getStatusColor = (status: AnimationSequence['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'review': return 'bg-yellow-500'
      case 'approved': return 'bg-green-500'
      case 'revision': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: AnimationSequence['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'revision': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: AnimationSequence['type']) => {
    switch (type) {
      case 'character': return <User className="h-4 w-4" />
      case 'camera': return <Film className="h-4 w-4" />
      case 'effect': return <Zap className="h-4 w-4" />
      case 'transition': return <Workflow className="h-4 w-4" />
      default: return <Clapperboard className="h-4 w-4" />
    }
  }

  const totalSequences = sequences.length
  const completedSequences = sequences.filter(s => s.status === 'approved').length
  const overallProgress = totalSequences > 0 ? (completedSequences / totalSequences) * 100 : 0
  const totalDuration = sequences.reduce((sum, seq) => sum + seq.duration, 0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة التحريك</h1>
          <p className="text-muted-foreground">تحريك الشخصيات والعناصر وإنشاء التأثيرات المتحركة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4" />
            رفع تسلسل
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            تسلسل جديد
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">التسلسلات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSequences}</div>
            <p className="text-xs text-muted-foreground">تسلسل حركي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSequences}</div>
            <p className="text-xs text-muted-foreground">معتمدة ومكتملة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">المدة الإجمالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalDuration)}</div>
            <p className="text-xs text-muted-foreground">دقيقة:ثانية</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Animation Preview */}
          {selectedSequence && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  معاينة التحريك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium text-lg">{selectedSequence.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSequence.totalFrames} إطار • {selectedSequence.frameRate} إطار/ثانية
                  </p>
                </div>
                
                {/* Animation Canvas Placeholder */}
                <div className="bg-muted/20 border-2 border-dashed border-muted rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Film className="h-12 w-12 mx-auto mb-2" />
                    <p>معاينة التحريك</p>
                    <p className="text-sm">الإطار {currentFrame + 1} من {selectedSequence.totalFrames}</p>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0s</span>
                    <span>{formatTime(selectedSequence.duration)}</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(currentFrame / selectedSequence.totalFrames) * 100}%` }}
                    />
                    {/* Keyframes */}
                    {selectedSequence.keyframes.map((frame, index) => (
                      <div
                        key={index}
                        className="absolute top-0 w-1 h-full bg-yellow-500 rounded-full"
                        style={{ left: `${(frame / selectedSequence.totalFrames) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentFrame(Math.min(selectedSequence.totalFrames - 1, currentFrame + 1))}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentFrame(0)}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Animation Sequences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clapperboard className="h-5 w-5" />
                التسلسلات المتحركة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sequences.map((sequence) => (
                  <div 
                    key={sequence.id} 
                    className={`border rounded-lg p-4 space-y-3 cursor-pointer transition-colors ${
                      selectedSequence?.id === sequence.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedSequence(sequence)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(sequence.type)}
                        <div>
                          <h4 className="font-medium">{sequence.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {formatTime(sequence.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Film className="h-3 w-3" />
                              {sequence.totalFrames} إطار
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {sequence.frameRate} fps
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(sequence.status)} text-white text-xs`}
                        >
                          {getStatusIcon(sequence.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>التقدم</span>
                        <span>{sequence.progress}%</span>
                      </div>
                      <Progress value={sequence.progress} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>المسؤول: {sequence.assignedTo}</span>
                      <span>الإطارات المفتاحية: {sequence.keyframes.length}</span>
                    </div>
                    
                    {sequence.notes && (
                      <p className="text-xs bg-muted/50 p-2 rounded">{sequence.notes}</p>
                    )}
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scenes Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                تقدم المشاهد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenes.map((scene) => (
                <div key={scene.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{scene.title}</h4>
                    <Badge 
                      variant={scene.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {scene.status === 'completed' && 'مكتمل'}
                      {scene.status === 'in_progress' && 'قيد العمل'}
                      {scene.status === 'not_started' && 'لم يبدأ'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">التسلسلات: </span>
                      <span className="font-medium">{scene.sequences.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">المدة: </span>
                      <span className="font-medium">{formatTime(scene.totalDuration)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الساعات: </span>
                      <span className="font-medium">
                        {scene.actualHours || 0}/{scene.estimatedHours}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Animation Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clapperboard className="h-4 w-4" />
                أدوات التحريك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Move3D className="h-4 w-4" />
                أداة التحريك
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RotateCw className="h-4 w-4" />
                أداة الدوران
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Zap className="h-4 w-4" />
                محرر التأثيرات
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="h-4 w-4" />
                الإطارات المفتاحية
              </Button>
            </CardContent>
          </Card>

          {/* Sequence Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">أنواع التسلسلات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: 'character', count: sequences.filter(s => s.type === 'character').length, label: 'حركة الشخصيات' },
                { type: 'camera', count: sequences.filter(s => s.type === 'camera').length, label: 'حركة الكاميرا' },
                { type: 'effect', count: sequences.filter(s => s.type === 'effect').length, label: 'التأثيرات' },
                { type: 'transition', count: sequences.filter(s => s.type === 'transition').length, label: 'الانتقالات' }
              ].map((item) => (
                <div key={item.type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4" />
                تصدير التحريك
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4" />
                استيراد تسلسل
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4" />
                معاينة المشروع
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
