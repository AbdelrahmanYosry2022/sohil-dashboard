import { useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Button } from '../components/ui/button'
import { EpisodeSidebar } from '../components/EpisodeSidebar'
import TextTab from './tabs/TextTab'
import AudioTab from './tabs/AudioTab'
import StoryboardTab from './tabs/StoryboardTab'
import DrawingTab from './tabs/DrawingTab'
import AnimationTab from './tabs/AnimationTab'
import EditingTab from './tabs/EditingTab'
import {
  LayoutDashboard,
  FileText as FileTextIcon,
  AudioLines,
  Layers,
  PencilRuler,
  Clapperboard,
  Scissors,
  Film,
  Folder,
  Wallet,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { EpisodeDetailHeader } from '../components/EpisodeDetailHeader'
import { episodeOperations } from '../lib/supabase'
import { Episode } from '../lib/types'

type TabKey =
  | 'overview'
  | 'script'
  | 'audio'
  | 'storyboard'
  | 'draw'
  | 'animation'
  | 'edit'
  | 'final'
  | 'assets'
  | 'budget'

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { key: 'script', label: 'النص', icon: FileTextIcon },
  { key: 'audio', label: 'الصوت', icon: AudioLines },
  { key: 'storyboard', label: 'الستوري بورد', icon: Layers },
  { key: 'draw', label: 'الرسم', icon: PencilRuler },
  { key: 'animation', label: 'التحريك', icon: Clapperboard },
  { key: 'edit', label: 'المونتاج', icon: Scissors },
  { key: 'final', label: 'المشاهد النهائية', icon: Film },
  { key: 'assets', label: 'أصول الحلقة', icon: Folder },
  { key: 'budget', label: 'الميزانية', icon: Wallet },
]

export default function EpisodeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [active, setActive] = useState<TabKey>('overview')
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadEpisode(id)
    }
  }, [id])

  const loadEpisode = async (episodeId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await episodeOperations.getById(episodeId)
      setEpisode(data)
    } catch (err) {
      console.error('Error loading episode:', err)
      setError('فشل في تحميل بيانات الحلقة. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const title = useMemo(() => {
    if (episode) {
      return episode.title
    }
    return `حلقة ${id}`
  }, [episode, id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <EpisodeDetailHeader
          title="جاري التحميل..."
          onHome={() => navigate('/')}
          onEpisodes={() => navigate('/episodes')}
        />
        <main className="container py-8 space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري تحميل بيانات الحلقة...</span>
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
          onHome={() => navigate('/')}
          onEpisodes={() => navigate('/episodes')}
        />
        <main className="container py-8 space-y-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error || 'الحلقة غير موجودة'}</p>
            <div className="space-x-2">
              <Button onClick={() => id && loadEpisode(id)}>إعادة المحاولة</Button>
              <Button variant="outline" onClick={() => navigate('/episodes')}>
                العودة لقائمة الحلقات
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EpisodeDetailHeader
        title={title}
        onHome={() => navigate('/')}
        onEpisodes={() => navigate('/episodes')}
      />

      <main className="container py-8 space-y-6">

        {/* تخطيط بعمودين: سايدبار عائم وكومبوز محتوى */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
          {/* Sidebar extracted to its own component */}
          <EpisodeSidebar
            items={TABS}
            active={active}
            onChange={(k) => setActive(k)}
          />

          {/* Content */}
          <section className="space-y-6">
            {active === 'overview' && <OverviewSection episode={episode} />}
            {active === 'script' && <TextTab />}
            {active === 'audio' && <AudioTab />}
            {active === 'storyboard' && <StoryboardTab />}
            {active === 'draw' && <DrawingTab />}
            {active === 'animation' && <AnimationTab />}
            {active === 'edit' && <EditingTab />}
            {(active === 'final' || active === 'assets' || active === 'budget') && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {TABS.find((t) => t.key === active)?.label}
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
        </div>
      </main>
    </div>
  )
}

function OverviewSection({ episode }: { episode: Episode }) {
  // حساب الإحصائيات بناءً على بيانات الحلقة
  const stats = [
    {
      title: 'حالة الحلقة',
      value: episode.status === 'completed' ? 'مكتملة' :
             episode.status === 'in_progress' ? 'قيد التنفيذ' : 'مسودة',
      hint: `تم الإنشاء ${new Date(episode.created_at).toLocaleDateString('ar-EG')}`
    },
    { title: 'عدد المشاهد', value: 0, hint: 'لم يتم تحديدها بعد' },
    { title: 'المدة المتوقعة', value: '--:--', hint: 'لم يتم تحديدها بعد' },
    { title: 'آخر تحديث', value: new Date(episode.updated_at).toLocaleDateString('ar-EG'), hint: 'تاريخ آخر تعديل' },
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
          {[
            { label: 'النص', value: 90 },
            { label: 'الصوت', value: 55 },
            { label: 'الرسم', value: 40 },
            { label: 'التحريك', value: 25 },
            { label: 'المونتاج', value: 60 },
            { label: 'المشاهد النهائية', value: 10 },
          ].map((r) => (
            <div key={r.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value}%</span>
              </div>
              <Progress value={r.value} />
            </div>
          ))}
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
