"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Upload,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Mic,
  MicOff,
  Download,
  Trash2,
  Edit3,
  Save,
  FileAudio,
  Clock,
  Waves,
  Settings,
  Link,
  Unlink,
  Eye,
  RotateCcw,
  Loader2
} from "lucide-react";
import { tabOperations } from '../../lib/supabase'
import { useParams } from 'react-router-dom'
import TabHeader from '../../components/TabHeader'

// Audio file interface
interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  type: string;
  sceneId?: string;
  notes?: string;
  createdAt: Date;
}

// Scene interface (matching text page)
interface Scene {
  id: string;
  title: string;
  content: string;
  duration?: number;
}

export default function AudioTab() {
  const { id: episodeId } = useParams()

  // Audio files state
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  // Scenes data (would normally come from parent or API)
  const [scenes] = useState<Scene[]>([
    { id: '1', title: 'المشهد الأول: الافتتاحية', content: '', duration: 45 },
    { id: '2', title: 'المشهد الثاني: التطوير', content: '', duration: 120 },
    { id: '3', title: 'المشهد الثالث: الخاتمة', content: '', duration: 90 }
  ]);

  // Audio player state
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // UI state
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load audio files on component mount
  useEffect(() => {
    if (episodeId) {
      loadAudioFiles();
    }
  }, [episodeId]);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      audioFiles.forEach(file => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [audioFiles]);
  const loadAudioFiles = async () => {
    try {
      setIsLoading(true)
      const loadedFiles = await tabOperations.audio.loadAudioFiles(episodeId!)
      if (loadedFiles.length > 0) {
        setAudioFiles(loadedFiles)
      } else {
        // Initialize with default files if none exist
        // Initialize with empty array - no default files
        setAudioFiles([])
      }
    } catch (error) {
      console.error('Error loading audio files:', error)
      // Initialize with empty array on error
      setAudioFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveAudioFiles = async () => {
    if (!episodeId) return

    try {
      setIsSaving(true)
      await tabOperations.audio.saveAudioFiles(episodeId, audioFiles)
      console.log('تم حفظ جميع ملفات الصوت بنجاح')
    } catch (error) {
      console.error('Error saving audio files:', error)
      alert('حدث خطأ أثناء حفظ ملفات الصوت. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSaving(false)
    }
  }

  // Audio player functions
  const playAudio = async (audioFile: AudioFile) => {
    if (currentAudio?.id === audioFile.id && isPlaying) {
      pauseAudio();
    } else {
      try {
        setCurrentAudio(audioFile);
        setIsPlaying(true);
        
        // Check if URL is valid
        if (audioFile.url.startsWith('blob:')) {
          // For blob URLs, we can't validate them easily, just try to play
          console.info('Playing blob URL audio file');
        }
      } catch (error) {
        console.error('Error setting up audio playback:', error);
        setIsPlaying(false);
      }
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopAudio = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // File upload function
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && episodeId) {
      const newFiles: AudioFile[] = [];
      
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('audio/')) {
          const newAudioFile: AudioFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: URL.createObjectURL(file),
            duration: 0, // Would be calculated after loading
            size: file.size / (1024 * 1024), // Convert to MB
            type: file.type,
            notes: '',
            createdAt: new Date()
          };
          newFiles.push(newAudioFile);
        }
      });
      
      if (newFiles.length > 0) {
        // Add files to state immediately
        setAudioFiles(prev => [...prev, ...newFiles]);
        
        // Save to database
        try {
          const allFiles = [...audioFiles, ...newFiles];
          await tabOperations.audio.saveAudioFiles(episodeId, allFiles);
        } catch (error) {
          console.error('Error saving uploaded files:', error);
        }
      }
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const newRecording: AudioFile = {
          id: Date.now().toString(),
          name: `تسجيل_${new Date().toLocaleDateString('ar')}.wav`,
          url,
          duration: recordingTime,
          size: blob.size / (1024 * 1024),
          type: 'audio/wav',
          notes: 'تسجيل جديد',
          createdAt: new Date()
        };
        
        // Add to state immediately
        setAudioFiles(prev => {
          const updatedFiles = [...prev, newRecording];
          
          // Save to database if episodeId exists
          if (episodeId) {
            tabOperations.audio.saveAudioFiles(episodeId, updatedFiles)
              .catch(error => console.error('Error saving recording:', error));
          }
          
          return updatedFiles;
        });
        
        setRecordingTime(0);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Scene linking functions
  const linkToScene = async (fileId: string, sceneId: string) => {
    setAudioFiles(prev => {
      const updatedFiles = prev.map(file => 
        file.id === fileId ? { ...file, sceneId } : file
      );
      
      // Save to database if episodeId exists
      if (episodeId) {
        tabOperations.audio.saveAudioFiles(episodeId, updatedFiles)
          .catch(error => console.error('Error saving scene link:', error));
      }
      
      return updatedFiles;
    });
  };

  const unlinkFromScene = async (fileId: string) => {
    setAudioFiles(prev => {
      const updatedFiles = prev.map(file => 
        file.id === fileId ? { ...file, sceneId: undefined } : file
      );
      
      // Save to database if episodeId exists
      if (episodeId) {
        tabOperations.audio.saveAudioFiles(episodeId, updatedFiles)
          .catch(error => console.error('Error saving scene unlink:', error));
      }
      
      return updatedFiles;
    });
  };

  // Notes editing functions
  const startEditingNotes = (fileId: string, currentNotes: string) => {
    setEditingNotes(fileId);
    setNewNotes(currentNotes || '');
  };

  const saveNotes = async (fileId: string) => {
    setAudioFiles(prev => {
      const updatedFiles = prev.map(file => 
        file.id === fileId ? { ...file, notes: newNotes } : file
      );
      
      // Save to database if episodeId exists
      if (episodeId) {
        tabOperations.audio.saveAudioFiles(episodeId, updatedFiles)
          .catch(error => console.error('Error saving notes:', error));
      }
      
      return updatedFiles;
    });
    
    setEditingNotes(null);
    setNewNotes('');
  };

  const deleteFile = async (fileId: string) => {
    // Find the file to clean up its blob URL
    const fileToDelete = audioFiles.find(file => file.id === fileId);
    if (fileToDelete && fileToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToDelete.url);
    }
    
    setAudioFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== fileId);
      
      // Save to database if episodeId exists
      if (episodeId) {
        tabOperations.audio.saveAudioFiles(episodeId, updatedFiles)
          .catch(error => console.error('Error deleting file:', error));
      }
      
      return updatedFiles;
    });
    
    if (currentAudio?.id === fileId) {
      stopAudio();
      setCurrentAudio(null);
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size helper
  const formatFileSize = (mb: number) => {
    return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  // Audio element effect
  useEffect(() => {
    if (currentAudio && audioRef.current) {
      audioRef.current.src = currentAudio.url;
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
          // Show user-friendly error message
          if (currentAudio.url.startsWith('blob:')) {
            console.warn('Blob URL may have expired. Please re-upload the file.');
          }
        });
      }
    }
  }, [currentAudio, isPlaying]);

  // Progress update effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Reset audio function
  const resetAudio = () => {
    setCurrentAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">جاري تحميل ملفات الصوت...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current && currentAudio) {
            // Update duration if not set
            const duration = audioRef.current.duration;
            if (duration && duration !== currentAudio.duration) {
              setAudioFiles(prev => prev.map(file =>
                file.id === currentAudio.id ? { ...file, duration } : file
              ));
              // Ensure currentAudio state reflects the new duration so the progress dot moves correctly
              setCurrentAudio({ ...currentAudio, duration });
            }
          }
        }}
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
                    onClick={() => isPlaying ? pauseAudio() : setIsPlaying(true)}
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
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          setVolume(newVolume);
                          setIsMuted(newVolume === 0);
                          if (audioRef.current) {
                            audioRef.current.volume = newVolume;
                            audioRef.current.muted = newVolume === 0;
                          }
                        }}
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
                <span className="font-medium">
                  {formatTime(audioFiles.reduce((total, file) => total + file.duration, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الحجم:</span>
                <span className="font-medium">
                  {formatFileSize(audioFiles.reduce((total, file) => total + file.size, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ملفات مرتبطة:</span>
                <span className="font-medium">
                  {audioFiles.filter(f => f.sceneId).length}
                </span>
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
