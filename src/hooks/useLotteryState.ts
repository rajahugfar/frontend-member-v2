import { useState, useEffect, useCallback } from 'react'

/**
 * Cart Item Interface
 */
export interface CartItem {
  id: string
  bet_type: string
  bet_type_label: string
  number: string
  amount: number
  payout_rate: number
  potential_win: number
  last_add_num?: number
  is_duplicate?: boolean
  huayName?: string
  // Special number tracking fields
  isSpecialNumber?: boolean
  remainingAmount?: number
  maxSaleAmount?: number
  soldAmount?: number
  checkResult?: string
}

/**
 * Lottery State Interface
 */
export interface LotteryState {
  // Bet Selection
  selectedBetType: string
  setSelectedBetType: (type: string) => void

  // Input Mode
  inputMode: 'keyboard' | 'grid'
  setInputMode: (mode: 'keyboard' | 'grid') => void

  // Number Input
  numberInput: string
  setNumberInput: (input: string) => void

  // Cart Management
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'id' | 'potential_win'>) => void
  updateCartItem: (id: string, updates: Partial<CartItem>) => void
  removeFromCart: (id: string) => void
  clearCart: () => void

  // Special Options
  shuffleEnabled: boolean
  setShuffleEnabled: (enabled: boolean) => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Modals
  showBulkPriceModal: boolean
  setShowBulkPriceModal: (show: boolean) => void
  showConfirmModal: boolean
  setShowConfirmModal: (show: boolean) => void
  showSuccessModal: boolean
  setShowSuccessModal: (show: boolean) => void

  // Last Action
  lastAddNum: number
  undoLastAdd: () => void
}

/**
 * LocalStorage Keys
 */
const STORAGE_KEY_CART = 'lottery_cart'
const STORAGE_KEY_BET_TYPE = 'lottery_bet_type'
const STORAGE_KEY_INPUT_MODE = 'lottery_input_mode'

/**
 * Custom Hook for Lottery State Management
 * จัดการ State ทั้งหมดของระบบแทงหวย
 */
export function useLotteryState(periodId?: string): LotteryState {
  // ==================== State ====================

  // Bet Selection
  const [selectedBetType, setSelectedBetTypeState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'teng_bon_3'
    return localStorage.getItem(STORAGE_KEY_BET_TYPE) || 'teng_bon_3'
  })

  // Input Mode
  const [inputMode, setInputModeState] = useState<'keyboard' | 'grid'>(() => {
    if (typeof window === 'undefined') return 'keyboard'
    return (localStorage.getItem(STORAGE_KEY_INPUT_MODE) as 'keyboard' | 'grid') || 'keyboard'
  })

  // Number Input
  const [numberInput, setNumberInput] = useState<string>('')

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_CART}_${periodId}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Special Options
  const [shuffleEnabled, setShuffleEnabled] = useState(false)

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Last Action
  const [lastAddNum, setLastAddNum] = useState(0)

  // ==================== Effects ====================

  // Sync cart to localStorage
  useEffect(() => {
    if (periodId) {
      localStorage.setItem(`${STORAGE_KEY_CART}_${periodId}`, JSON.stringify(cart))
    }
  }, [cart, periodId])

  // Sync bet type to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BET_TYPE, selectedBetType)
  }, [selectedBetType])

  // Sync input mode to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INPUT_MODE, inputMode)
  }, [inputMode])

  // Clear number input when bet type changes
  useEffect(() => {
    setNumberInput('')
  }, [selectedBetType])

  // ==================== Cart Functions ====================

  /**
   * Add item to cart
   */
  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'potential_win'>) => {
    const newLastAddNum = lastAddNum + 1

    const newItem: CartItem = {
      ...item,
      id: `${item.bet_type}-${item.number}-${Date.now()}`,
      potential_win: item.amount * item.payout_rate,
      last_add_num: newLastAddNum,
      is_duplicate: false
    }

    setCart(prev => {
      // Check for duplicates
      const hasDuplicate = prev.some(
        cartItem => cartItem.number === newItem.number && cartItem.bet_type === newItem.bet_type
      )

      if (hasDuplicate) {
        // Mark as duplicate
        return prev.map(cartItem => {
          if (cartItem.number === newItem.number && cartItem.bet_type === newItem.bet_type) {
            return { ...cartItem, is_duplicate: true }
          }
          return cartItem
        })
      }

      return [...prev, newItem]
    })

    setLastAddNum(newLastAddNum)
  }, [lastAddNum])

  /**
   * Update cart item
   */
  const updateCartItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates }
        // Recalculate potential win if amount or payout_rate changed
        if (updates.amount !== undefined || updates.payout_rate !== undefined) {
          updated.potential_win = updated.amount * updated.payout_rate
        }
        return updated
      }
      return item
    }))
  }, [])

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const filtered = prev.filter(item => item.id !== id)

      // Re-check duplicates after removal
      const numberCounts = new Map<string, number>()
      filtered.forEach(item => {
        const key = `${item.bet_type}-${item.number}`
        numberCounts.set(key, (numberCounts.get(key) || 0) + 1)
      })

      return filtered.map(item => {
        const key = `${item.bet_type}-${item.number}`
        return {
          ...item,
          is_duplicate: (numberCounts.get(key) || 0) > 1
        }
      })
    })
  }, [])

  /**
   * Clear all cart items
   */
  const clearCart = useCallback(() => {
    setCart([])
    setLastAddNum(0)
    setNumberInput('')
  }, [])

  /**
   * Undo last added item
   */
  const undoLastAdd = useCallback(() => {
    if (lastAddNum === 0) return

    setCart(prev => {
      const filtered = prev.filter(item => item.last_add_num !== lastAddNum)

      // Re-check duplicates
      const numberCounts = new Map<string, number>()
      filtered.forEach(item => {
        const key = `${item.bet_type}-${item.number}`
        numberCounts.set(key, (numberCounts.get(key) || 0) + 1)
      })

      return filtered.map(item => {
        const key = `${item.bet_type}-${item.number}`
        return {
          ...item,
          is_duplicate: (numberCounts.get(key) || 0) > 1
        }
      })
    })

    setLastAddNum(prev => Math.max(0, prev - 1))
  }, [lastAddNum])

  /**
   * Set selected bet type with validation
   */
  const setSelectedBetType = useCallback((type: string) => {
    setSelectedBetTypeState(type)
    setShuffleEnabled(false) // Reset shuffle when changing bet type
  }, [])

  /**
   * Set input mode
   */
  const setInputMode = useCallback((mode: 'keyboard' | 'grid') => {
    setInputModeState(mode)
    setNumberInput('') // Clear input when switching mode
  }, [])

  // ==================== Return ====================

  return {
    // Bet Selection
    selectedBetType,
    setSelectedBetType,

    // Input Mode
    inputMode,
    setInputMode,

    // Number Input
    numberInput,
    setNumberInput,

    // Cart Management
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,

    // Special Options
    shuffleEnabled,
    setShuffleEnabled,

    // Search
    searchQuery,
    setSearchQuery,

    // Modals
    showBulkPriceModal,
    setShowBulkPriceModal,
    showConfirmModal,
    setShowConfirmModal,
    showSuccessModal,
    setShowSuccessModal,

    // Last Action
    lastAddNum,
    undoLastAdd,
  }
}
