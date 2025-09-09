import { useState, useRef, useEffect } from 'react';
import { tabOperations } from '../../../lib/supabase';

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number; // in MB
  type: string;
  notes?: string;
  sceneId?: string;
  createdAt: Date;
}

export interface Scene {
  id: string;
  title: string;
  description?: string;
}

export const useAudioTab = (episodeId: string | null) => {
  // State
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [scenes] = useState<Scene[]>([
    { id: '1', title: 'المشهد الأول', description: 'مقدمة الحلقة' },
    { id: '2', title: 'المشهد الثاني', description: 'المحتوى الرئيسي' },
    { id: '3', title: 'المشهد الثالث', description: 'الخاتمة' }
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

  // Load audio files on mount
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

  // Audio element effect
  useEffect(() => {
    if (currentAudio && audioRef.current) {
      audioRef.current.src = currentAudio.url;
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
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

  // Functions
  const loadAudioFiles = async () => {
    try {
      setIsLoading(true);
      const loadedFiles = await tabOperations.audio.loadAudioFiles(episodeId!);
      if (loadedFiles.length > 0) {
        setAudioFiles(loadedFiles);
      } else {
        setAudioFiles([]);
      }
    } catch (error) {
      console.error('Error loading audio files:', error);
      setAudioFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAudioFiles = async () => {
    if (!episodeId) return;

    try {
      setIsSaving(true);
      await tabOperations.audio.saveAudioFiles(episodeId, audioFiles);
      console.log('تم حفظ جميع ملفات الصوت بنجاح');
    } catch (error) {
      console.error('Error saving audio files:', error);
      alert('حدث خطأ أثناء حفظ ملفات الصوت. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  // Audio player functions
  const playAudio = async (audioFile: AudioFile) => {
    if (currentAudio?.id === audioFile.id && isPlaying) {
      pauseAudio();
    } else {
      try {
        setCurrentAudio(audioFile);
        setIsPlaying(true);
        
        if (audioFile.url.startsWith('blob:')) {
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
            duration: 0,
            size: file.size / (1024 * 1024),
            type: file.type,
            notes: '',
            createdAt: new Date()
          };
          newFiles.push(newAudioFile);
        }
      });
      
      if (newFiles.length > 0) {
        setAudioFiles(prev => [...prev, ...newFiles]);
        
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
        
        setAudioFiles(prev => {
          const updatedFiles = [...prev, newRecording];
          
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
    const fileToDelete = audioFiles.find(file => file.id === fileId);
    if (fileToDelete && fileToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToDelete.url);
    }
    
    setAudioFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== fileId);
      
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

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (mb: number) => {
    return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && currentAudio) {
      const duration = audioRef.current.duration;
      if (duration && duration !== currentAudio.duration) {
        setAudioFiles(prev => prev.map(file =>
          file.id === currentAudio.id ? { ...file, duration } : file
        ));
        setCurrentAudio({ ...currentAudio, duration });
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  };

  // Computed values
  const totalDuration = audioFiles.reduce((total, file) => total + file.duration, 0);
  const totalSize = audioFiles.reduce((total, file) => total + file.size, 0);
  const linkedFilesCount = audioFiles.filter(f => f.sceneId).length;

  return {
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
    loadAudioFiles,
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
  };
};