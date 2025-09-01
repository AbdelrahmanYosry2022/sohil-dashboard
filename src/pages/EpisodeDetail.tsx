import { useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { EpisodeSidebar } from '../components/EpisodeSidebar'
import TextTab from './tabs/TextTab'
import {
  LayoutDashboard,
  FileText as FileTextIcon,
  AudioLines,
  PencilRuler,
  Clapperboard,
  Scissors,
  Film,
  Folder,
  Wallet,
} from 'lucide-react'
import { EpisodeDetailHeader } from '../components/EpisodeDetailHeader'
// lucide-react icons will be used for sidebar tabs

type TabKey =
  | 'overview'
  | 'script'
  | 'audio'
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

  const title = useMemo(() => `حلقة ${id}`, [id])

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
            {active === 'overview' && <OverviewSection />}
            {active === 'script' && <TextTab />}
            {active !== 'overview' && active !== 'script' && (
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

function OverviewSection() {
  // بيانات مثال للوحة النظرة العامة
  const stats = [
    { title: 'نسبة إنجاز الحلقة', value: 72, hint: 'الهدف 100%' },
    { title: 'عدد المشاهد', value: 28, hint: '+3 هذا الأسبوع' },
    { title: 'مدة العمل المتبقية', value: '5 أيام', hint: 'حسب الخطة' },
    { title: 'الميزانية المصروفة', value: '65%', hint: 'ضمن النطاق' },
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
