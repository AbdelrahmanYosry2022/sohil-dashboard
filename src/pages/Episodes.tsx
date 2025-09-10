import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Button } from '../components/ui/button'
import { episodesApi } from '../features/episodes/api'
import { Episode } from '../lib/types'
import { Plus, Loader2 } from 'lucide-react'
import { EpisodeDetailHeader } from '../features/episodes/components/EpisodeDetailHeader'
import { useAuth } from '../contexts/AuthContext'

export default function Episodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signOut } = useAuth()

  useEffect(() => {
    loadEpisodes()
  }, [])

  const loadEpisodes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await episodesApi.getAll()
      const normalized = (data || []).map((e: any) => ({
        ...e,
        status: e?.status === 'draft' || e?.status === 'in_progress' || e?.status === 'completed' ? e.status : 'draft',
      })) as Episode[]
      setEpisodes(normalized)
    } catch (err) {
      console.error('Error loading episodes:', err)
      setError('فشل في تحميل الحلقات. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: Episode['status']) => {
    switch (status) {
      case 'draft':
        return 'مسودة'
      case 'in_progress':
        return 'قيد التنفيذ'
      case 'completed':
        return 'مكتملة'
      default:
        return status
    }
  }

  const getStatusColor = (status: Episode['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-500'
      case 'in_progress':
        return 'text-blue-500'
      case 'completed':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const calculateProgress = (episode: Episode) => {
    // هنا يمكن حساب التقدم بناءً على المحتوى المرتبط بالحلقة
    // للآن سنعرض تقدماً عشوائياً مؤقتاً
    return Math.floor(Math.random() * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <EpisodeDetailHeader
            title="الحلقات"
            onHome={() => navigate('/')}
            onEpisodes={() => navigate('/episodes')}
            showHomeButton={true}
            showEpisodesButton={false}
            showStats={false}
            showDescription={false}
            onLogout={() => signOut()}
          />
        </div>
        <main className="flex-1 container py-8 space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري تحميل الحلقات...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <EpisodeDetailHeader
            title="الحلقات"
            onHome={() => navigate('/')}
            onEpisodes={() => navigate('/episodes')}
            showHomeButton={true}
            showEpisodesButton={false}
            showStats={false}
            showDescription={false}
            onLogout={() => signOut()}
          />
        </div>
        <main className="flex-1 container py-8 space-y-6">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadEpisodes}>إعادة المحاولة</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-50 bg-background border-b">
        <EpisodeDetailHeader
          title="الحلقات"
          onHome={() => navigate('/')}
          onEpisodes={() => navigate('/episodes')}
          showHomeButton={true}
          showEpisodesButton={false}
          showStats={false}
          showDescription={false}
          onLogout={() => signOut()}
        />
      </div>

      <main className="flex-1 container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">قائمة الحلقات</h1>
            <p className="text-muted-foreground">تصفح الحلقات واضغط على أي حلقة لفتح لوحة التحكم الخاصة بها</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة حلقة جديدة
          </Button>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">لا توجد حلقات بعد</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء أول حلقة
            </Button>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {episodes.map((episode) => {
              const progress = calculateProgress(episode)
              return (
                <Link to={`/episodes/${episode.id}`} key={episode.id} className="block group">
                  <Card className="transition-colors hover:bg-accent">
                    <CardHeader>
                      <CardTitle className="text-base">{episode.title}</CardTitle>
                      <CardDescription className="truncate">
                        {episode.description || 'لا يوجد وصف'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>المشاهد: 0</span>
                        <span>المدة: --:--</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${getStatusColor(episode.status)}`}>
                          {getStatusLabel(episode.status)}
                        </span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}
