import { useEffect, useRef, useState } from 'react'
import { tabOperations } from '../../../lib/supabase'
import { useParams } from 'react-router-dom'

interface Scene {
  id: string
  title: string
  content: string
  duration?: number
}

export const useTextTab = () => {
  const { id: episodeId } = useParams()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPreview, setIsPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const scenesContainerRef = useRef<HTMLDivElement>(null)

  // Load scenes from database on component mount
  useEffect(() => {
    if (episodeId) {
      loadScenes()
    }
  }, [episodeId])

  const loadScenes = async () => {
    try {
      setIsLoading(true)
      const loadedScenes = await tabOperations.text.loadScenes(episodeId!)
      setScenes(loadedScenes)
    } catch (error) {
      console.error('Error loading scenes:', error)
      setScenes([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveScenes = async () => {
    if (!episodeId) return

    try {
      setIsSaving(true)
      await tabOperations.text.saveScenes(episodeId, scenes)
      console.log('تم حفظ جميع المشاهد بنجاح')
    } catch (error) {
      console.error('Error saving scenes:', error)
      alert('حدث خطأ أثناء حفظ المشاهد. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSaving(false)
    }
  }

  const currentScene = scenes[currentSceneIndex]

  useEffect(() => {
    if (scenesContainerRef.current) {
      const activeButton = scenesContainerRef.current.querySelector(
        `[data-scene-index="${currentSceneIndex}"]`,
      ) as HTMLElement | null
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [currentSceneIndex])



  const formatText = (format: string) => {
    console.log(`تطبيق تنسيق: ${format}`)
  }

  const exportContent = () => {
    const fullContent = scenes
      .map((scene) => `${scene.title}\n${'='.repeat(50)}\n\n${scene.content}\n\n`)
      .join('\n')

    const element = document.createElement('a')
    const file = new Blob([fullContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'episode-complete-script.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSceneContentChange = (newContent: string) => {
    const updatedScenes = [...scenes]
    updatedScenes[currentSceneIndex] = { ...updatedScenes[currentSceneIndex], content: newContent }
    setScenes(updatedScenes)
  }

  const handleSceneTitleChange = (newTitle: string) => {
    const updatedScenes = [...scenes]
    updatedScenes[currentSceneIndex] = { ...updatedScenes[currentSceneIndex], title: newTitle }
    setScenes(updatedScenes)
  }

  const addNewScene = () => {
    const newScene: Scene = { id: (scenes.length + 1).toString(), title: `المشهد ${scenes.length + 1}`, content: '' }
    setScenes([...scenes, newScene])
    setCurrentSceneIndex(scenes.length)
  }

  const deleteScene = (sceneIndex: number) => {
    if (scenes.length <= 1) {
      alert('لا يمكن حذف المشهد الوحيد!')
      return
    }
    const updatedScenes = scenes.filter((_, index) => index !== sceneIndex)
    setScenes(updatedScenes)
    if (currentSceneIndex >= updatedScenes.length) setCurrentSceneIndex(updatedScenes.length - 1)
  }

  const navigateToScene = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSceneIndex > 0) setCurrentSceneIndex(currentSceneIndex - 1)
    else if (direction === 'next' && currentSceneIndex < scenes.length - 1)
      setCurrentSceneIndex(currentSceneIndex + 1)
  }

  return {
    // State
    scenes,
    currentSceneIndex,
    isPreview,
    isLoading,
    isSaving,
    currentScene,
    
    // Refs
    scenesContainerRef,
    
    // Functions
    setCurrentSceneIndex,
    setIsPreview,
    saveScenes,
    formatText,
    exportContent,
    handleSceneContentChange,
    handleSceneTitleChange,
    addNewScene,
    deleteScene,
    navigateToScene,
  }
}