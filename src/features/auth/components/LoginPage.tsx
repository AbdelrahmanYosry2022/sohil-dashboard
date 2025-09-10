
import { useState } from 'react'
import { authApi } from '../api'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface LoginPageProps {
  onLoginSuccess: (user: User) => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = isSignUp
        ? await authApi.signUp(email, password)
        : await authApi.signIn(email, password)
      if (result.error) {
        setError(result.error)
      } else if (result.user) {
        onLoginSuccess(result.user)
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex gap-8 p-8 py-3 px-3" dir="rtl">
      {/* Left Side - Login Form */}

      <div className="flex-1 p-12 flex flex-col justify-center items-center">
        {/* Logo */}
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8 w-full">
          <img 
            src="/assets/logo-dark.png" 
            alt="Sohil Animation Logo" 
            className="h-12 w-auto"
          />
        </div>

        {/* Form Content */}
          <div className="text-center mb-8"> 
            <h2 className="text-4xl font-bold text-black mb-2">{isSignUp ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}</h2>
            <p className="text-gray-600">أدخل بريدك الإلكتروني وكلمة المرور للدخول إلى حسابك</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-black">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="h-12 border-gray-200 focus:border-black focus:ring-black"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-black">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                className="h-12 border-gray-200 focus:border-black focus:ring-black"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-2 mb-6">
              <div className="flex items-center space-x-3 pr-2">
                <Checkbox id="remember" label="تذكرني" className="ml-2" />
              </div>
              <button type="button" className="text-sm text-gray-600 hover:text-black hover:underline">نسيت كلمة المرور؟</button>
            </div>
            {/* Sign In/Up Button */}
            <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium" type="submit" disabled={loading}>
              {loading ? (isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...') : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
            </Button>
            {/* Removed Google Sign In and Sign Up Link sections */}
          </form>
        </div>
      </div>
      

      {/* Right Side - Gradient Background with rounded corners */}

      <div 
        className="flex-1 relative p-12 flex flex-col justify-between text-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/c1616ed4-a298-4856-8706-bc7642fadd6b.jfif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/50 rounded-3xl"></div>
        {/* Top Quote */}
        <div className="relative z-10">
          <p className="text-sm font-medium tracking-wider text-white/90">شركة ملهمون الابداعية</p>
        </div>
        {/* Main Content */}
        <div className="relative z-10">
          <h1 className="text-6xl font-bold leading-tight mb-6 text-white">
            منصة انتاج برنامج<br />سهيل أنيميشن
          </h1>
          <p className="text-lg text-white/95 leading-relaxed">
            منصة متكاملة لإنشاء وتصميم الرسوم المتحركة باحترافية وسهولة، توفر لك الأدوات اللازمة لتحويل أفكارك إلى واقع مبدع
          </p>
        </div>
      </div>

    </div>
  )
}

export default LoginPage