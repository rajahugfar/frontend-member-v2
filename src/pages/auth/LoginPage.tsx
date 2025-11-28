import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa'
import { useAuthStore } from '@store/authStore'
import type { LoginCredentials } from '@/types/auth'
import { useTranslation } from 'react-i18next'

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^(0)[0-9]{9}$/, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

const LoginPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true)
      await login(data)
      toast.success('เข้าสู่ระบบสำเร็จ')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-center mb-6">{t("auth:login.title")}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("auth:login.username")}</label>
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('phone')}
              type="tel"
              placeholder="กรอกเบอร์โทรศัพท์"
              className="input pl-12"
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("auth:login.password")}</label>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('password')}
              type="password"
              placeholder="กรอกรหัสผ่าน"
              className="input pl-12"
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="spinner w-5 h-5 border-2" />
              <span>กำลังเข้าสู่ระบบ...</span>
            </>
          ) : (
            <>
              <FaSignInAlt />
              <span>{t("auth:login.title")}</span>
            </>
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center mt-6">
        <p className="text-gray-400">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-400">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
