import React from 'react'
import { FiShoppingCart, FiTrash2, FiEdit, FiCornerUpLeft, FiSave, FiX } from 'react-icons/fi'
import { FaCheck } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { CartItem } from '@/hooks/useLotteryState'
import { BET_TYPES, formatNumber } from '@/utils/lotteryHelpers'
import { useTranslation } from 'react-i18next'

interface CartSidebarProps {
  cart: CartItem[]
  onUpdateAmount: (id: string, amount: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onUndoLast: () => void
  onBulkPrice: () => void
  onSubmit: () => void
  onSaveTemplate?: () => void
  submitting?: boolean
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  onUpdateAmount,
  onRemoveItem,
  onClearCart,
  onUndoLast,
  onBulkPrice,
  onSubmit,
  onSaveTemplate,
  submitting = false
}) => {
  const { t } = useTranslation()
  const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0)
  const totalPotentialWin = cart.reduce((sum, item) => sum + item.potential_win, 0)

  // Helper function to get bet type category label
  const getBetTypeCategory = (betType: string): string => {
    const config = BET_TYPES[betType]
    if (!config) return 'อื่นๆ'

    switch (config.digitCount) {
      case 1:
        return 'หวยวิ่ง (1 ตัว)'
      case 2:
        return 'หวยสองตัว'
      case 3:
        return 'หวยสามตัว'
      case 4:
        return 'หวยสี่ตัว'
      default:
        return 'อื่นๆ'
    }
  }

  // Helper function to get remaining amount color based on percentage
  const getRemainingColor = (remaining: number, max: number): string => {
    if (remaining === 0) return 'text-gray-400' // Sold out
    const percentage = (remaining / max) * 100
    if (percentage > 50) return 'text-green-400' // Plenty
    if (percentage >= 20) return 'text-orange-400' // Low
    return 'text-red-400' // Very low
  }

  // Check if item is sold out
  const isSoldOut = (item: CartItem): boolean => {
    return item.isSpecialNumber === true && item.remainingAmount === 0 && item.checkResult === 99
  }

  // Check if item exceeds remaining limit
  const exceedsLimit = (item: CartItem): boolean => {
    if (item.isSpecialNumber && item.remainingAmount !== undefined) {
      return item.amount > item.remainingAmount
    }
    return false
  }

  // Group cart items by bet type category (digit count)
  const groupedCart = cart.reduce((groups, item) => {
    const category = getBetTypeCategory(item.bet_type)
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {} as Record<string, CartItem[]>)

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl border-2 border-white/20 shadow-2xl p-2 lg:sticky lg:top-6 h-full flex flex-col max-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <FiShoppingCart className="text-yellow-400 text-base" />
          <h2 className="text-sm font-bold text-white">รายการแทง</h2>
          {cart.length > 0 && (
            <span className="bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded-full text-[10px]">
              {cart.length}
            </span>
          )}
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onUndoLast}
              className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 hover:bg-yellow-500/20 rounded"
              title="ยกเลิกรายการสุดท้าย"
            >
              <FiCornerUpLeft className="text-sm" />
            </button>
            {onSaveTemplate && (
              <button
                type="button"
                onClick={onSaveTemplate}
                className="text-green-400 hover:text-green-300 transition-colors p-1 hover:bg-green-500/20 rounded"
                title="บันทึกโพย"
              >
                <FiSave className="text-sm" />
              </button>
            )}
            <button
              type="button"
              onClick={onClearCart}
              className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/20 rounded"
              title="ล้างทั้งหมด"
            >
              <FiTrash2 className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {cart.length > 0 && (
        <div className="mb-1.5">
          <button
            onClick={onBulkPrice}
            className="w-full py-1.5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <FiEdit className="text-xs" /> ใส่ราคาทั้งหมด
          </button>
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar mb-2 min-h-0">
        {cart.length === 0 ? (
          <div className="text-center py-6">
            <FiShoppingCart className="text-4xl text-white/20 mx-auto mb-2" />
            <p className="text-white/50 text-xs">ยังไม่มีรายการแทง</p>
          </div>
        ) : (
          <AnimatePresence>
            {Object.entries(groupedCart).map(([category, items]) => (
              <div key={category} className="space-y-0.5">
                {/* Category Header */}
                <div className="sticky top-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded-md px-1.5 py-0.5 z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-xs">{category}</h3>
                    <span className="text-white/70 text-[10px]">{items.length} รายการ</span>
                  </div>
                </div>

                {/* Items in this category */}
                {items.map((item) => {
                  const config = BET_TYPES[item.bet_type]

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`
                        bg-gradient-to-r from-white/10 to-white/5 rounded-md p-1.5 border transition-all
                        ${item.is_duplicate ? 'border-yellow-400/50' : 'border-white/10'}
                        ${isSoldOut(item) ? 'opacity-60 bg-gray-800/30' : 'hover:border-yellow-400/70 hover:bg-white/15'}
                      `}
                    >
                      <div className="flex items-center gap-1.5">
                        {/* Number and Type */}
                        <div className="flex-shrink-0 w-16">
                          <div className="text-base font-bold text-yellow-300 font-mono text-center">
                            {item.number}
                          </div>
                          <div className="text-[9px] text-white/60 text-center leading-none">
                            {item.bet_type_label}
                          </div>
                          {/* Special Number Badge */}
                          {item.isSpecialNumber && (
                            <div className="mt-0.5">
                              <span className="inline-block bg-purple-600 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                                หวยอั๋น
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Amount Input */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="number"
                            value={item.amount || ''}
                            onChange={(e) => {
                              const inputValue = parseFloat(e.target.value) || 0
                              // Check if item has special number limit
                              if (item.isSpecialNumber && item.remainingAmount !== undefined) {
                                // Don't allow amount greater than remaining
                                if (inputValue > item.remainingAmount) {
                                  onUpdateAmount(item.id, item.remainingAmount)
                                  return
                                }
                              }
                              onUpdateAmount(item.id, inputValue)
                            }}
                            className={`w-full px-1.5 py-1 bg-white/10 border border-white/20 rounded text-white font-bold text-xs focus:outline-none focus:border-yellow-400 transition-colors ${isSoldOut(item) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="0"
                            min={config?.min || 1}
                            max={item.isSpecialNumber && item.remainingAmount !== undefined ? item.remainingAmount : (config?.max || 1000)}
                            disabled={isSoldOut(item)}
                          />

                          {/* Special Number Info */}
                          {item.isSpecialNumber && (
                            <div className="mt-0.5">
                              {isSoldOut(item) && (
                                <div className="text-[8px] text-red-400 font-bold">
                                  ขายหมดแล้ว
                                </div>
                              )}
                              {/* Warning when amount exceeds remaining */}
                              {!isSoldOut(item) && item.amount > (item.remainingAmount || 0) && (
                                <div className="text-[8px] text-red-400 font-bold animate-pulse">
                                  ⚠ กรอกเกินลิมิต!
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Win Amount */}
                        <div className="flex-shrink-0 w-14 text-right">
                          <div className="text-green-400 font-bold text-[10px] leading-tight">
                            {item.potential_win > 0 ? formatNumber(item.potential_win) : '-'}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="flex-shrink-0 text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-all"
                          title={t("common:buttons.delete")}
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-lg p-1.5 mb-1.5 border border-gray-600">
            <div className="flex justify-between items-center text-white mb-0.5">
              <span className="font-semibold text-xs">ยอดรวม:</span>
              <span className="text-base font-bold text-yellow-300">
                {formatNumber(totalAmount)} ฿
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/80">
              <span>ถูกทุกรายการ:</span>
              <span className="text-xs font-bold text-green-400">
                {formatNumber(totalPotentialWin)} ฿
              </span>
            </div>
          </div>

          {/* Daily Limit Info */}
          <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-1.5 mb-1.5">
            <p className="text-blue-300 text-[10px] text-center leading-tight">
              <span className="font-semibold">📊 วงเงินแทงรายวัน:</span> ไม่เกิน 500,000 บาท/หวย/วัน
            </p>
          </div>

          {/* Sold Out Warning */}
          {cart.some(item => isSoldOut(item)) && (
            <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-1.5 mb-1.5">
              <p className="text-red-400 text-[10px] font-semibold text-center">
                มีเลขที่ขายหมดในตะกร้า กรุณาลบออกก่อนทำการแทง
              </p>
            </div>
          )}

          {/* Exceeds Limit Warning */}
          {cart.some(item => exceedsLimit(item)) && (
            <div className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-1.5 mb-1.5">
              <p className="text-orange-400 text-[10px] font-semibold text-center">
                มีเลขที่กรอกเกินลิมิต กรุณาแก้ไขก่อนทำการแทง
              </p>
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            onClick={onSubmit}
            disabled={submitting || cart.some(item => isSoldOut(item)) || cart.some(item => exceedsLimit(item))}
            whileHover={!submitting && !cart.some(item => isSoldOut(item)) && !cart.some(item => exceedsLimit(item)) ? { scale: 1.02 } : {}}
            whileTap={!submitting && !cart.some(item => isSoldOut(item)) && !cart.some(item => exceedsLimit(item)) ? { scale: 0.98 } : {}}
            className="w-full py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white"></div>
                <span className="text-xs">กำลังส่งโพย...</span>
              </>
            ) : cart.some(item => isSoldOut(item)) ? (
              <>
                <FiX className="text-sm" />
                <span className="text-xs">มีเลขขายหมด</span>
              </>
            ) : cart.some(item => exceedsLimit(item)) ? (
              <>
                <FiX className="text-sm" />
                <span className="text-xs">กรอกเกินลิมิต</span>
              </>
            ) : (
              <>
                <FaCheck className="text-sm" />
                ยืนยันการแทง
              </>
            )}
          </motion.button>
        </>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
}

export default CartSidebar
