import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { TabHeader } from '../../../components/TabHeader';
import { useAudioTab } from '../hooks/useAudioTab'
import {
  Upload, Mic, Save, Loader2, Waves, Play, Pause, Square, SkipBack, SkipForward,
  RotateCcw, Volume2, VolumeX, FileAudio, Clock, Settings, Trash2, Edit3,
  Link, Unlink, Download, Eye
} from 'lucide-react';

interface AudioTabProps {
  episodeId: string | null;
}

export function AudioTab({ episodeId }: AudioTabProps) {
  // تنبيه مطور: تحقق من تمرير رقم الحلقة بشكل صحيح
  console.log('AudioTab episodeId:', episodeId);

  if (!episodeId) {
    return (
      <div className="text-center py-12 text-red-500">
        الرجاء اختيار أو تحديد الحلقة أولًا.
      </div>
    );
  }

  const {
    // State
    audioFiles,
    scenes,
    currentAudio,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    isRecording,
    recordingTime,
    selectedFile,
    editingNotes,
    newNotes,
    isLoading,
    isSaving,
    
    // Refs
    audioRef,
    fileInputRef,
    
    // Actions
    setSelectedFile,
    setEditingNotes,
    setNewNotes,
    saveAudioFiles,
    playAudio,
    pauseAudio,
    stopAudio,
    resetAudio,
    handleTimeUpdate,
    handleSeek,
    toggleMute,
    handleFileUpload,
    startRecording,
    stopRecording,
    linkToScene,
    unlinkFromScene,
    startEditingNotes,
    saveNotes,
    deleteFile,
    handleLoadedMetadata,
    handleVolumeChange,
    
    // Helper functions
    formatTime,
    formatFileSize,
    
    // Computed values
    totalDuration,
    totalSize,
    linkedFilesCount
  } = useAudioTab(episodeId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">جاري تحميل ملفات الصوت...</span>
            </div>
                </div>
                );
  }

  return (
    <div className="space-y-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => pauseAudio()}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <TabHeader
        title="إدارة الصوت"
        description="رفع وتحرير وربط الملفات الصوتية بالمشاهد"
        actions={(
          <>
            <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              رفع ملفات صوتية
            </Button>
            <div className="text-sm text-muted-foreground">
              ملاحظة: الملفات المرفوعة محلياً قد لا تعمل بعد إعادة تحميل الصفحة
            </div>
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" />
                  إيقاف التسجيل ({formatTime(recordingTime)})
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  تسجيل جديد
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={saveAudioFiles}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audio Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Audio Player */}
          {currentAudio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  مشغل الصوت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium text-lg">{currentAudio.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentAudio.sceneId && scenes.find(s => s.id === currentAudio.sceneId)?.title}
                  </p>
    </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="font-mono">{formatTime(currentTime)}</span>
                    <span className="text-xs opacity-75">
                      {currentAudio.duration > 0 ? `${Math.round((currentTime / currentAudio.duration) * 100)}%` : '0%'}
                    </span>
                    <span className="font-mono">{formatTime(currentAudio.duration)}</span>
                  </div>
                  <div 
                    className="relative h-3 bg-muted rounded-full cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      const newTime = Math.max(0, Math.min(currentAudio.duration, percent * currentAudio.duration));
                      handleSeek(newTime);
                    }}
                  >
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-150 ease-out relative"
                      style={{ width: `${currentAudio.duration > 0 ? (currentTime / currentAudio.duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-background rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                    title="الإرجاع 10 ثوانٍ"
                  >
                    <SkipBack className="h-4 w-4" />
                    <span className="text-xs mr-1">10s</span>
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={() => isPlaying ? pauseAudio() : playAudio(currentAudio)}
                    title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSeek(Math.min(currentAudio.duration, currentTime + 10))}
                    title="التقديم 10 ثوانٍ"
                  >
                    <span className="text-xs ml-1">10s</span>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopAudio}
                    title="إيقاف"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAudio}
                    title="إلغاء المراجعة"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-2 border-r pr-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      title={isMuted ? "إلغاء الكتم" : "كتم الصوت"}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        dir="ltr"
                        className="w-24 accent-primary"
                        title="مستوى الصوت"
                      />
                      <span className="text-xs text-muted-foreground min-w-[3ch] font-mono">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Files List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                الملفات الصوتية ({audioFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audioFiles.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(file)}
                          className="flex-shrink-0"
                        >
                          {currentAudio?.id === file.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <h4 className="font-medium">{file.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(file.duration)}
                            </span>
                            <span>{formatFileSize(file.size)}</span>
                            <span>{file.type.split('/')[1].toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {file.sceneId && (
                          <Badge variant="secondary" className="text-xs">
                            {scenes.find(s => s.id === file.sceneId)?.title}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(file)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {editingNotes === file.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          placeholder="إضافة ملاحظات..."
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNotes(file.id)}>
                            <Save className="h-3 w-3 mr-1" />
                            حفظ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingNotes(null)}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      file.notes && (
                        <div className="bg-muted/50 p-2 rounded text-sm">
                          <div className="flex items-start justify-between">
                            <p>{file.notes}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingNotes(file.id, file.notes || '')}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                    
                    {!file.notes && editingNotes !== file.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingNotes(file.id, '')}
                        className="text-muted-foreground"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        إضافة ملاحظات
                      </Button>
                    )}
                  </div>
                ))}
                
                {audioFiles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileAudio className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد ملفات صوتية</p>
                    <p className="text-sm">ابدأ برفع ملفات صوتية أو تسجيل صوت جديد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scene Linking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Link className="h-4 w-4" />
                ربط بالمشاهد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scenes.map((scene) => {
                const linkedFiles = audioFiles.filter(f => f.sceneId === scene.id);
                return (
                  <div key={scene.id} className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">{scene.title}</h4>
                    {linkedFiles.length > 0 ? (
                      <div className="space-y-1">
                        {linkedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between text-xs">
                            <span className="truncate">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unlinkFromScene(file.id)}
                            >
                              <Unlink className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">لا توجد ملفات مرتبطة</p>
                    )}
                    
                    {selectedFile && !selectedFile.sceneId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          linkToScene(selectedFile.id, scene.id);
                          setSelectedFile(null);
                        }}
                        className="w-full mt-2"
                      >
                        ربط الملف المحدد
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Audio Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileAudio className="h-4 w-4" />
                إحصائيات الصوت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الملفات:</span>
                <span className="font-medium">{audioFiles.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي المدة:</span>
                <span className="font-medium">{formatTime(totalDuration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الحجم:</span>
                <span className="font-medium">{formatFileSize(totalSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ملفات مرتبطة:</span>
                <span className="font-medium">{linkedFilesCount}</span>
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
                <Download className="h-3 w-3 mr-2" />
                تصدير جميع الملفات
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-3 w-3 mr-2" />
                معاينة المشروع
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RotateCcw className="h-3 w-3 mr-2" />
                استعادة نسخة احتياطية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

