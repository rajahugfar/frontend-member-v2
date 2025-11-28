import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiPlay, FiChevronRight } from 'react-icons/fi'
import { FaHome, FaUser, FaSignOutAlt, FaCoins, FaMoneyBillWave } from 'react-icons/fa'
import { ambGameAPI, type AMBGame } from '@api/ambGameAPI'
import { useMemberStore } from '@store/memberStore'
import { toast } from 'react-hot-toast'
import MemberChat from '@/components/chat/MemberChat'

const AMBGameList: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { provider } = useParams<{ provider: string }>()
  const { logout, member } = useMemberStore()

  const [games, setGames] = useState<AMBGame[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingGame, setLoadingGame] = useState(false)
  const [loadingGameName, setLoadingGameName] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/member/login')
    toast.success('ออกจากระบบสำเร็จ')
  }

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('memberToken')

    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบก่อนใช้งาน')
      navigate('/member/login')
      return
    }

    if (provider) {
      loadGames()
    }
  }, [provider, navigate])

  const loadGames = async () => {
    if (!provider) return

    setLoading(true)
    try {
      const response = await ambGameAPI.getGamesByProvider(provider)
      if (response.success) {
        setGames(response.data.games || [])
      } else {
        toast.error('โหลดเกมไม่สำเร็จ')
      }
    } catch (error: any) {
      console.error('Load games error:', error)
      toast.error(error.response?.data?.message || 'โหลดเกมไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayGame = async (gameCode: string, gameName: string) => {
    if (!provider) return

    try {
      setLoadingGame(true)
      setLoadingGameName(gameName)

      const response = await ambGameAPI.launchGame(gameCode, provider)
      if (response.success) {
        // Redirect to game URL
        window.location.href = response.data.gameUrl
      } else {
        setLoadingGame(false)
        toast.error(response.message || 'เปิดเกมไม่สำเร็จ')
      }
    } catch (error: any) {
      setLoadingGame(false)
      console.error('Play game error:', error)
      toast.error(error.response?.data?.message || 'เปิดเกมไม่สำเร็จ')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Filter games by search query
  const filteredGames = games.filter(game => {
    if (!searchQuery) return true
    return game.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Calculate grid columns based on game count
  const getGridColumns = () => {
    const count = filteredGames.length

    if (count <= 4) {
      return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    } else if (count <= 12) {
      return 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    } else if (count <= 24) {
      return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
    } else {
      return 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/member" className="flex items-center">
              <img
                src="/images/bicycle678-logo.svg"
                alt="Bicycle678"
                className="h-12 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/bicycle678-logo.svg';
                }}
              />
            </Link>

            {/* User Info & Actions */}
            {member && (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">{member.phone}</div>
                    <div className="text-yellow-400 text-xs font-semibold flex items-center">
                      <FaCoins className="mr-1" />
                      {formatCurrency(member.credit || 0)}
                    </div>
                  </div>
                </div>

                {/* Deposit Button */}
                <Link
                  to="/member/deposit"
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  <FaMoneyBillWave />
                  <span className="hidden md:inline">{t("navigation:menu.deposit")}</span>
                </Link>

                {/* Withdraw Button */}
                <Link
                  to="/member/withdraw"
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  <FaCoins />
                  <span className="hidden md:inline">{t("navigation:menu.withdraw")}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  <FaSignOutAlt />
                  <span className="hidden md:inline">{t("navigation:menu.logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="flex items-center space-x-2 text-sm">
              <button
                type="button"
                onClick={() => navigate('/member')}
                className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <FaHome className="mr-1" />
                หน้าแรก
              </button>
              <FiChevronRight className="text-gray-600" />
              <span className="text-white font-bold">{t("navigation:menu.games")}</span>
              {provider && (
                <>
                  <FiChevronRight className="text-gray-600" />
                  <span className="text-yellow-400 font-bold uppercase">{provider}</span>
                </>
              )}
            </nav>
          </div>

          {/* Provider Header */}
          {provider && (
            <div className="mb-6 flex items-center gap-2">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-lg">
                <span className="text-yellow-400 font-bold text-xl">
                  เกมส์จากค่าย: <span className="text-white ml-2 uppercase">{provider}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/member')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-bold transition-all"
              >
                กลับหน้าแรก
              </button>
            </div>
          )}

          {/* Game Grid */}
          <div className="w-full">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาเกม..."
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Games Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500"></div>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {searchQuery ? 'ไม่พบเกมที่ค้นหา' : 'ไม่พบเกม'}
                </p>
              </div>
            ) : (
              <div className={`grid ${getGridColumns()} gap-4`}>
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.code}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="group relative"
                  >
                    <div className="relative">
                      {/* Game Card */}
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={game.img || 'https://via.placeholder.com/300x300?text=Game'}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* Badges */}
                        {game.rank <= 5 && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded-lg z-20">
                            ⭐ แนะนำ
                          </span>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-center pb-4 gap-2">
                          <button
                            type="button"
                            onClick={() => handlePlayGame(game.code, game.name)}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-bold hover:from-yellow-500 hover:to-orange-500 transition-all flex items-center gap-2 shadow-lg border-2 border-yellow-400"
                          >
                            <FiPlay size={16} />
                            <span>เล่น</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="mt-2">
                      <p className="text-white font-bold text-sm truncate">{game.name}</p>
                      <p className="text-yellow-400 text-xs uppercase">{game.type}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0a0e13] py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2024 Bicycle678 Gaming. All rights reserved.</p>
        </div>
      </footer>

      {/* Member Chat */}
      <MemberChat />

      {/* Game Loading Modal */}
      {loadingGame && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative max-w-md w-full">
            {/* Magical Circle Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 border-4 border-yellow-500/30 rounded-full animate-spin-slow"></div>
              <div className="absolute w-64 h-64 border-4 border-purple-500/30 rounded-full animate-spin-reverse"></div>
              <div className="absolute w-48 h-48 border-4 border-pink-500/30 rounded-full animate-spin-slow"></div>
            </div>

            {/* Content Card */}
            <div className="relative bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/50 shadow-[0_0_80px_rgba(202,138,4,0.6)]">
              {/* Sparkle Effects */}
              <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">✨</div>
              <div className="absolute bottom-4 left-4 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
              <div className="absolute top-1/2 left-4 text-pink-400 animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>

              {/* Gaming Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(202,138,4,0.8)] animate-bounce">
                    <FiPlay className="text-4xl text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full blur-xl opacity-60 animate-pulse"></div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-black text-center mb-3 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-shimmer">
                กำลังเปิดเกม
              </h3>

              {/* Game Name */}
              <p className="text-xl text-white text-center font-bold mb-6 drop-shadow-lg">
                {loadingGameName}
              </p>

              {/* Progress Bar */}
              <div className="relative w-full h-3 bg-gray-800/50 rounded-full overflow-hidden border border-yellow-500/30 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 animate-loading-bar bg-[length:200%_100%]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
              </div>

              {/* Loading Text */}
              <p className="text-center text-gray-300 text-sm animate-pulse">
                กรุณารอสักครู่... กำลังเตรียมเกม
              </p>

              {/* Floating Elements */}
              <div className="absolute -top-8 left-1/4 text-4xl animate-float">🎮</div>
              <div className="absolute -bottom-8 right-1/4 text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🎯</div>
            </div>
          </div>
        </div>
      )}

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
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 1.5s linear infinite;
        }
        @keyframes loading-bar {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  )
}

export default AMBGameList
