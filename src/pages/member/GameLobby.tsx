import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiPlay, FiEye, FiArrowRight, FiArrowLeft, FiChevronRight } from 'react-icons/fi'
import { FaHome } from 'react-icons/fa'
import { publicGameAPI } from '../../api/publicGameAPI'
import { gameAPI } from '../../api/memberAPI'
import { toast } from 'react-hot-toast'
import MemberChat from '@/components/chat/MemberChat'

const ACTION_BUTTONS = [
  { id: 'account', nameKey: 'game:actionButtons.account', image: '/images/btn-play-profile.webp', link: '/member/dashboard' },
  { id: 'deposit', nameKey: 'game:actionButtons.deposit', image: '/images/btn-play-topup.webp', link: '/member/deposit' },
  { id: 'register', nameKey: 'game:actionButtons.register', image: '/images/btn-play-register.webp', link: '/member/promotions' },
  { id: 'contact', nameKey: 'game:actionButtons.contact', image: '/images/btn-play-contact.webp', link: 'tel:0277777777' },
]

const GameLobby: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const providerParam = searchParams.get('provider')

  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState({ main: 0, game: 0 })
  const [filters, setFilters] = useState({ search: '', type: '', sort: 'popular' })
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferForm, setTransferForm] = useState({ amount: '', direction: 'IN' as 'IN' | 'OUT' })

  useEffect(() => {
    loadGames()
    loadBalance()
  }, [providerParam])

  const loadGames = async () => {
    setLoading(true)
    try {
      const response = await publicGameAPI.getGames({
        provider: providerParam || undefined,
        limit: 1000
      })
      setGames(response.games || [])
    } catch (error) {
      console.error('Load games error:', error)
      toast.error(t('game:messages.loadGameError'))
    } finally {
      setLoading(false)
    }
  }

  const loadBalance = async () => {
    try {
      const response = await gameAPI.getBalance()
      if (response.data.success) {
        setBalance(response.data.data)
      }
    } catch (error) {
      console.error('Load balance error:', error)
    }
  }

  const [loadingGame, setLoadingGame] = useState(false)
  const [loadingGameName, setLoadingGameName] = useState('')

  const handlePlayGame = async (gameCode: string, gameName: string) => {
    try {
      setLoadingGame(true)
      setLoadingGameName(gameName)

      const response = await gameAPI.playGame(gameCode)
      if (response.data.success) {
        const gameUrl = response.data.data.url
        // Redirect to game URL in same tab
        window.location.href = gameUrl
      } else {
        setLoadingGame(false)
        toast.error(response.data.message || t('game:messages.playGameError'))
      }
    } catch (error: any) {
      setLoadingGame(false)
      console.error('Play game error:', error)
      toast.error(error.response?.data?.message || t('game:messages.playGameError'))
    }
  }

  const handleTransfer = async () => {
    const amount = Number(transferForm.amount)

    if (!amount || amount <= 0) {
      toast.error(t('game:messages.enterAmount'))
      return
    }

    if (transferForm.direction === 'IN' && amount > balance.main) {
      toast.error(t('game:messages.insufficientMainWallet'))
      return
    }

    if (transferForm.direction === 'OUT' && amount > balance.game) {
      toast.error(t('game:messages.insufficientGameWallet'))
      return
    }

    try {
      await gameAPI.transfer({
        amount,
        direction: transferForm.direction
      })

      toast.success(t('game:messages.transferSuccess'))
      setShowTransferModal(false)
      setTransferForm({ amount: '', direction: 'IN' })
      loadBalance()
    } catch (error: any) {
      console.error('Transfer error:', error)
      toast.error(error.response?.data?.message || t('game:messages.transferError'))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = !filters.search || (game.name || '').toLowerCase().includes(filters.search.toLowerCase())
    const matchesType = !filters.type || game.type === filters.type
    return matchesSearch && matchesType
  })

  // Calculate grid columns based on game count
  const getGridColumns = () => {
    const count = filteredGames.length

    // For very few games (1-4), show larger cards
    if (count <= 4) {
      return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    }
    // For 5-12 games, medium sized cards
    else if (count <= 12) {
      return 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    }
    // For 13-24 games (up to 3 rows on xl), still comfortable size
    else if (count <= 24) {
      return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
    }
    // For many games (more than 3 rows), use smaller grid
    else {
      return 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

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
              {t('game:breadcrumb.home')}
            </button>
            <FiChevronRight className="text-gray-600" />
            <span className="text-white font-bold">{t("navigation:menu.games")}</span>
            {providerParam && (
              <>
                <FiChevronRight className="text-gray-600" />
                <span className="text-yellow-400 font-bold">{providerParam}</span>
              </>
            )}
          </nav>
        </div>

        {/* 4 Action Buttons */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            {ACTION_BUTTONS.map((button) => {
              const isExternal = button.link.startsWith('tel:') || button.link.startsWith('http')

              return isExternal ? (
                <a
                  key={button.id}
                  href={button.link}
                  className="relative group overflow-hidden rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  <img
                    src={button.image}
                    alt={t(button.nameKey)}
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
                    alt={t(button.nameKey)}
                    className="w-full h-auto object-cover"
                  />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Provider Info */}
        {providerParam && (
          <div className="mb-4 flex items-center gap-2">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-lg">
              <span className="text-yellow-400 font-bold text-lg">
                {t('game:providerFilter.viewingFrom')} <span className="text-white ml-2">{providerParam}</span>
              </span>
            </div>
            <Link
              to="/member/games"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-bold transition-all"
            >
              {t('game:providerFilter.viewAll')}
            </Link>
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
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={t('game:searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Games Grid - 8 columns on XL screens */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500"></div>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">{t('game:noGamesFound')}</p>
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
                        src={game.imageUrl || 'https://via.placeholder.com/300x300?text=Game'}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      {/* Badges */}
                      {game.isFeatured && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded-lg z-20">
                          ⭐ {t('game:badges.featured')}
                        </span>
                      )}
                      {game.isNew && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg z-20">
                          🆕 {t('game:badges.new')}
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
                          <span>{t('game:buttons.play')}</span>
                        </button>
                        {game.hasDemo && (
                          <button
                            type="button"
                            className="px-4 py-2 bg-white/20 text-white rounded-lg font-bold hover:bg-white/30 transition-all flex items-center gap-2 border-2 border-white/40"
                          >
                            <FiEye size={16} />
                            <span>{t('game:buttons.demo')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="mt-2">
                    <p className="text-white font-bold text-sm truncate uppercase">{game.name}</p>
                    <p className="text-yellow-400 text-xs">{game.provider}</p>
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
          <p>© 2024 SA Casino Gaming. All rights reserved.</p>
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
                {t('game:loadingModal.title')}
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
                {t('game:loadingModal.message')}
              </p>

              {/* Floating Elements */}
              <div className="absolute -top-8 left-1/4 text-4xl animate-float">🎮</div>
              <div className="absolute -bottom-8 right-1/4 text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🎯</div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] rounded-2xl p-6 max-w-md w-full border-4 border-yellow-600/50 shadow-2xl">
            <h3 className="text-2xl font-black text-yellow-400 mb-6 drop-shadow-lg">{t('game:transferModal.title')}</h3>

            {/* Direction Tabs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setTransferForm({ ...transferForm, direction: 'IN' })}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2 ${
                  transferForm.direction === 'IN'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-400 shadow-lg scale-105'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <FiArrowRight />
                <span>{t('game:transferModal.toGame')}</span>
              </button>
              <button
                type="button"
                onClick={() => setTransferForm({ ...transferForm, direction: 'OUT' })}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2 ${
                  transferForm.direction === 'OUT'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-lg scale-105'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <FiArrowLeft />
                <span>{t('game:transferModal.fromGame')}</span>
              </button>
            </div>

            {/* Balance Display */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-white/5 rounded-lg border-2 border-white/10">
                <p className="text-yellow-400 text-xs mb-1 font-bold">{t('game:transferModal.mainWallet')}</p>
                <p className="text-white font-black text-lg">฿{formatCurrency(balance.main)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border-2 border-white/10">
                <p className="text-yellow-400 text-xs mb-1 font-bold">{t('game:transferModal.gameWallet')}</p>
                <p className="text-white font-black text-lg">฿{formatCurrency(balance.game)}</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-yellow-400 text-sm mb-2 font-bold">{t('game:transferModal.amount')}</label>
              <input
                type="number"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white text-2xl font-bold placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder={t('game:transferModal.amountPlaceholder')}
              />
            </div>

            {/* Quick Amount */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[100, 500, 1000, 5000].map(amount => (
                <button
                  type="button"
                  key={amount}
                  onClick={() => setTransferForm({ ...transferForm, amount: amount.toString() })}
                  className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm font-bold border-2 border-white/20 hover:border-yellow-400"
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleTransfer}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl transition-all font-black shadow-lg border-2 border-yellow-400"
              >
                {t('game:transferModal.confirm')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTransferModal(false)
                  setTransferForm({ amount: '', direction: 'IN' })
                }}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-bold border-2 border-white/20"
              >
                {t('game:transferModal.cancel')}
              </button>
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

export default GameLobby
