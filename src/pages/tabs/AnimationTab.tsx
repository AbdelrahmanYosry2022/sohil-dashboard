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
  Film,
  Layers,
  Zap,
  RotateCw,
  Move3D,
  Timer,
  Target,
  Workflow
} from 'lucide-react'
import TabHeader from '../../components/TabHeader'
import { useAnimationTab } from '../../hooks/useAnimationTab.tsx'

export default function AnimationTab() {
  const {
    sequences,
    scenes,
    selectedSequence,
    isPlaying,
    currentFrame,
    setCurrentFrame,
    playAnimation,
    pauseAnimation,
    stopAnimation,
    nextFrame,
    previousFrame,
    selectSequence,
    getStatusColor,
    getStatusIcon,
    getTypeIcon,
    formatTime,
    totalSequences,
    completedSequences,
    overallProgress,
    totalDuration,
    sequenceTypeCounts
  } = useAnimationTab()

  return (
    <>
      {/* Header */}
      <TabHeader
        title="إدارة التحريك"
        description="تحريك الشخصيات والعناصر وإنشاء التأثيرات المتحركة"
        actions={(
          <>
            <Button variant="outline">
              <Upload className="h-4 w-4" />
              رفع تسلسل
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              تسلسل جديد
            </Button>
          </>
        )}
      />

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
                    onClick={previousFrame}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={isPlaying ? pauseAnimation : playAnimation}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextFrame}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopAnimation}
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
                    onClick={() => selectSequence(sequence)}
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">حركة الشخصيات:</span>
                <span className="font-medium">{sequenceTypeCounts.character}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">حركة الكاميرا:</span>
                <span className="font-medium">{sequenceTypeCounts.camera}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التأثيرات:</span>
                <span className="font-medium">{sequenceTypeCounts.effect}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الانتقالات:</span>
                <span className="font-medium">{sequenceTypeCounts.transition}</span>
              </div>
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
    </>
  )
}
