import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { memberLotteryAPI } from '@api/memberLotteryAPI'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiDownload,
  FiClock,
  FiFileText,
  FiChevronRight,
} from 'react-icons/fi'

// Poy interface
interface Poy {
  id: string
  poyNumber: string
  poyName?: string
  stockId: number
  stockName: string
  huayCode: string
  totalBets: number
  totalPrice: number
  totalWin?: number
  winPrice?: number
  balanceAfter?: number
  status: number
  note: string
  dateBuy?: string
  dateClose?: string
  createdAt: string
  updatedAt: string
}

const LotteryHistory: React.FC = () => {
  const { t } = useTranslation()
  const [poys, setPoys] = useState<Poy[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [hasMore, setHasMore] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'pending' | 'completed'>('today')

  useEffect(() => {
    fetchPoys()
  }, [page])

  const fetchPoys = async () => {
    setLoading(true)
    try {
      const data = await memberLotteryAPI.getPoyHistory({
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
      setPoys(data || [])
      setHasMore((data || []).length === pageSize)
    } catch (error) {
      console.error('Failed to fetch poys:', error)
      toast.error(t('lottery:messages.loadHistoryFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Filter poys by tab - use Thai timezone
  const todayPoys = poys.filter(poy => {
    const buyDate = new Date(poy.dateBuy || poy.createdAt)
    const today = new Date()
    // Compare using Thai date string to handle timezone correctly
    const buyDateThai = buyDate.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
    const todayThai = today.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
    return buyDateThai === todayThai
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

  const canCancelPoy = (dateClose?: string) => {
    if (!dateClose) return false
    const closeTime = new Date(dateClose).getTime()
    const now = new Date().getTime()
    return now < closeTime
  }

  const getTimeLeftToCancel = (dateClose?: string) => {
    if (!dateClose) return null
    const closeTime = new Date(dateClose).getTime()
    const now = new Date().getTime()
    const diffMinutes = (closeTime - now) / (1000 * 60)
    if (diffMinutes <= 0) return null

    // แสดงเป็นชั่วโมง ถ้ามากกว่า 60 นาที
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60)
      const mins = Math.floor(diffMinutes % 60)
      return `${hours} ชม. ${mins} นาที`
    }
    return `${Math.floor(diffMinutes)} นาที`
  }

  const handleCancelPoy = async (poyId: string) => {
    if (!confirm(t('lottery:messages.confirmCancel'))) {
      return
    }

    setCancellingId(poyId)
    try {
      await memberLotteryAPI.cancelPoy(poyId)
      toast.success(t('lottery:messages.cancelSuccess'))
      fetchPoys()
    } catch (error: any) {
      console.error('Failed to cancel poy:', error)
      toast.error(error.response?.data?.message || t('lottery:messages.cancelFailed'))
    } finally {
      setCancellingId(null)
    }
  }

  const handleExportCSV = () => {
    if (poys.length === 0) {
      toast.error(t('lottery:messages.noDataToExport'))
      return
    }

    const headers = [
      t('lottery:poyNumber'),
      t('lottery:betDate'),
      t('navigation:menu.lottery'),
      t('lottery:totalBets'),
      t('lottery:labels.totalBetAmount'),
      t('lottery:winAmount'),
      t('common:status'),
    ]

    const rows = poys.map((poy) => [
      poy.poyNumber,
      new Date(poy.dateBuy || poy.createdAt).toLocaleDateString('th-TH'),
      poy.stockName,
      poy.totalBets,
      poy.totalPrice,
      poy.winPrice || poy.totalWin || 0,
      getStatusLabel(poy.status),
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `poy_history_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(t('lottery:messages.exportSuccess'))
  }

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0: return t('lottery:status.cancelled')
      case 1: return t('lottery:status.waitingResult')
      case 2: return t('lottery:status.resulted')
      default: return t('lottery:status.unknown')
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-600/20 border border-red-400/30 rounded-lg">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-300 font-semibold text-xs">{t('lottery:status.cancelled')}</span>
          </div>
        )
      case 1:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-400/30 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-300 font-semibold text-xs">{t('lottery:status.waitingResult')}</span>
          </div>
        )
      case 2:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-300 font-semibold text-xs">{t('lottery:status.resulted')}</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-500/20 to-slate-600/20 border border-gray-400/30 rounded-lg">
            <span className="text-gray-300 font-semibold text-xs">{t('lottery:status.unknown')}</span>
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
    { key: 'today' as const, label: t('lottery:tabs.today'), count: todayPoys.length },
    { key: 'pending' as const, label: t('lottery:tabs.pending'), count: pendingPoys.length },
    { key: 'completed' as const, label: t('lottery:tabs.completed'), count: completedPoys.length },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
      {/* Magical background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
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
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mb-1 drop-shadow-lg">
                  📋 {t('lottery:history.title')}
                </h1>
                <p className="text-gray-400 text-sm">{t('lottery:history.subtitle')}</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg"
                disabled={poys.length === 0}
              >
                <FiDownload size={16} />
                {t('lottery:actions.export')}
              </button>
            </div>
          </motion.div>

          {/* Sub Tabs - Formal Style */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-1 mb-6 border border-white/10">
            <div className="flex">
              {subTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSubTab(tab.key)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    activeSubTab === tab.key
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeSubTab === tab.key ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <FiFileText className="text-5xl text-purple-400" />
              </motion.div>
              <p className="text-gray-300 mt-4 font-medium">{t('lottery:messages.loadingPoys')}</p>
            </div>
          ) : filteredPoys.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-16 border border-white/10 text-center"
            >
              <div className="text-8xl mb-6">🎴</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {activeSubTab === 'today' && t('lottery:emptyStates.noPoyToday')}
                {activeSubTab === 'pending' && t('lottery:emptyStates.noPoyPending')}
                {activeSubTab === 'completed' && t('lottery:emptyStates.noPoyCompleted')}
              </h2>
              <p className="text-gray-400">
                {activeSubTab === 'today' && t('lottery:emptyStates.startBetting')}
                {activeSubTab === 'pending' && t('lottery:emptyStates.allResulted')}
                {activeSubTab === 'completed' && t('lottery:emptyStates.noResults')}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPoys.map((poy, index) => {
                const dateBuy = poy.dateBuy || poy.createdAt
                const canCancel = poy.status === 1 && canCancelPoy(poy.dateClose)
                const timeLeft = canCancel ? getTimeLeftToCancel(poy.dateClose) : null
                const winAmount = poy.winPrice || poy.totalWin || 0

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
                                {poy.poyName || poy.stockName || 'โพยหวย'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">{t('lottery:poyNumber')}:</span>
                                <span className="font-mono text-purple-300 font-semibold">{poy.poyNumber}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <FiClock className="text-blue-400" />
                                <span>{formatDate(dateBuy)}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(poy.status)}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-3 border border-purple-400/20">
                            <p className="text-purple-300 text-xs mb-1">💰 {t('lottery:labels.totalBetAmount')}</p>
                            <p className="text-white font-bold text-lg">{poy.totalPrice?.toFixed(2) || '0.00'}</p>
                            <p className="text-gray-500 text-xs">{t('lottery:labels.baht')}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-xl p-3 border border-green-400/20">
                            <p className="text-green-300 text-xs mb-1">🎁 {t('lottery:labels.totalWinAmount')}</p>
                            <p className="text-green-400 font-bold text-lg">{winAmount.toFixed(2)}</p>
                            <p className="text-gray-500 text-xs">{t('lottery:labels.baht')}</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/5 backdrop-blur-sm rounded-xl p-3 border border-blue-400/20">
                            <p className="text-blue-300 text-xs mb-1">💳 {t('lottery:labels.creditAfter')}</p>
                            <p className="text-blue-400 font-bold text-lg">{poy.balanceAfter?.toFixed(2) || '0.00'}</p>
                            <p className="text-gray-500 text-xs">{t('lottery:labels.baht')}</p>
                          </div>
                        </div>

                        {/* Cancel Timer */}
                        {canCancel && timeLeft && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FiClock className="text-orange-400 animate-pulse" />
                                <span className="text-orange-300 text-sm font-medium">
                                  เหลือเวลา: {timeLeft}
                                </span>
                              </div>
                              <button
                                onClick={() => handleCancelPoy(poy.id)}
                                disabled={cancellingId === poy.id}
                                className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                              >
                                {cancellingId === poy.id ? t('lottery:labels.cancelling') : t('lottery:cancelBet') }
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Note */}
                        {poy.note && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl">
                            <p className="text-indigo-300 text-xs mb-1 flex items-center gap-1">
                              <FiFileText /> {t('lottery:note')}
                            </p>
                            <p className="text-gray-300 text-sm">{poy.note}</p>
                          </div>
                        )}

                        {/* View Detail Button */}
                        <Link to={`/member/lottery/poy/${poy.id}`}>
                          <button className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 rounded-xl transition-all flex items-center justify-center gap-2 text-purple-300 font-medium text-sm">
                            <FiFileText />
                            {t('lottery:actions.viewAllBets')}
                            <FiChevronRight />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {(hasMore || page > 1) && !loading && filteredPoys.length > 0 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 transition-all"
              >
                {t('lottery:actions.previous')}
              </button>
              <div className="px-4 py-2 bg-white/10 text-white rounded-lg">
                {t('lottery:labels.page')} {page}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 transition-all"
              >
                {t('lottery:actions.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LotteryHistory
