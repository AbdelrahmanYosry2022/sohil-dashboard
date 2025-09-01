import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Header } from '../components/ui/header'

// نموذج بيانات مؤقت للحلقات
const episodes = [
  {
    id: 'ep-01',
    name: 'الحلقة 1: البداية',
    summary: 'مقدمة الشخصيات وبداية القصة',
    progress: 65,
    scenes: 24,
    duration: '12:30',
    status: 'في المونتاج',
  },
  {
    id: 'ep-02',
    name: 'الحلقة 2: التحدّي',
    summary: 'بناء الصراع وارتفاع الإيقاع',
    progress: 40,
    scenes: 28,
    duration: '13:05',
    status: 'تحريك',
  },
  {
    id: 'ep-03',
    name: 'الحلقة 3: المواجهة',
    summary: 'مشاهد الحركة الرئيسية',
    progress: 20,
    scenes: 30,
    duration: '14:10',
    status: 'ستوري بورد',
  },
  {
    id: 'ep-04',
    name: 'الحلقة 4: الحل',
    summary: 'حل العقدة ونهاية الآرك',
    progress: 85,
    scenes: 22,
    duration: '12:55',
    status: 'تصحيح ألوان',
  },
]

export default function Episodes() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">قائمة الحلقات</h1>
          <p className="text-muted-foreground">تصفح الحلقات واضغط على أي حلقة لفتح لوحة التحكم الخاصة بها</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {episodes.map((ep) => (
            <Link to={`/episodes/${ep.id}`} key={ep.id} className="block group">
              <Card className="transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle className="text-base">{ep.name}</CardTitle>
                  <CardDescription className="truncate">{ep.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>المشاهد: {ep.scenes}</span>
                    <span>المدة: {ep.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">الحالة: {ep.status}</span>
                    <span className="font-medium">{ep.progress}%</span>
                  </div>
                  <Progress value={ep.progress} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
