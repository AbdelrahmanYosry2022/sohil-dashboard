import { useState } from 'react'

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

export const useEditingTab = () => {
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

  // Helper functions
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
      case 'final': return 'CheckCircle'
      case 'review': return 'AlertCircle'
      default: return 'Clock'
    }
  }

  const getTypeIcon = (type: EditingClip['type']) => {
    switch (type) {
      case 'video': return 'Film'
      case 'audio': return 'Volume2'
      case 'image': return 'Eye'
      case 'text': return 'Edit3'
      default: return 'Film'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  }

  // Computed values
  const totalClips = clips.length
  const finalClips = clips.filter(c => c.status === 'final').length
  const overallProgress = totalClips > 0 ? (finalClips / totalClips) * 100 : 0
  const reviewClips = clips.filter(c => c.status === 'review').length

  // Actions
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const updateZoomLevel = (delta: number) => {
    setZoomLevel(prev => Math.max(50, Math.min(200, prev + delta)))
  }

  const resetZoom = () => {
    setZoomLevel(100)
  }

  const selectClip = (clip: EditingClip) => {
    setSelectedClip(clip)
  }

  const updateCurrentTime = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(project.duration, time)))
  }

  const skipToStart = () => {
    setCurrentTime(0)
  }

  const skipToEnd = () => {
    setCurrentTime(project.duration)
  }

  const stopPlayback = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const toggleTrackMute = (trackId: string) => {
    // This would update the track's muted state
    // For now, it's a placeholder
    console.log(`Toggle mute for track: ${trackId}`)
  }

  const updateTrackVolume = (trackId: string, volume: number) => {
    // This would update the track's volume
    // For now, it's a placeholder
    console.log(`Update volume for track ${trackId}: ${volume}`)
  }

  return {
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
    getTypeIcon,
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
  }
}