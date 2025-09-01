import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Textarea } from '../../components/ui/textarea'
import {
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react'

interface Scene {
  id: string
  title: string
  content: string
  duration?: number
}

export default function TextTab() {
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: '1',
      title: 'المشهد الأول: الافتتاحية',
      content: `**الراوي:** في عالم مليء بالأحلام والطموحات، تبدأ رحلتنا...

**الشخصية الرئيسية:** مرحباً بكم في عالمنا الجديد

**الشخصية الثانوية:** هذا المكان مذهل!

(صوت الموسيقى الهادئة في الخلفية)

**الراوي:** وهكذا تبدأ قصتنا في هذا العالم الساحر...`,
    },
    {
      id: '2',
      title: 'المشهد الثاني: التطوير',
      content: `### الوصف:
يظهر المشهد جمال الطبيعة الخلابة مع الموسيقى الهادئة في الخلفية.

**الشخصية الرئيسية:** انظروا إلى هذا الجمال!

**الشخصية الثانوية:** لم أر مثل هذا المنظر من قبل.

### ملاحظات الإخراج:
- استخدام زاوية واسعة للمناظر الطبيعية
- التركيز على تعبيرات الوجه
- الانتقال السلس بين المشاهد`,
    },
    {
      id: '3',
      title: 'المشهد الثالث: الخاتمة',
      content: `**الراوي:** وهكذا تنتهي حلقتنا الأولى، ونترككم مع الشوق للحلقة القادمة...

**الشخصية الرئيسية:** إلى اللقاء في المغامرة القادمة!

**الشخصية الثانوية:** سنكون بانتظاركم!

(موسيقى الخاتمة)

---

### معلومات إضافية:
- **مدة الحلقة المقدرة:** 15 دقيقة
- **عدد الشخصيات:** 5 شخصيات
- **المواقع:** 3 مواقع مختلفة`,
    },
  ])
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPreview, setIsPreview] = useState(false)
  const scenesContainerRef = useRef<HTMLDivElement>(null)

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

  const stats = useMemo(() => {
    const content = currentScene?.content || ''
    const words = content.trim().split(/\s+/).length
    const characters = content.length
    const charactersNoSpaces = content.replace(/\s/g, '').length
    const estimatedMinutes = Math.ceil(words / 150)

    return { words, characters, charactersNoSpaces, estimatedMinutes }
  }, [currentScene])

  const totalStats = useMemo(() => {
    const totalContent = scenes.map((s) => s.content).join(' ')
    const words = totalContent.trim().split(/\s+/).length
    const characters = totalContent.length
    const estimatedMinutes = Math.ceil(words / 150)
    return { words, characters, estimatedMinutes, scenes: scenes.length }
  }, [scenes])

  const formatText = (format: string) => {
    console.log(`تطبيق تنسيق: ${format}`)
  }

  const saveContent = () => {
    console.log('تم حفظ جميع المشاهد')
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              نص الحلقة
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveContent}>
                <Save className="h-4 w-4" />
                حفظ
              </Button>
              <Button variant="outline" size="sm" onClick={exportContent}>
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  إدارة المشاهد
                </CardTitle>
                <Button onClick={addNewScene} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  مشهد جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToScene('prev')}
                  disabled={currentSceneIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div ref={scenesContainerRef} className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
                  {scenes.map((scene, index) => (
                    <Button
                      key={scene.id}
                      variant={index === currentSceneIndex ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentSceneIndex(index)}
                      className="whitespace-nowrap flex-shrink-0"
                      data-scene-index={index}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToScene('next')}
                  disabled={currentSceneIndex === scenes.length - 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-600 text-center">المشهد {currentSceneIndex + 1} من {scenes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {isPreview ? (
                    <CardTitle className="text-xl font-bold">{currentScene?.title}</CardTitle>
                  ) : (
                    <input
                      type="text"
                      value={currentScene?.title || ''}
                      onChange={(e) => handleSceneTitleChange(e.target.value)}
                      className="text-xl font-bold bg-transparent border-none outline-none w-full"
                      placeholder="عنوان المشهد"
                      dir="rtl"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => deleteScene(currentSceneIndex)} disabled={scenes.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant={isPreview ? 'default' : 'outline'} size="sm" onClick={() => setIsPreview(!isPreview)}>
                    {isPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {isPreview ? 'تحرير' : 'معاينة'}
                  </Button>
                </div>
              </div>

              {!isPreview && (
                <div className="flex items-center gap-1 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => formatText('bold')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText('italic')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText('underline')}>
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => formatText('align-left')}>
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText('align-center')}>
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText('align-right')}>
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => formatText('list')}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText('ordered-list')}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText('quote')}>
                    <Quote className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isPreview ? (
                <div className="min-h-[600px] p-4 bg-muted/20 rounded-lg">
                  <div className="prose prose-sm max-w-none text-right" dir="rtl">
                    {(currentScene?.content || '').split('\n').map((line, index) => {
                      if (line.startsWith('# ')) return (
                        <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>
                      )
                      else if (line.startsWith('## ')) return (
                        <h2 key={index} className="text-xl font-semibold mb-3 mt-6">{line.substring(3)}</h2>
                      )
                      else if (line.startsWith('### ')) return (
                        <h3 key={index} className="text-lg font-medium mb-2 mt-4">{line.substring(4)}</h3>
                      )
                      else if (line.startsWith('**') && line.endsWith('**'))
                        return <p key={index} className="font-bold mb-2">{line.slice(2, -2)}</p>
                      else if (line.startsWith('---')) return <hr key={index} className="my-6" />
                      else if (line.trim() === '') return <br key={index} />
                      else return <p key={index} className="mb-2 leading-relaxed">{line}</p>
                    })}
                  </div>
                </div>
              ) : (
                <Textarea
                  value={currentScene?.content || ''}
                  onChange={(e) => handleSceneContentChange(e.target.value)}
                  className="w-full min-h-[600px] p-4 text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="ابدأ كتابة محتوى المشهد هنا..."
                  dir="rtl"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                إحصائيات المشهد الحالي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">عدد الكلمات:</span>
                <span className="font-medium">{stats.words}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">عدد الأحرف:</span>
                <span className="font-medium">{stats.characters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الوقت المقدر:</span>
                <span className="font-medium">{stats.estimatedMinutes} دقيقة</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                إحصائيات الحلقة الكاملة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">عدد المشاهد:</span>
                <span className="font-medium">{totalStats.scenes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الكلمات:</span>
                <span className="font-medium">{totalStats.words}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الأحرف:</span>
                <span className="font-medium">{totalStats.characters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الوقت الإجمالي:</span>
                <span className="font-medium">{totalStats.estimatedMinutes} دقيقة</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4" />
                استيراد ملف
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4" />
                قالب جديد
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Undo className="h-4 w-4" />
                تراجع
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Redo className="h-4 w-4" />
                إعادة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
