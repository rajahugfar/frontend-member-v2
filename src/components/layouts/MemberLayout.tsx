import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { FaLine, FaTrophy } from 'react-icons/fa'
import { useMemberStore } from '@store/memberStore'
import toast from 'react-hot-toast'
import MemberChat from '@/components/chat/MemberChat'
import MemberNavbar from '@/components/MemberNavbar'

const MemberLayout: React.FC = () => {
  const navigate = useNavigate()
  const { logout, member, loadProfile } = useMemberStore()
  const [settings] = useState({ site_name: 'PERMCHOK', site_logo: '/images/logo.webp' })

  useEffect(() => {
    // Load profile only if not already in store
    if (!member) {
      loadProfile()
        .catch((error) => {
          console.error('Failed to load profile:', error)
        })
    }

    // Reload profile every 30 seconds to keep credit updated
    const interval = setInterval(() => {
      loadProfile().catch(() => {})
    }, 30000)

    // Listen for custom events to reload profile immediately
    const handleReloadCredit = () => {
      loadProfile().catch(() => {})
    }

    window.addEventListener('reloadCredit', handleReloadCredit)

    return () => {
      clearInterval(interval)
      window.removeEventListener('reloadCredit', handleReloadCredit)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/member/login')
    toast.success('ออกจากระบบสำเร็จ')
  }

  return (
    <div className="min-h-screen bg-[#0a1520] relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar with dropdown and language switcher */}
      <MemberNavbar
        profile={member}
        settings={settings}
        onLogout={handleLogout}
      />


      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed right-4 bottom-20 flex flex-col gap-3 z-40">
        <Link
          to="/member/promotions"
          className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300"
          title="โปรโมชั่น"
        >
          <FaTrophy className="text-2xl" />
        </Link>
        <a
          href="https://line.me/ti/p/@permchok"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300"
          title="ติดต่อผ่าน LINE"
        >
          <FaLine className="text-2xl" />
        </a>
      </div>

      {/* Chat Component */}
      <MemberChat />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default MemberLayout
