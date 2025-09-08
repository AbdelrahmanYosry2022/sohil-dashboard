import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, User, Film, Zap, Workflow, Clapperboard } from 'lucide-react';

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

export const useAnimationTab = () => {
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

  // Helper functions
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  }

  // Animation controls
  const playAnimation = () => {
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const stopAnimation = () => {
    setIsPlaying(false)
    setCurrentFrame(0)
  }

  const nextFrame = () => {
    if (selectedSequence) {
      setCurrentFrame(Math.min(selectedSequence.totalFrames - 1, currentFrame + 1))
    }
  }

  const previousFrame = () => {
    setCurrentFrame(Math.max(0, currentFrame - 1))
  }

  const selectSequence = (sequence: AnimationSequence) => {
    setSelectedSequence(sequence)
    setCurrentFrame(0)
    setIsPlaying(false)
  }

  // Computed values
  const totalSequences = sequences.length
  const completedSequences = sequences.filter(s => s.status === 'approved').length
  const overallProgress = totalSequences > 0 ? (completedSequences / totalSequences) * 100 : 0
  const totalDuration = sequences.reduce((sum, seq) => sum + seq.duration, 0)

  // Sequence type counts
  const sequenceTypeCounts = {
    character: sequences.filter(s => s.type === 'character').length,
    camera: sequences.filter(s => s.type === 'camera').length,
    effect: sequences.filter(s => s.type === 'effect').length,
    transition: sequences.filter(s => s.type === 'transition').length
  }

  return {
    // State
    sequences,
    scenes,
    selectedSequence,
    isPlaying,
    currentFrame,
    
    // Actions
    setSequences,
    setSelectedSequence,
    setIsPlaying,
    setCurrentFrame,
    playAnimation,
    pauseAnimation,
    stopAnimation,
    nextFrame,
    previousFrame,
    selectSequence,
    
    // Helper functions
    getStatusColor,
    getStatusIcon,
    getTypeIcon,
    formatTime,
    
    // Computed values
    totalSequences,
    completedSequences,
    overallProgress,
    totalDuration,
    sequenceTypeCounts
  }
}

export type { AnimationSequence, AnimationScene }