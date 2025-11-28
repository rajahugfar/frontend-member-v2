import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMemberStore } from '../../store/memberStore'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, isLoading } = useMemberStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    phone: '',
    password: '',
    remember: false
  })
  const [error, setError] = useState('')


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!loginData.phone || !loginData.password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      await login({
        phone: loginData.phone,
        password: loginData.password,
      })

      if (loginData.remember) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('savedPhone', loginData.phone)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('savedPhone')
      }

      // Wait for Zustand persist to save, then navigate
      setTimeout(() => {
        navigate('/member')
      }, 100)
    } catch (err) {
      setError('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบเบอร์โทรและรหัสผ่าน')
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('memberToken')
    if (token) {
      navigate('/member')
    }

    // Load saved phone if remember me was checked
    const rememberMe = localStorage.getItem('rememberMe')
    const savedPhone = localStorage.getItem('savedPhone')
    if (rememberMe === 'true' && savedPhone) {
      setLoginData(prev => ({ ...prev, phone: savedPhone, remember: true }))
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-black/80"
        onClick={() => navigate('/')}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        {/* Modal Content */}
        <div className="bg-[#1a1f26] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Language Switcher */}
          <div className="absolute top-4 left-4 z-50">
            <LanguageSwitcher variant="compact" />
          </div>

          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Form Container */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{t("auth:login.title")}</h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="tel"
                  value={loginData.phone}
                  onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition"
                  placeholder={t("member:profile.phone")}
                  maxLength={10}
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition"
                  placeholder={t("auth:login.password")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginData.remember}
                    onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-[#0f1419] text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-gray-400 text-sm">จดจำฉันไว้</span>
                </label>
                <Link
                  to="/member/forgot-password"
                  className="text-sm text-yellow-500 hover:text-yellow-400 transition"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-b from-[#10b981] to-[#059669] text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : t("auth:login.title") }
              </button>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  ยังไม่มีบัญชี?{' '}
                  <Link
                    to="/member/register"
                    className="text-yellow-500 hover:text-yellow-400 font-medium transition"
                  >
                    สมัครสมาชิก
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
