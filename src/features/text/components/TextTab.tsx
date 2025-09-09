import React from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Textarea } from '../../../components/ui/textarea'
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
  Loader2,
} from 'lucide-react'
import { useTextTab } from '../hooks/useTextTab'

interface TextTabProps {
  episodeId: string;
}

export default function TextTab({ episodeId }: TextTabProps) {
  const {
    scenes,
    currentSceneIndex,
    isPreview,
    isLoading,
    isSaving,
    currentScene,
    scenesContainerRef,
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
  } = useTextTab()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              نص الحلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">جاري تحميل النصوص...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" />
                استيراد ملف
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveScenes}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportContent}>
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
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
                  <Button variant="outline" size="sm">
                    <Undo className="h-4 w-4" />
                    تراجع
                  </Button>
                  <Button variant="outline" size="sm">
                    <Redo className="h-4 w-4" />
                    إعادة
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
      </div>
    </div>
  )
}
