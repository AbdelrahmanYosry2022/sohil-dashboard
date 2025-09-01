import { ThemeToggle } from './components/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card'
import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-light.png" alt="logo" className="h-8 w-auto dark:hidden" />
            <img src="/assets/logo-dark.png" alt="logo" className="h-8 w-auto hidden dark:block" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-muted-foreground">مرحباً، سهيل</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">نظرة عامة سريعة على مشروع الحلقات الخاصة بك</p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/episodes" className="block group">
            <Card className="transition-colors hover:bg-accent cursor-pointer">
              <CardHeader>
                <CardTitle>الحلقات</CardTitle>
                <CardDescription>إدارة الحلقات ومراحل الإنتاج</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">اضغط للدخول إلى قائمة الحلقات</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>الفريق</CardTitle>
              <CardDescription>المهام، التوزيع، التقدم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">أعضاء نشطون الآن</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الماليات</CardTitle>
              <CardDescription>الميزانية والمدفوعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">حالة التدفق النقدي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الأصول</CardTitle>
              <CardDescription>الملفات والمرجعيات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">مساحة التخزين المستخدمة</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
