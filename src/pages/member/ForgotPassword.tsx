import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { FiPhone, FiLock, FiKey, FiArrowLeft } from 'react-icons/fi'
import { authAPI } from '../../api/memberAPI'
import { toast } from 'react-hot-toast'

type Step = 'phone' | 'otp' | 'password'

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [countdown, setCountdown] = useState(0)

  const validatePhone = (phone: string) => {
    const phoneRegex = /^0[0-9]{9}$/
    return phoneRegex.test(phone)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.phone) {
      setErrors({ phone: 'กรุณากรอกเบอร์โทรศัพท์' })
      return
    }

    if (!validatePhone(formData.phone)) {
      setErrors({ phone: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (0812345678)' })
      return
    }

    setLoading(true)

    try {
      await authAPI.forgotPassword(formData.phone)
      toast.success('ส่ง OTP ไปยังเบอร์โทรศัพท์เรียบร้อยแล้ว')
      setStep('otp')
      startCountdown()
    } catch (error: any) {
      console.error('Send OTP error:', error)
      const message = error.response?.data?.message || 'ส่ง OTP ไม่สำเร็จ'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setLoading(true)

    try {
      await authAPI.forgotPassword(formData.phone)
      toast.success('ส่ง OTP ใหม่เรียบร้อยแล้ว')
      startCountdown()
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      toast.error('ส่ง OTP ไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.otp) {
      setErrors({ otp: 'กรุณากรอกรหัส OTP' })
      return
    }

    if (formData.otp.length !== 6) {
      setErrors({ otp: 'รหัส OTP ต้องมี 6 หลัก' })
      return
    }

    setLoading(true)

    try {
      await authAPI.verifyOTP(formData.phone, formData.otp)
      toast.success('ยืนยัน OTP สำเร็จ')
      setStep('password')
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      const message = error.response?.data?.message || 'รหัส OTP ไม่ถูกต้อง'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: any = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'กรุณากรอกรหัสผ่านใหม่'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword(formData.phone, formData.otp, formData.newPassword)
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบ')
      navigate('/member/login')
    } catch (error: any) {
      console.error('Reset password error:', error)
      const message = error.response?.data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const renderPhoneStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div>
        <label className="block text-white/90 text-sm font-medium mb-2">
          เบอร์โทรศัพท์
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiPhone className="text-white/50" />
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0812345678"
            className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
              errors.phone ? 'border-red-500' : 'border-white/20'
            } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            maxLength={10}
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-red-400 text-xs">{errors.phone}</p>
        )}
        <p className="mt-2 text-white/60 text-xs">
          เราจะส่งรหัส OTP ไปยังเบอร์โทรศัพท์นี้
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>กำลังส่ง OTP...</span>
          </>
        ) : (
          <>
            <FiKey />
            <span>ส่งรหัส OTP</span>
          </>
        )}
      </button>
    </form>
  )

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div>
        <label className="block text-white/90 text-sm font-medium mb-2">
          รหัส OTP (6 หลัก)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiKey className="text-white/50" />
          </div>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="123456"
            className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
              errors.otp ? 'border-red-500' : 'border-white/20'
            } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-2xl tracking-widest`}
            maxLength={6}
          />
        </div>
        {errors.otp && (
          <p className="mt-1 text-red-400 text-xs">{errors.otp}</p>
        )}
        <p className="mt-2 text-white/60 text-xs text-center">
          ส่งรหัส OTP ไปยัง {formData.phone}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>กำลังตรวจสอบ...</span>
          </>
        ) : (
          <span>ยืนยัน OTP</span>
        )}
      </button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-white/60 text-sm">
            ส่ง OTP ใหม่ได้ใน {countdown} วินาที
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading}
            className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors disabled:opacity-50"
          >
            ส่ง OTP ใหม่
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setStep('phone')}
        className="w-full text-white/60 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
      >
        <FiArrowLeft />
        <span>กลับไปแก้ไขเบอร์โทร</span>
      </button>
    </form>
  )

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label className="block text-white/90 text-sm font-medium mb-2">
          รหัสผ่านใหม่
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiLock className="text-white/50" />
          </div>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
              errors.newPassword ? 'border-red-500' : 'border-white/20'
            } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-red-400 text-xs">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label className="block text-white/90 text-sm font-medium mb-2">
          ยืนยันรหัสผ่านใหม่
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiLock className="text-white/50" />
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
              errors.confirmPassword ? 'border-red-500' : 'border-white/20'
            } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-red-400 text-xs">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>กำลังเปลี่ยนรหัสผ่าน...</span>
          </>
        ) : (
          <span>{t("member:profile.changePassword")}</span>
        )}
      </button>
    </form>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">รีเซ็ตรหัสผ่าน</h1>
            <p className="text-white/70 text-sm">
              {step === 'phone' && 'กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP'}
              {step === 'otp' && 'กรอกรหัส OTP ที่ได้รับ'}
              {step === 'password' && 'ตั้งรหัสผ่านใหม่'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'phone' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white/60'
              }`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${
                step !== 'phone' ? 'bg-purple-600' : 'bg-white/20'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'otp' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white/60'
              }`}>
                2
              </div>
              <div className={`w-12 h-0.5 ${
                step === 'password' ? 'bg-purple-600' : 'bg-white/20'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'password' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white/60'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Form Steps */}
          {step === 'phone' && renderPhoneStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'password' && renderPasswordStep()}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/member/login"
              className="text-white/60 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
            >
              <FiArrowLeft />
              <span>กลับไปหน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
