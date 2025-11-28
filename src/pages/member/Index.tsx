import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaTrophy, FaLine } from 'react-icons/fa'
import { gameProviderAPI, type GameProvider } from '@api/gameProviderAPI'
import { toast } from 'react-hot-toast'
import MemberChat from '@/components/chat/MemberChat'

const MemberIndex = () => {
  const [, setLoading] = useState(true)
  const [providers, setProviders] = useState<GameProvider[]>([])
  const [activeTab, setActiveTab] = useState<string>('Slot') // Default to Slot category
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProviders(activeTab) // Load initial category
  }, [])

  // Reload providers when tab changes
  useEffect(() => {
    loadProviders(activeTab)
  }, [activeTab])

  const loadProviders = async (category?: string) => {
    try {
      setLoading(true)
      let response

      // Filter by category if specified and not 'all' or 'new'
      if (category && category !== 'all' && category !== 'new') {
        response = await gameProviderAPI.getProvidersByCategory(category)
      } else {
        response = await gameProviderAPI.getProviders()
      }

      console.log('Providers loaded:', response)

      // Handle different response structures
      if (response && response.data) {
        setProviders(response.data)
      } else if (Array.isArray(response)) {
        setProviders(response)
      } else {
        console.warn('Unexpected response format:', response)
        setProviders([])
      }
    } catch (error) {
      console.error('Failed to load providers:', error)
      toast.error('ไม่สามารถโหลด providers ได้')
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  // Action buttons configuration
  const actionButtons = [
    {
      id: 'account',
      name: 'บัญชี',
      image: '/images/btn-play-profile.webp',
      link: '/member/dashboard'
    },
    {
      id: 'deposit',
      name: 'ฝากถอน',
      image: '/images/btn-play-topup.webp',
      link: '/member/deposit'
    },
    {
      id: 'register',
      name: 'สมัคร',
      image: '/images/btn-play-register.webp',
      link: '/member/promotions'
    },
    {
      id: 'contact',
      name: 'ติดต่อ',
      image: '/images/btn-play-contact.webp',
      link: 'tel:0277777777'
    },
  ]

  // Sidebar tabs configuration - match backend categories
  const sidebarTabs = [
    { id: 'Slot', name: 'สล็อต', image: '/images/btn-cat-slot.webp' },
    { id: 'Live Casino', name: 'คาสิโน', image: '/images/btn-cat-poker.webp' },
    { id: 'Poker', name: 'โป๊กเกอร์', image: '/images/btn-cat-card.webp' },
    { id: 'Sport', name: 'กีฬา', image: '/images/btn-cat-sport.webp' },
  ]

  // Filter providers based on search
  const searchFilteredProviders = providers.filter(provider =>
    provider.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a1520] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* 4 Action Buttons */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            {actionButtons.map((button) => {
              const isExternal = button.link.startsWith('tel:') || button.link.startsWith('http')

              return isExternal ? (
                <a
                  key={button.id}
                  href={button.link}
                  className="relative group overflow-hidden rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  <img
                    src={button.image}
                    alt={button.name}
                    className="w-full h-auto object-cover"
                  />
                </a>
              ) : (
                <Link
                  key={button.id}
                  to={button.link}
                  className="relative group overflow-hidden rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  <img
                    src={button.image}
                    alt={button.name}
                    className="w-full h-auto object-cover"
                  />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'ring-2 ring-yellow-500 scale-105 shadow-lg'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={tab.image}
                  alt={tab.name}
                  className="h-12 w-auto object-contain"
                />
              </button>
            ))}
            {/* Lottery Link Button */}
            <Link
              to="/member/lottery"
              className="relative overflow-hidden rounded-lg transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-105 shadow-lg"
            >
              <img
                src="/images/btn-cat-lotto.webp"
                alt="หวย"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Layout: Game Grid + Right Sidebar */}
        <div className="flex gap-4">
          {/* Game Grid - Left/Center */}
          <div className="flex-1 w-full">
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="ค้นหาเกมส์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Provider Grid - 4 columns desktop, 3 tablet, 2 mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchFilteredProviders.map((provider, index) => {
                // Use provider image from database - remove leading slash if present
                const imagePath = provider.image_path.startsWith('/') ? provider.image_path.slice(1) : provider.image_path
                const providerImage = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${imagePath}`

                return (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <Link
                      to={`/member/games/${provider.product_code}`}
                      className="group relative block"
                    >
                      <div className="relative">
                        {/* Card Border Frame */}
                        <img
                          src="/images/card-border.webp"
                          alt="frame"
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                        />

                        {/* Provider Card */}
                        <div className="relative aspect-square p-2 flex items-center justify-center bg-gradient-to-br from-[#1a2332] to-[#0f1825] rounded-lg overflow-hidden">
                          <img
                            src={providerImage}
                            alt={provider.description}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 p-2"
                            onError={(e) => {
                              e.currentTarget.src = '/images/logo.webp'
                            }}
                          />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-center pb-4">
                            <span className="text-white text-sm font-bold">คลิกเพื่อดูเกม</span>
                          </div>
                        </div>
                      </div>

                      {/* Provider Name */}
                      <div className="mt-2 text-white text-sm font-bold text-center truncate px-1 uppercase">
                        {provider.product_name}
                      </div>

                      {/* Description */}
                      <div className="text-yellow-400 text-xs text-center">
                        {provider.description}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* No Results */}
            {searchFilteredProviders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">ไม่พบผลลัพธ์</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block w-40 space-y-2 flex-shrink-0">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full relative overflow-hidden rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'ring-2 ring-yellow-500 scale-105 shadow-lg'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img
                  src={tab.image}
                  alt={tab.name}
                  className="w-full h-auto object-cover"
                />
              </button>
            ))}
            {/* Lottery Link Button */}
            <Link
              to="/member/lottery"
              className="w-full relative overflow-hidden rounded-lg transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-105 shadow-lg block"
            >
              <img
                src="/images/btn-cat-lotto.webp"
                alt="หวย"
                className="w-full h-auto object-cover"
              />
            </Link>
          </div>
        </div>

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

        {/* Footer */}
        <div className="mt-12 bg-[#1a2332] rounded-xl p-6 border border-yellow-600/30">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Certifications */}
            <div>
              <h3 className="text-yellow-500 font-bold mb-3">ใบรับรองความปลอดภัย</h3>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 bg-white/10 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Responsible Gaming */}
            <div>
              <h3 className="text-yellow-500 font-bold mb-3">การเล่นอย่างรับผิดชอบ</h3>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 bg-white/10 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="text-yellow-500 font-bold mb-3">ช่องทางการชำระเงิน</h3>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="w-12 h-12 bg-white/10 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>&copy; 2025 PERMCHOK. All rights reserved.</p>
            <p className="mt-2">
              เว็บพนันออนไลน์ที่ดีที่สุด ฝาก-ถอนรวดเร็ว ปลอดภัย 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberIndex
