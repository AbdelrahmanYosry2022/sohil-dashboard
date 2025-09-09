import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
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
import TabHeader from '../../../components/TabHeader'
import { useEditingTab } from '../hooks/useEditingTab'

export default function EditingTab() {
  const {
    // State
    clips,
    tracks,
    project,
    selectedClip,
    isPlaying,
    currentTime,
    zoomLevel,
    
    // Computed values
    totalClips,
    finalClips,
    overallProgress,
    reviewClips,
    
    // Helper functions
    getStatusColor,
    getStatusIcon,
    getStatusIconComponent: getStatusIconComponentFromHook,
    getTypeIcon,
    getTypeIconComponent: getTypeIconComponentFromHook,
    formatTime,
    
    // Actions
    setSelectedClip,
    setIsPlaying,
    setCurrentTime,
    setZoomLevel,
    togglePlayback,
    updateZoomLevel,
    resetZoom,
    selectClip,
    updateCurrentTime,
    skipToStart,
    skipToEnd,
    stopPlayback,
    toggleTrackMute,
    updateTrackVolume
  } = useEditingTab()

  // Get icon components from the hook
  const getStatusIconComponent = (status: 'raw' | 'editing' | 'review' | 'final') => {
    const iconName = getStatusIconComponentFromHook(status);
    switch (iconName) {
      case 'CheckCircle': return <CheckCircle className="h-4 w-4" />
      case 'AlertCircle': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIconComponent = (type: 'video' | 'audio' | 'image' | 'text') => {
    const iconName = getTypeIconComponentFromHook(type);
    switch (iconName) {
      case 'Film': return <Film className="h-4 w-4" />
      case 'Volume2': return <Volume2 className="h-4 w-4" />
      case 'Eye': return <Eye className="h-4 w-4" />
      case 'Edit3': return <Edit3 className="h-4 w-4" />
      default: return <Film className="h-4 w-4" />
    }
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
            <div className="text-2xl font-bold text-yellow-600">{reviewClips}</div>
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
                    onClick={() => updateZoomLevel(-25)}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2 py-1">{zoomLevel}%</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateZoomLevel(25)}
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
                <Button variant="outline" size="sm" onClick={skipToStart}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button size="lg" onClick={togglePlayback}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button variant="outline" size="sm" onClick={skipToEnd}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={stopPlayback}>
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
                          onClick={() => toggleTrackMute(track.id)}
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
                            onClick={() => selectClip(clip)}
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
                  {getTypeIconComponent(selectedClip.type)}
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
