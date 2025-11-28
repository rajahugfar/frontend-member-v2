import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FaUser, FaLock, FaPhone, FaUserPlus, FaCreditCard, FaUniversity } from 'react-icons/fa'
import { FiMessageCircle } from 'react-icons/fi'
import { authAPI } from '@api/authAPI'
import { useMemberStore } from '../../store/memberStore'
import type { RegisterData } from '@/types/auth'
import { useTranslation } from 'react-i18next'

const THAI_BANKS = [
  { value: '', label: 'เลือกธนาคาร' },
  { value: 'KBANK', label: 'กสิกรไทย (KBANK)' },
  { value: 'SCB', label: 'ไทยพาณิชย์ (SCB)' },
  { value: 'BBL', label: 'กรุงเทพ (BBL)' },
  { value: 'KTB', label: 'กรุงไทย (KTB)' },
  { value: 'TMB', label: 'ทหารไทยธนชาต (TTB)' },
  { value: 'BAY', label: 'กรุงศรีอยุธยา (BAY)' },
  { value: 'GSB', label: 'ออมสิน (GSB)' },
  { value: 'BAAC', label: 'ธ.ก.ส. (BAAC)' },
  { value: 'TRUEWALLET', label: 'TrueMoney Wallet' },
]

const registerSchema = z
  .object({
    phone: z
      .string()
      .regex(/^0[0-9]{9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก)'),
    password: z
      .string()
      .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    confirmPassword: z.string(),
    fullname: z
      .string()
      .min(3, 'ชื่อ-นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร'),
    bankCode: z
      .string()
      .min(1, 'กรุณาเลือกธนาคาร'),
    bankNumber: z
      .string()
      .regex(/^[0-9]{10,12}$/, 'เลขบัญชีต้องเป็นตัวเลข 10-12 หลัก'),
    line: z.string().optional(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { referralCode: urlReferralCode } = useParams<{ referralCode?: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useMemberStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referralCode: urlReferralCode || '',
    },
  })

  // Set referral code from URL when component mounts or referralCode changes
  useEffect(() => {
    if (urlReferralCode) {
      setValue('referralCode', urlReferralCode)
    }
  }, [urlReferralCode, setValue])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)

      // Map to backend expected format (RegisterData interface)
      const registerData: RegisterData = {
        phone: data.phone,
        password: data.password,
        fullname: data.fullname,
        bankCode: data.bankCode,
        bankNumber: data.bankNumber,
        line: data.line || undefined,
        ref: data.referralCode || undefined,
      }

      // Call authAPI.register which handles response mapping
      await authAPI.register(registerData)

      toast.success('สมัครสมาชิกสำเร็จ!')

      // Auto login with registered credentials
      await login({
        phone: data.phone,
        password: data.password,
      })

      // Wait for Zustand persist to save, then navigate to member page
      setTimeout(() => {
        navigate('/member')
      }, 100)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Register Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">P</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">เพิ่มโชค</h1>
              <p className="text-white/70 text-sm">{t("auth:register.title")}</p>
            </div>
          </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-2">เบอร์โทรศัพท์ *</label>
          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              {...register('phone')}
              type="tel"
              placeholder="0812345678"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={isLoading}
              maxLength={10}
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">รหัสผ่าน *</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                {...register('password')}
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">ยืนยันรหัสผ่าน *</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-2">ชื่อ-นามสกุล *</label>
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              {...register('fullname')}
              type="text"
              placeholder="สมชาย ใจดี"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>
          {errors.fullname && (
            <p className="text-red-400 text-sm mt-1">{errors.fullname.message}</p>
          )}
        </div>

        {/* Bank & Account Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">ธนาคาร *</label>
            <div className="relative">
              <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <select
                {...register('bankCode')}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                disabled={isLoading}
              >
                {THAI_BANKS.map(bank => (
                  <option key={bank.value} value={bank.value} className="bg-gray-800">
                    {bank.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.bankCode && (
              <p className="text-red-400 text-sm mt-1">{errors.bankCode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">เลขที่บัญชี *</label>
            <div className="relative">
              <FaCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                {...register('bankNumber')}
                type="text"
                placeholder="1234567890"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
                maxLength={12}
              />
            </div>
            {errors.bankNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.bankNumber.message}</p>
            )}
          </div>
        </div>

        {/* Line ID & Referral Code (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Line ID (ไม่บังคับ)</label>
            <div className="relative">
              <FiMessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                {...register('line')}
                type="text"
                placeholder="@yourlineid"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              รหัสแนะนำ (ไม่บังคับ)
              {urlReferralCode && (
                <span className="ml-2 text-green-400 text-xs">
                  ✓ กำลังสมัครผ่านรหัสแนะนำ
                </span>
              )}
            </label>
            <div className="relative">
              <FaUserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                {...register('referralCode')}
                type="text"
                placeholder="รหัสแนะนำจากเพื่อน"
                className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  urlReferralCode ? 'border-green-400/50 bg-green-500/10' : 'border-white/20'
                }`}
                disabled={isLoading}
                readOnly={!!urlReferralCode}
              />
            </div>
            {urlReferralCode && (
              <p className="text-green-300 text-xs mt-1 flex items-center gap-1">
                <FaUserPlus className="text-green-400" />
                คุณกำลังสมัครผ่านคำแนะนำของเพื่อน
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>กำลังสมัครสมาชิก...</span>
            </>
          ) : (
            <>
              <FaUserPlus />
              <span>{t("auth:register.title")}</span>
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-white/70 text-sm">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/member/login" className="text-purple-300 hover:text-purple-200 font-medium transition-colors">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-4 text-center">
        <Link to="/" className="text-white/50 hover:text-white/80 text-xs transition-colors">
          กลับหน้าหลัก
        </Link>
      </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/50 text-xs">
          <p>&copy; 2024 เพิ่มโชค. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
