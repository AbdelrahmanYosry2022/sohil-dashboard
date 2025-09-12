import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { EpisodeSidebar } from '../features/episodes/components/EpisodeSidebar'
import { Episode } from '../lib/types'
import TextTab from '../features/text/components/TextTab'
import { AudioTab } from '../features/audio/components/AudioTab'
import DrawingTab from '../features/drawing/components/DrawingTab'
import AnimationTab from '../features/animation/components/AnimationTab'
import EditingTab from '../features/editing/components/EditingTab'
import { useEpisodeDetail, TABS } from '../features/episodes/hooks/useEpisodeDetail'
import {
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { EpisodeDetailHeader } from '../features/episodes/components/EpisodeDetailHeader'

export default function EpisodeDetail() {
  const {
    activeTab,
    episode,
    loading,
    error,
    statsData,
    statsLoading,
    title,
    handleTabChange,
    handleHome,
    handleEpisodes,
    handleRetry,
  } = useEpisodeDetail()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <EpisodeDetailHeader
            title="جاري التحميل..."
            onHome={handleHome}
            onEpisodes={handleEpisodes}
          />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>جاري تحميل بيانات الحلقة...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-background">
        <EpisodeDetailHeader
          title="خطأ"
          onHome={handleHome}
          onEpisodes={handleEpisodes}
        />
        <main className="container py-8 space-y-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error || 'الحلقة غير موجودة'}</p>
            <div className="space-x-2">
              <Button onClick={handleRetry}>إعادة المحاولة</Button>
              <Button variant="outline" onClick={handleEpisodes}>
                العودة لقائمة الحلقات
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <EpisodeDetailHeader
          title={title}
          onHome={handleHome}
          onEpisodes={handleEpisodes}
        />
      </div>

      {/* Main Content with Fixed Sidebar (centered container) */}
      <div className="flex-1">
        <div className="container mx-auto flex">
          {/* Fixed Sidebar */}
          <aside className="w-[260px] shrink-0 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto p-4">
            <EpisodeSidebar
              items={TABS}
              active={activeTab}
              onChange={handleTabChange}
            />
          </aside>

          {/* Scrollable Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <section className="space-y-6 max-w-5xl">
            {activeTab === 'overview' && <OverviewSection episode={episode} statsData={statsData} loading={statsLoading} />}
            {activeTab === 'script' && <TextTab episodeId={episode.id} />}
            {activeTab === 'audio' && <AudioTab episodeId={episode.id} />}
            {activeTab === 'storyboard' && <DrawingTab episodeId={episode.id} />}
            {activeTab === 'animation' && <AnimationTab />}
            {activeTab === 'edit' && <EditingTab />}
            {(activeTab === 'final' || activeTab === 'assets' || activeTab === 'budget') && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {TABS.find((t) => t.key === activeTab)?.label}
                  </CardTitle>
                  <CardDescription>سيتم بناء هذه الواجهة لاحقًا بتفاصيل أعمق</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    خصّصنا هذه الصفحة لتكون أنيقة ومبسطة؛ أخبرني بما تريد عرضه هنا وسأكمل البناء.
                  </p>
                </CardContent>
              </Card>
            )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

function OverviewSection({ 
  episode, 
  statsData, 
  loading 
}: { 
  episode: Episode;
  statsData: any;
  loading: boolean;
}) {

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
    return `${mb.toFixed(1)} MB`
  }

  // حساب الإحصائيات بناءً على بيانات الحلقة
  const stats = [
    {
      title: 'حالة الحلقة',
      value: episode.status === 'completed' ? 'مكتملة' :
             episode.status === 'in_progress' ? 'قيد التنفيذ' : 'مسودة',
      hint: `تم الإنشاء ${new Date(episode.created_at).toLocaleDateString('ar-EG')}`
    },
    {
      title: 'عدد المشاهد',
      value: loading ? 'جاري التحميل...' : (statsData?.text?.scenes || 0),
  hint: 'من النص والرسم'
    },
    {
      title: 'المدة المتوقعة',
      value: loading ? 'جاري التحميل...' : (statsData?.audio?.totalDuration ? formatTime(statsData.audio.totalDuration) : '--:--'),
      hint: 'بناءً على ملفات الصوت'
    },
    {
      title: 'آخر تحديث',
      value: new Date(episode.updated_at).toLocaleDateString('ar-EG'),
      hint: 'تاريخ آخر تعديل'
    },
  ]

  return (
    <div className="space-y-6">
      {/* صف الإحصاءات */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{s.title}</CardTitle>
              <CardDescription>{typeof s.value === 'number' ? `${s.value}` : s.value}</CardDescription>
            </CardHeader>
            {'value' in s && typeof s.value === 'number' ? (
              <CardContent>
                <Progress value={Number(s.value)} />
                <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm font-medium">{s.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* ملخص مسارات الإنتاج */}
      <Card>
        <CardHeader>
          <CardTitle>مسار الإنتاج</CardTitle>
          <CardDescription>تقدّم كل مرحلة رئيسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري تحميل الإحصائيات...</span>
            </div>
          ) : (
            [
              {
                label: 'النص',
                value: statsData?.text?.scenes > 0 ? Math.min(100, (statsData.text.scenes / 10) * 100) : 0,
                details: `${statsData?.text?.scenes || 0} مشهد، ${statsData?.text?.words || 0} كلمة`
              },
              {
                label: 'الصوت',
                value: statsData?.audio?.files > 0 ? Math.min(100, (statsData.audio.files / 5) * 100) : 0,
                details: `${statsData?.audio?.files || 0} ملف، ${formatTime(statsData?.audio?.totalDuration || 0)}`
              },
              {
                label: 'الرسم',
                value: statsData?.storyboard?.frames > 0 ? Math.min(100, (statsData.storyboard.frames / 15) * 100) : 0,
                details: `${statsData?.storyboard?.frames || 0} إطار، ${statsData?.storyboard?.scenes || 0} مشهد`
              },
              {
                label: 'الرسم النهائي',
                value: statsData?.drawing?.scenes > 0 ? Math.min(100, ((statsData.drawing.scenes - statsData.drawing.approved) / statsData.drawing.scenes) * 100) : 0,
                details: `${statsData?.drawing?.scenes || 0} مشهد، ${statsData?.drawing?.comments || 0} تعليق`
              },
              { label: 'التحريك', value: 25, details: 'لم يبدأ بعد' },
              { label: 'المونتاج', value: 10, details: 'في المراحل الأولى' },
            ].map((r) => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium">{Math.round(r.value)}%</span>
                </div>
                <Progress value={r.value} />
                <div className="text-xs text-muted-foreground">{r.details}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* قائمة سريعة للمهام */}
      <Card>
        <CardHeader>
          <CardTitle>مهام قريبة</CardTitle>
          <CardDescription>أهم الأعمال المطلوبة لهذا الأسبوع</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">اعتماد النص النهائي للمشهد 12</span>
              <span className="rounded-full border px-2 py-0.5 text-xs">اليوم</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">تسجيل حوار الشخصية الرئيسية - الجزء 2</span>
              <span className="rounded-full border px-2 py-0.5 text-xs">غداً</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">إنهاء تحبير تصميم الخلفيات</span>
              <span className="rounded-full border px-2 py-0.5 text-xs">هذا الأسبوع</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
