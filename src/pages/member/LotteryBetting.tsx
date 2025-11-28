import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { memberLotteryAPI, OpenPeriod, LotteryRate } from '@api/memberLotteryAPI'
import { toast } from 'react-hot-toast'
import { FiClock, FiX, FiShoppingCart, FiArrowLeft } from 'react-icons/fi'
import { useLotteryState } from '@/hooks/useLotteryState'
import { useKeyboardInput } from '@/hooks/useKeyboardInput'
import { reloadCredit } from '@/utils/creditHelpers'
import {
  BET_TYPES,
  checkDuplicate,
  shuffle_num_2,
  shuffle_num_3,
  tode4Permutations,
  formatNumber
} from '@/utils/lotteryHelpers'

// Components
import BetTypeSelector from '@/components/lottery/BetTypeSelector'
import InputModeSection from '@/components/lottery/InputModeSection'
import SpecialNumberOptions from '@/components/lottery/SpecialNumberOptions'
import CartSidebar from '@/components/lottery/CartSidebar'
import CreditDisplay from '@/components/member/CreditDisplay'
import {
  BulkPriceModal,
  ConfirmationModal,
  SuccessModal
} from '@/components/lottery/LotteryModals'

const LotteryBetting: React.FC = () => {
  const { periodId } = useParams<{ periodId: string }>()
  const navigate = useNavigate()

  // Data States
  const [period, setPeriod] = useState<OpenPeriod | null>(null)
  const [rates, setRates] = useState<LotteryRate[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Success State
  const [successPoyId, setSuccessPoyId] = useState('')
  const [successNote, setSuccessNote] = useState('')

  // Mobile Cart Drawer State
  const [showMobileCart, setShowMobileCart] = useState(false)

  // Lottery State Hook
  const lotteryState = useLotteryState(periodId)

  const {
    selectedBetTypes,
    toggleBetType,
    inputMode,
    setInputMode,
    numberInput,
    setNumberInput,
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    shuffleEnabled,
    setShuffleEnabled,
    searchQuery,
    setSearchQuery,
    showBulkPriceModal,
    setShowBulkPriceModal,
    showConfirmModal,
    setShowConfirmModal,
    showSuccessModal,
    setShowSuccessModal
  } = lotteryState

  // Get current bet type config
  const currentConfig = BET_TYPES[selectedBetType]

  // Physical Keyboard Support
  useKeyboardInput({
    enabled: inputMode === 'keyboard' && !showBulkPriceModal && !showConfirmModal && !showSuccessModal,
    maxLength: currentConfig?.digitCount || 3,
    onComplete: handleAddNumber,
    currentValue: numberInput,
    setValue: setNumberInput
  })

  // Load Data
  useEffect(() => {
    loadData()
  }, [periodId])

  const loadData = async () => {
    if (!periodId) {
      navigate('/member/lottery')
      return
    }

    setLoading(true)
    try {
      const periods = await memberLotteryAPI.getOpenPeriods()
      const foundPeriod = periods.find((p: OpenPeriod) => p.id === periodId)

      if (!foundPeriod) {
        toast.error('ไม่พบงวดหวยนี้')
        navigate('/member/lottery')
        return
      }

      setPeriod(foundPeriod)

      const ratesData = await memberLotteryAPI.getLotteryRates(foundPeriod.huayCode)
      setRates(ratesData || [])

      // Set default bet type
      if (ratesData && ratesData.length > 0) {
        setSelectedBetType(ratesData[0].bet_type)
      }
    } catch (error) {
      console.error('Load error:', error)
      toast.error('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  // Handle Add Number
  function handleAddNumber(number: string) {
    if (!number) return

    const rate = rates.find(r => r.bet_type === selectedBetType)
    if (!rate) {
      toast.error('ไม่พบอัตราจ่าย')
      return
    }

    // Check duplicate
    if (checkDuplicate(number, selectedBetType, cart)) {
      toast.error('เลขนี้มีในตะกร้าแล้ว')
      return
    }

    const config = BET_TYPES[selectedBetType]
    if (!config) return

    // Prepare numbers to add
    let numbersToAdd: string[] = [number]

    // Apply shuffle if enabled
    if (shuffleEnabled) {
      if (selectedBetType === '4tode') {
        numbersToAdd = tode4Permutations(number)
      } else if (selectedBetType === '3top' || selectedBetType === '3tode') {
        numbersToAdd = shuffle_num_3(number)
      } else if (selectedBetType === '2top' || selectedBetType === '2bottom') {
        numbersToAdd = shuffle_num_2(number)
      }
    }

    // Add all numbers to cart
    numbersToAdd.forEach(num => {
      // Check duplicate for each
      if (!checkDuplicate(num, selectedBetType, cart)) {
        addToCart({
          bet_type: selectedBetType,
          bet_type_label: config.label,
          number: num,
          amount: 0,
          payout_rate: rate.multiply,
          huayName: period?.huayName
        })
      }
    })

    if (numbersToAdd.length > 1) {
      toast.success(`เพิ่ม ${numbersToAdd.length} เลขลงตะกร้าแล้ว`)
    } else {
      toast.success(`เพิ่ม ${number} ลงตะกร้าแล้ว`)
    }
  }

  // Handle Add Multiple Numbers (from special options)
  const handleAddNumbers = (numbers: string[]) => {
    const rate = rates.find(r => r.bet_type === selectedBetType)
    if (!rate) return

    const config = BET_TYPES[selectedBetType]
    if (!config) return

    let addedCount = 0

    numbers.forEach(number => {
      if (!checkDuplicate(number, selectedBetType, cart)) {
        addToCart({
          bet_type: selectedBetType,
          bet_type_label: config.label,
          number,
          amount: 0,
          payout_rate: rate.multiply,
          huayName: period?.huayName
        })
        addedCount++
      }
    })

    if (addedCount > 0) {
      toast.success(`เพิ่ม ${addedCount} เลขลงตะกร้าแล้ว`)
    }
  }

  // Handle Bulk Price
  const handleApplyBulkPrice = (price: number) => {
    cart.forEach(item => {
      updateCartItem(item.id, { amount: price })
    })
    toast.success(`ใส่ราคา ${price} บาท ทุกรายการแล้ว`)
  }

  // Handle Submit
  const handleSubmit = () => {
    if (cart.length === 0) {
      toast.error('กรุณาเพิ่มรายการแทงก่อน')
      return
    }

    // Check all items have amount
    const hasEmptyAmount = cart.some(item => item.amount <= 0)
    if (hasEmptyAmount) {
      toast.error('กรุณาใส่ราคาให้ครบทุกรายการ')
      return
    }

    // Show confirmation
    setShowConfirmModal(true)
  }

  // Handle Confirm
  const handleConfirm = async (note: string) => {
    if (!periodId || !period) return

    setShowConfirmModal(false)
    setSubmitting(true)

    try {
      const response = await memberLotteryAPI.placeBulkBets({
        stockId: parseInt(periodId),
        bets: cart.map(item => ({
          betType: item.bet_type,
          number: item.number,
          amount: item.amount
        })),
        note: note
      })

      // Success
      setSuccessPoyId(response.poyId || 'N/A')
      setSuccessNote(note)
      setShowSuccessModal(true)
      clearCart() // ล้างตะกร้าหลังส่งสำเร็จ

      // Reload credit across the app
      reloadCredit()

      toast.success('แทงหวยสำเร็จ!')
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.response?.data?.message || 'แทงหวยไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Success Actions
  const handleViewHistory = () => {
    navigate('/member/lottery/history')
  }

  const handleBetAgain = () => {
    clearCart()
    setShowSuccessModal(false)
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-yellow-400 border-r-4 border-r-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!period) {
    return null
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0)
  const totalPotentialWin = cart.reduce((sum, item) => sum + item.potential_win, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ top: '50%', right: '10%', animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ bottom: '10%', left: '30%', animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-4 pb-24 lg:pb-4 relative z-10">
        {/* Header */}
        <div className="mb-4 backdrop-blur-md bg-white/10 rounded-xl p-3 border-2 border-white/20 shadow-2xl">
          <button
            onClick={() => navigate('/member/lottery')}
            className="flex items-center gap-2 text-white hover:text-yellow-400 mb-3 transition-colors text-sm font-semibold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
          >
            <FiArrowLeft className="text-base" />
            <span>กลับไปเลือกหวย</span>
          </button>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{period.huayName}</h1>
              <p className="text-yellow-300 text-base font-semibold">{period.periodName}</p>
              <CreditDisplay className="mt-2" size="lg" />
            </div>

            <div className="text-left md:text-right">
              <div className="flex items-center gap-2 text-yellow-300 mb-1">
                <FiClock className="text-lg animate-pulse" />
                <span className="text-base font-bold">
                  ปิดรับ: {new Date(period.closeTime).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="text-white/80 text-xs">
                {period.drawTime ? new Date(period.drawTime).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Betting Area */}
          <div className="lg:col-span-8 space-y-3">
            {/* Bet Type Selector */}
            <BetTypeSelector
              selectedBetTypes={selectedBetTypes}
              onToggle={toggleBetType}
              rates={rates}
            />

            {/* Special Number Options */}
            <SpecialNumberOptions
              selectedBetTypes={selectedBetTypes}
              onAddNumbers={handleAddNumbers}
              shuffleEnabled={shuffleEnabled}
              setShuffleEnabled={setShuffleEnabled}
            />

            {/* Input Mode Section */}
            <InputModeSection
              inputMode={inputMode}
              setInputMode={setInputMode}
              selectedBetTypes={selectedBetTypes}
              numberInput={numberInput}
              setNumberInput={setNumberInput}
              onAddNumber={handleAddNumber}
              cart={cart}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Cart Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-4">
            <CartSidebar
              cart={cart}
              onUpdateAmount={(id, amount) => updateCartItem(id, { amount })}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onUndoLast={lotteryState.undoLastAdd}
              onBulkPrice={() => setShowBulkPriceModal(true)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        </div>

        {/* Mobile Cart Button */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowMobileCart(true)}
            className="lg:hidden fixed bottom-4 right-4 z-40 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full px-6 py-4 shadow-2xl flex items-center gap-3 font-bold text-base animate-bounce"
          >
            <FiShoppingCart className="text-xl" />
            <span>รายการแทง ({cart.length})</span>
            <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm">
              {formatNumber(totalAmount)}฿
            </span>
          </button>
        )}

        {/* Mobile Cart Drawer */}
        {showMobileCart && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowMobileCart(false)}
            />

            {/* Drawer */}
            <div className="lg:hidden fixed inset-y-0 right-0 w-full sm:w-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 shadow-2xl overflow-y-auto p-4">
              <div className="h-full flex flex-col">
                {/* Close Button */}
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="self-end mb-2 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 shadow-lg"
                >
                  <FiX className="text-xl" />
                </button>

                {/* Cart Content */}
                <div className="flex-1 min-h-0">
                  <CartSidebar
                    cart={cart}
                    onUpdateAmount={(id, amount) => updateCartItem(id, { amount })}
                    onRemoveItem={removeFromCart}
                    onClearCart={clearCart}
                    onUndoLast={lotteryState.undoLastAdd}
                    onBulkPrice={() => setShowBulkPriceModal(true)}
                    onSubmit={() => {
                      handleSubmit()
                      setShowMobileCart(false)
                    }}
                    submitting={submitting}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <BulkPriceModal
        show={showBulkPriceModal}
        onClose={() => setShowBulkPriceModal(false)}
        onApply={handleApplyBulkPrice}
      />

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        cart={cart}
        periodName={period.periodName || ''}
        huayName={period.huayName || ''}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          clearCart()
        }}
        poyId={successPoyId}
        cart={cart}
        totalAmount={totalAmount}
        totalPotentialWin={totalPotentialWin}
        periodName={period.periodName || ''}
        huayName={period.huayName || ''}
        note={successNote}
        onViewHistory={handleViewHistory}
        onBetAgain={handleBetAgain}
      />
    </div>
  )
}

export default LotteryBetting
