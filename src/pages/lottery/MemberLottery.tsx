import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClock,
  FiTrendingUp,
  FiFileText,
  FiCalendar,
  FiChevronRight,
  FiStar,
  FiZap
} from 'react-icons/fi'
import { memberLotteryAPI, OpenPeriod } from '@api/memberLotteryAPI'
import { toast } from 'react-hot-toast'
import LotteryResults from './LotteryResults'

type TabType = 'list' | 'results' | 'history'

// Helper function to get lottery flag/icon
const getLotteryIcon = (huayCode: string) => {
  const icons: Record<string, string> = {
    'GLO': '🇹🇭',
    'GSB': '🏦',
    'BAAC': '🌾',
    'SET_1': '📈',
    'SET_2': '📊',
    'SET_3': '📉',
    'SETNOON': '🔔',
    'SET': '💹',
    'YEEKEE': '🎲'
  }
  return icons[huayCode] || '🎰'
}

// Helper to get lottery theme color - ปรับสีให้นุ่มนวลและ elegant มากขึ้น
const getLotteryTheme = (huayCode: string) => {
  const themes: Record<string, {
    gradient: string
    shadow: string
    border: string
    glow: string
    accent: string
  }> = {
    'GLO': {
      gradient: 'from-rose-500/90 via-red-600/90 to-rose-700/90',
      shadow: 'shadow-rose-500/30',
      border: 'border-rose-300/50',
      glow: 'hover:shadow-rose-400/50',
      accent: 'text-rose-200'
    },
    'GSB': {
      gradient: 'from-pink-500/90 via-fuchsia-600/90 to-pink-700/90',
      shadow: 'shadow-pink-500/30',
      border: 'border-pink-300/50',
      glow: 'hover:shadow-pink-400/50',
      accent: 'text-pink-200'
    },
    'BAAC': {
      gradient: 'from-blue-600/90 via-indigo-700/90 to-blue-800/90',
      shadow: 'shadow-blue-500/30',
      border: 'border-blue-300/50',
      glow: 'hover:shadow-blue-400/50',
      accent: 'text-blue-200'
    },
    'SET_1': {
      gradient: 'from-emerald-500/90 via-green-600/90 to-emerald-700/90',
      shadow: 'shadow-emerald-500/30',
      border: 'border-emerald-300/50',
      glow: 'hover:shadow-emerald-400/50',
      accent: 'text-emerald-200'
    },
    'SET_2': {
      gradient: 'from-cyan-500/90 via-teal-600/90 to-cyan-700/90',
      shadow: 'shadow-cyan-500/30',
      border: 'border-cyan-300/50',
      glow: 'hover:shadow-cyan-400/50',
      accent: 'text-cyan-200'
    },
    'SET_3': {
      gradient: 'from-amber-500/90 via-orange-600/90 to-amber-700/90',
      shadow: 'shadow-amber-500/30',
      border: 'border-amber-300/50',
      glow: 'hover:shadow-amber-400/50',
      accent: 'text-amber-200'
    },
    'SETNOON': {
      gradient: 'from-yellow-500/90 via-amber-600/90 to-yellow-700/90',
      shadow: 'shadow-yellow-500/30',
      border: 'border-yellow-300/50',
      glow: 'hover:shadow-yellow-400/50',
      accent: 'text-yellow-200'
    },
    'SET': {
      gradient: 'from-purple-500/90 via-violet-600/90 to-purple-700/90',
      shadow: 'shadow-purple-500/30',
      border: 'border-purple-300/50',
      glow: 'hover:shadow-purple-400/50',
      accent: 'text-purple-200'
    },
    'YEEKEE': {
      gradient: 'from-fuchsia-500/90 via-purple-600/90 to-fuchsia-700/90',
      shadow: 'shadow-fuchsia-500/30',
      border: 'border-fuchsia-300/50',
      glow: 'hover:shadow-fuchsia-400/50',
      accent: 'text-fuchsia-200'
    }
  }
  return themes[huayCode] || {
    gradient: 'from-slate-500/90 via-gray-600/90 to-slate-700/90',
    shadow: 'shadow-slate-500/30',
    border: 'border-slate-300/50',
    glow: 'hover:shadow-slate-400/50',
    accent: 'text-slate-200'
  }
}

// Check if lottery is premium (3 main lotteries)
const isPremiumLottery = (huayCode: string) => {
  return ['GLO', 'GSB', 'BAAC'].includes(huayCode)
}

const MemberLottery: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [periods, setPeriods] = useState<OpenPeriod[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'list') {
      loadOpenPeriods()
    }
  }, [activeTab])

  const loadOpenPeriods = async () => {
    setLoading(true)
    try {
      const data = await memberLotteryAPI.getOpenPeriods()
      setPeriods(data || [])
    } catch (error) {
      console.error('Failed to load periods:', error)
      setPeriods([])
    } finally {
      setLoading(false)
    }
  }

  // Group periods by lottery type
  const premiumPeriods = periods.filter(p => isPremiumLottery(p.huayCode))
  const stockPeriods = periods.filter(p => p.huayCode.startsWith('SET'))
  const otherPeriods = periods.filter(p => !isPremiumLottery(p.huayCode) && !p.huayCode.startsWith('SET'))

  const tabs = [
    { key: 'list' as TabType, label: t("lottery:index.lotteryList"), icon: FiCalendar },
    { key: 'results' as TabType, label: t("lottery:results"), icon: FiTrendingUp },
    { key: 'history' as TabType, label: t("lottery:index.lotteryTickets"), icon: FiFileText },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
      {/* Magical background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mb-2 drop-shadow-lg">
              ✨ {t("lottery:memberLottery.title")}
            </h1>
            <p className="text-gray-400 text-sm">{t("lottery:memberLottery.subtitle")}</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-yellow-400/90 to-orange-500/90 text-white shadow-lg shadow-yellow-500/30'
                      : 'bg-white/5 backdrop-blur-md text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Icon className="text-base" />
                  {tab.label}
                </motion.button>
              )
            })}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-yellow-400/50 border-t-yellow-400"></div>
                    <p className="text-gray-400 mt-3 text-sm">{t("common:messages.loading")}</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Premium Lotteries Section */}
                    {premiumPeriods.length > 0 && (
                      <div>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-2 mb-4"
                        >
                          <div className="flex items-center gap-1.5">
                            <FiStar className="text-yellow-400 text-lg" />
                            <h2 className="text-xl font-bold text-white">หวยรัฐบาล 3 อันดับหลัก</h2>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/50 to-transparent"></div>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {premiumPeriods.map((period, index) => (
                            <PremiumLotteryCard key={period.id} period={period} index={index} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stock Market Lotteries */}
                    {stockPeriods.length > 0 && (
                      <div>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-2 mb-4"
                        >
                          <div className="flex items-center gap-1.5">
                            <FiTrendingUp className="text-blue-400 text-lg" />
                            <h2 className="text-xl font-bold text-white">หวยหุ้นไทย</h2>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-blue-400/50 to-transparent"></div>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {stockPeriods.map((period, index) => (
                            <StandardLotteryCard key={period.id} period={period} index={index} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Lotteries */}
                    {otherPeriods.length > 0 && (
                      <div>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-2 mb-4"
                        >
                          <div className="flex items-center gap-1.5">
                            <FiZap className="text-purple-400 text-lg" />
                            <h2 className="text-xl font-bold text-white">หวยอื่นๆ</h2>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-purple-400/50 to-transparent"></div>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {otherPeriods.map((period, index) => (
                            <StandardLotteryCard key={period.id} period={period} index={index} />
                          ))}
                        </div>
                      </div>
                    )}

                    {periods.length === 0 && !loading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
                      >
                        <FiCalendar className="text-5xl text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">{t("lottery:memberLottery.noPeriods")}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LotteryResults />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LotteryMyBets />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Premium Lottery Card (for 3 main lotteries)
const PremiumLotteryCard: React.FC<{ period: OpenPeriod; index: number }> = ({ period, index }) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState('')
  const theme = getLotteryTheme(period.huayCode)
  const icon = getLotteryIcon(period.huayCode)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      let closeTime = new Date(period.closeTime)

      // Debug log
      if (period.huayCode === 'DJIVIP' || period.huayCode === 'DJI') {
        console.log(`🔍 ${period.huayName}:`, {
          flagNextday: period.flagNextday,
          originalClose: period.closeTime,
          closeTime: closeTime.toISOString(),
          now: now.toISOString()
        })
      }

      // If flag_nextday is true, add 1 day to closeTime
      if (period.flagNextday) {
        closeTime = new Date(closeTime.getTime() + 24 * 60 * 60 * 1000)
        if (period.huayCode === 'DJIVIP' || period.huayCode === 'DJI') {
          console.log(`✅ Added 1 day, new closeTime:`, closeTime.toISOString())
        }
      }

      const diff = closeTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(t('lottery:index.alreadyClosed'))
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [period])

  return (
    <Link to={`/member/lottery/bet/${period.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.03, y: -5 }}
        className={`relative bg-gradient-to-br ${theme.gradient} backdrop-blur-md rounded-2xl p-5 border ${theme.border} cursor-pointer ${theme.shadow} hover:shadow-xl ${theme.glow} transition-all duration-300 overflow-hidden group`}
      >
        {/* Magical shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Sparkle corner */}
        <div className="absolute top-2 right-2">
          <FiStar className="text-yellow-300/80 text-lg animate-pulse" />
        </div>

        {/* Icon & Name */}
        <div className="relative text-center mb-4">
          <div className="text-5xl mb-2">{icon}</div>
          <h3 className="text-2xl font-bold text-white drop-shadow-md">{period.huayName}</h3>
          <p className="text-white/70 text-xs mt-1">{period.periodName}</p>
        </div>

        {/* Countdown */}
        <div className="relative bg-black/20 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-yellow-300/90 mb-1">
            <FiClock className="text-sm animate-pulse" />
            <span className="text-xs font-medium">เหลือเวลา</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-mono font-bold text-white drop-shadow">{timeLeft}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="relative w-full py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            แทงเลย
            <FiChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
        </button>
      </motion.div>
    </Link>
  )
}

// Standard Lottery Card (for stock market and other lotteries)
const StandardLotteryCard: React.FC<{ period: OpenPeriod; index: number }> = ({ period, index }) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState('')
  const theme = getLotteryTheme(period.huayCode)
  const icon = getLotteryIcon(period.huayCode)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      let closeTime = new Date(period.closeTime)

      // If flag_nextday is true, add 1 day to closeTime
      if (period.flagNextday) {
        closeTime = new Date(closeTime.getTime() + 24 * 60 * 60 * 1000)
      }

      const diff = closeTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(t('lottery:index.alreadyClosed'))
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [period])

  return (
    <Link to={`/member/lottery/bet/${period.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.03, y: -3 }}
        className={`relative bg-gradient-to-br ${theme.gradient} backdrop-blur-md rounded-xl p-4 border ${theme.border} cursor-pointer ${theme.shadow} hover:shadow-lg ${theme.glow} transition-all duration-300 overflow-hidden group`}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Icon & Name */}
        <div className="relative flex items-center gap-2.5 mb-3">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{period.huayName}</h3>
            <p className="text-white/60 text-xs truncate">{period.periodName}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="relative bg-black/20 backdrop-blur-sm rounded-lg p-2.5 mb-3 border border-white/10">
          <div className="flex items-center justify-center gap-1.5">
            <FiClock className="text-yellow-300/90 text-sm" />
            <span className="text-base font-mono font-bold text-white">{timeLeft}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="relative w-full py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md text-sm overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            แทงเลย
            <FiChevronRight className="text-base group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
        </button>
      </motion.div>
    </Link>
  )
}

// Component: My Bets (Poy History)
const LotteryMyBets: React.FC = () => {
  const { t } = useTranslation()
  const [poys, setPoys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'pending' | 'completed'>('today')

  useEffect(() => {
    loadPoyHistory()
  }, [])

  const loadPoyHistory = async () => {
    setLoading(true)
    try {
      const data = await memberLotteryAPI.getPoyHistory({ limit: 100 })
      setPoys(data || [])
    } catch (error) {
      console.error('Failed to load poy history:', error)
      toast.error(t('lottery:messages.loadHistoryFailed'))
      setPoys([])
    } finally {
      setLoading(false)
    }
  }

  // Filter poys by tab
  const todayPoys = poys.filter(poy => {
    const buyDate = new Date(poy.dateBuy)
    const today = new Date()
    return buyDate.toDateString() === today.toDateString()
  })

  const pendingPoys = poys.filter(poy => poy.status === 1)
  const completedPoys = poys.filter(poy => poy.status === 2 || poy.status === 0)

  const getFilteredPoys = () => {
    switch (activeSubTab) {
      case 'today':
        return todayPoys
      case 'pending':
        return pendingPoys
      case 'completed':
        return completedPoys
      default:
        return todayPoys
    }
  }

  const filteredPoys = getFilteredPoys()

  const canCancelPoy = (dateBuy: string) => {
    const buyTime = new Date(dateBuy).getTime()
    const now = new Date().getTime()
    const diffMinutes = (now - buyTime) / (1000 * 60)
    return diffMinutes < 30
  }

  const getTimeLeftToCancel = (dateBuy: string) => {
    const buyTime = new Date(dateBuy).getTime()
    const now = new Date().getTime()
    const diffMinutes = 30 - (now - buyTime) / (1000 * 60)
    if (diffMinutes <= 0) return null
    return Math.floor(diffMinutes)
  }

  const handleCancelPoy = async (poyId: string) => {
    if (!confirm(t('lottery:memberLottery.confirmCancel'))) {
      return
    }

    setCancellingId(poyId)
    try {
      await memberLotteryAPI.cancelPoy(poyId)
      toast.success(t('lottery:messages.cancelSuccess'))
      loadPoyHistory()
    } catch (error: any) {
      console.error('Failed to cancel poy:', error)
      toast.error(error.response?.data?.message || t('lottery:messages.cancelFailed'))
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-600/20 border border-red-400/30 rounded-lg">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-300 font-semibold text-xs">ยกเลิกแล้ว</span>
          </div>
        )
      case 1:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-400/30 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-300 font-semibold text-xs">รอออกผล</span>
          </div>
        )
      case 2:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-300 font-semibold text-xs">{t("lottery:status.resulted")}</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-500/20 to-slate-600/20 border border-gray-400/30 rounded-lg">
            <span className="text-gray-300 font-semibold text-xs">ไม่ทราบสถานะ</span>
          </div>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPoyIcon = (status: number) => {
    switch (status) {
      case 0: return '❌'
      case 1: return '🎫'
      case 2: return '🏆'
      default: return '📋'
    }
  }

  const subTabs = [
    { key: 'today' as const, label: t("lottery:tabs.today"), icon: '📅', count: todayPoys.length, color: 'from-blue-500 to-cyan-500' },
    { key: 'pending' as const, label: t("lottery:tabs.pending"), icon: '⏳', count: pendingPoys.length, color: 'from-yellow-500 to-orange-500' },
    { key: 'completed' as const, label: t("lottery:tabs.completed"), icon: '🏆', count: completedPoys.length, color: 'from-green-500 to-emerald-500' },
  ]

  if (loading) {
    return (
      <div className="text-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <FiFileText className="text-5xl text-purple-400" />
        </motion.div>
        <p className="text-gray-300 mt-4 font-medium">กำลังโหลดโพยหวย...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex justify-center gap-3 flex-wrap">
        {subTabs.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 overflow-hidden ${
              activeSubTab === tab.key
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                : 'bg-white/5 backdrop-blur-md text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSubTab === tab.key ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Empty State */}
      {filteredPoys.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-16 border border-white/10 text-center"
        >
          <div className="text-8xl mb-6">🎴</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {activeSubTab === 'today' && t("lottery:emptyStates.noPoyToday")}
            {activeSubTab === 'pending' && t("lottery:emptyStates.noPoyPending")}
            {activeSubTab === 'completed' && t("lottery:emptyStates.noPoyCompleted")}
          </h2>
          <p className="text-gray-400">
            {activeSubTab === 'today' && t("lottery:emptyStates.startBetting")}
            {activeSubTab === 'pending' && t("lottery:emptyStates.allResulted")}
            {activeSubTab === 'completed' && t("lottery:emptyStates.noResults")}
          </p>
        </motion.div>
      )}

      {/* Poy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPoys.map((poy, index) => {
          const canCancel = poy.status === 1 && canCancelPoy(poy.dateBuy)
          const timeLeft = canCancel ? getTimeLeftToCancel(poy.dateBuy) : null

          return (
            <motion.div
              key={poy.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl border border-purple-400/20 overflow-hidden">
                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-4xl">{getPoyIcon(poy.status)}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 mb-1">
                          {poy.poyName || t("lottery:index.lotteryTickets")}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">{t("lottery:poyNumber")}:</span>
                          <span className="font-mono text-purple-300 font-semibold">{poy.poyNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <FiClock className="text-blue-400" />
                          <span>{formatDate(poy.dateBuy)}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(poy.status)}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-3 border border-purple-400/20">
                      <p className="text-purple-300 text-xs mb-1">💰 ยอดแทง</p>
                      <p className="text-white font-bold text-lg">{poy.totalPrice?.toFixed(2) || '0.00'}</p>
                      <p className="text-gray-500 text-xs">บาท</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-xl p-3 border border-green-400/20">
                      <p className="text-green-300 text-xs mb-1">🎁 ยอดชนะ</p>
                      <p className="text-green-400 font-bold text-lg">{poy.winPrice?.toFixed(2) || '0.00'}</p>
                      <p className="text-gray-500 text-xs">บาท</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/5 backdrop-blur-sm rounded-xl p-3 border border-blue-400/20">
                      <p className="text-blue-300 text-xs mb-1">💳 เครดิตหลัง</p>
                      <p className="text-blue-400 font-bold text-lg">{poy.balanceAfter?.toFixed(2) || '0.00'}</p>
                      <p className="text-gray-500 text-xs">บาท</p>
                    </div>
                  </div>

                  {/* Cancel Timer */}
                  {canCancel && timeLeft && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-orange-400 animate-pulse" />
                          <span className="text-orange-300 text-sm font-medium">
                            เหลือเวลายกเลิก {timeLeft} นาที
                          </span>
                        </div>
                        <button
                          onClick={() => handleCancelPoy(poy.id)}
                          disabled={cancellingId === poy.id}
                          className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                          {cancellingId === poy.id ? t("lottery:memberLottery.cancelling") : t("lottery:cancelBet") }
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {poy.note && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl">
                      <p className="text-indigo-300 text-xs mb-1 flex items-center gap-1">
                        <FiFileText /> หมายเหตุ
                      </p>
                      <p className="text-gray-300 text-sm">{poy.note}</p>
                    </div>
                  )}

                  {/* View Detail Button */}
                  <Link to={`/member/lottery/poy/${poy.id}`}>
                    <button className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 rounded-xl transition-all flex items-center justify-center gap-2 text-purple-300 font-medium text-sm">
                      <FiFileText />
                      ดูรายการแทงทั้งหมด
                      <FiChevronRight />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default MemberLottery
