import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import { Film } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './features/auth/components/LoginPage'
import { EpisodeDetailHeader } from './features/episodes/components/EpisodeDetailHeader'

function MainApp() {
  const { user, loading, signOut } = useAuth()
  const userName = user?.email?.split('@')[0] || "المستخدم"
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Sticky Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <EpisodeDetailHeader
          title="الصفحة الرئيسية"
          onHome={() => navigate('/')}
          onEpisodes={() => navigate('/episodes')}
          showHomeButton={false}
          showEpisodesButton={true}
          showStats={false}
          showDescription={false}
          onLogout={() => signOut()}
        />
      </div>

      <main className="flex-1 flex items-center justify-center">
        <div className="w-[80%] max-w-6xl mx-auto px-6">
          <div className="text-center space-y-8">
            {/* بادج الترحيب */}
            <div>
              <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-muted-foreground">أهلاً وسهلاً، {userName}</span>
            </div>
            
            {/* الجملة الترحيبية القصيرة */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              لوحة التحكم الشاملة لإنتاج الحلقات
            </h1>
            
            {/* النص التعريفي المختصر */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              منصة متكاملة لإدارة جميع مراحل إنتاج الحلقات من كتابة النص وحتى المونتاج النهائي، 
              مع أدوات تعاون فعالة ومتابعة دقيقة للتقدم
            </p>
            
            {/* الكروت الأنيقة */}
            <div className="flex justify-center mt-12">
              <Link to="/episodes" className="block group">
                <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Film className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">الحلقات</CardTitle>
                    <CardDescription className="text-sm">إدارة الحلقات ومراحل الإنتاج</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">12</div>
                    <p className="text-xs text-muted-foreground">حلقة في الإنتاج</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return <MainApp />
}
