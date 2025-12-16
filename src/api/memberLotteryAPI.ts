import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

// Member API Client
export const memberAPIClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}/member`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add member token from localStorage
memberAPIClient.interceptors.request.use(
  (config) => {
    // Try multiple token sources for compatibility
    const token = localStorage.getItem('memberToken') ||
                  localStorage.getItem('token') ||
                  JSON.parse(localStorage.getItem('member-storage') || '{}')?.state?.token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
memberAPIClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear all member tokens
      localStorage.removeItem('memberToken')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('member-storage')

      // Redirect to member login page
      window.location.replace('/member/login')
    }
    return Promise.reject(error)
  }
)

// ============================================
// TypeScript Interfaces
// ============================================

export interface AvailableLottery {
  id: string
  lottery_code: string
  lottery_name: string
  lottery_type: 'government' | 'stock' | 'yeekee'
  is_active: boolean
  allow_4d: boolean
  has_open_period: boolean
}

export interface OpenPeriod {
  id: string
  name?: string
  round?: string
  lotteryId: number
  huayCode: string
  huayName: string
  huayGroup: number
  periodName: string
  periodDate: string
  openTime: string
  closeTime: string
  resultTime: string
  drawTime?: string
  icon?: string
  status: 'OPEN'
  totalBetAmount: number
  totalPayoutAmount: number
  totalProfit: number
  createdAt: string
  updatedAt: string
  flagNextday?: boolean
}

export interface LotteryRate {
  id: string
  bet_type: string
  multiply: number
  min_bet: number
  max_bet: number
  max_per_number: number
  is_active: boolean
}

export interface HuayConfig {
  id: number
  huayId: number
  huayType: string
  optionType: string
  minPrice: number
  maxPrice: number
  multiply: number
  status: number
  default: number
  maxPricePerNum: number
  maxPricePerUser: number
  typeConfig: number
}

export interface PlaceBetRequest {
  period_id: string
  bet_type: string
  number: string
  amount: number
}

export interface PlaceBulkBetsRequest {
  stockId: number
  bets: {
    betType: string
    number: string
    amount: number
  }[]
  note: string
}

export interface PlaceBulkBetsResponse {
  poyId: string
  poyNumber: string
  totalBets: number
  totalPrice: number
}

export interface BetResponse {
  id: string
  period_id: string
  bet_type: string
  number: string
  amount: number
  payout_rate: number
  status: 'PENDING'
  created_at: string
}

export interface MyBet {
  id: string
  lottery_code: string
  lottery_name: string
  lottery_type: string
  period_id: string
  period_name: string
  period_date: string
  bet_type: string
  number: string
  amount: number
  payout_rate: number
  status: 'PENDING' | 'WIN' | 'LOSE' | 'CANCELLED'
  win_amount?: number
  result_3d_top?: string
  result_3d_bottom?: string
  result_2d_top?: string
  result_2d_bottom?: string
  result_4d?: string
  announced_at?: string
  created_at: string
  cancelled_at?: string
}

// Saved Poy Template Interfaces
export interface SavedPoyItem {
  id: string
  templateId: string
  betType: string
  number: string
  amount: number
  createdAt: string
}

export interface SavedPoyTemplate {
  id: string
  memberId: string
  name: string
  description?: string
  totalItems: number
  createdAt: string
  updatedAt: string
  items?: SavedPoyItem[]
}

export interface CreateTemplateRequest {
  name: string
  description?: string
  items: {
    betType: string
    number: string
    amount: number
  }[]
}

export interface UpdateTemplateRequest {
  name: string
  description?: string
  items: {
    betType: string
    number: string
    amount: number
  }[]
}

// ============================================
// Member Lottery API
// ============================================

export const memberLotteryAPI = {
  // Get available lotteries with open periods
  getAvailableLotteries: async (): Promise<AvailableLottery[]> => {
    const response = await memberAPIClient.get('/lottery/available')
    return response.data.data
  },

  // Get active lotteries from stock_master
  getOpenPeriods: async (lotteryCode?: string): Promise<OpenPeriod[]> => {
    const response = await memberAPIClient.get('/lottery/active', {
      params: {
        status: 'ACTIVE',
        limit: 100,
        ...(lotteryCode ? { lottery_code: lotteryCode } : {})
      }
    })

    // Transform response to match OpenPeriod interface
    const lotteries = response.data.data || []
    return lotteries.map((lottery: any) => {
      const mapped = {
        id: String(lottery.id),
        name: lottery.name,
        round: lottery.round,
        closeTime: lottery.closeTime,
        resultTime: lottery.resultTime,
        huayCode: lottery.huayCode,
        icon: lottery.icon,
        flagNextday: lottery.flagNextday ?? false,
        // Add computed fields for backward compatibility
        huayName: lottery.name,
        periodName: lottery.round || new Date(lottery.closeTime).toLocaleDateString('th-TH'),
        periodDate: lottery.resultTime,
        drawTime: lottery.resultTime,
        openTime: lottery.closeTime, // Use closeTime as placeholder
        status: 'OPEN' as const,
        lotteryId: lottery.id,
        huayGroup: 0,
        totalBetAmount: 0,
        totalPayoutAmount: 0,
        totalProfit: 0,
        createdAt: lottery.closeTime,
        updatedAt: lottery.closeTime
      }

      // Debug log for specific lotteries
      if (lottery.huayCode === 'DJIVIP' || lottery.huayCode === 'DJI') {
        console.log(`📦 API Mapping ${lottery.name}:`, {
          raw_flagNextday: lottery.flagNextday,
          mapped_flagNextday: mapped.flagNextday,
          closeTime: mapped.closeTime,
          huayCode: mapped.huayCode
        })
      }

      return mapped
    })
  },

  // Get lottery payout rates
  getLotteryRates: async (lotteryCode: string): Promise<LotteryRate[]> => {
    const response = await memberAPIClient.get(`/lottery/${lotteryCode}/rates`)
    return response.data.data
  },

  // Get lottery rules/detail
  getLotteryRules: async (lotteryCode: string): Promise<{ huayCode: string; huayName: string; detail: string }> => {
    const response = await memberAPIClient.get(`/lottery/${lotteryCode}/rules`)
    return response.data.data
  },

  // Get huay config by lottery ID (default configs only)
  getHuayConfig: async (lotteryId: number, type: number = 1): Promise<HuayConfig[]> => {
    const response = await memberAPIClient.get(`/lottery/${lotteryId}/huay-config`, {
      params: { type }
    })
    return response.data.data || []
  },

  // Place single bet
  placeBet: async (data: PlaceBetRequest): Promise<BetResponse> => {
    const response = await memberAPIClient.post('/lottery/bet', data)
    return response.data.data
  },

  // Place multiple bets at once with poy
  placeBulkBets: async (request: PlaceBulkBetsRequest): Promise<PlaceBulkBetsResponse> => {
    const response = await memberAPIClient.post('/lottery/bet/bulk', request)
    return response.data.data
  },

  // Get my betting history
  getMyBets: async (params?: {
    lottery_code?: string
    period_id?: string
    status?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<{ bets: MyBet[]; total: number }> => {
    const response = await memberAPIClient.get('/lottery/my-bets', { params })
    return response.data.data
  },

  // Cancel bet (only if period still OPEN)
  cancelBet: async (id: string): Promise<{ message: string }> => {
    const response = await memberAPIClient.post(`/lottery/bet/${id}/cancel`)
    return response.data.data
  },

  // Get poy history
  getPoyHistory: async (params?: {
    limit?: number
    offset?: number
  }): Promise<any[]> => {
    const response = await memberAPIClient.get('/lottery/history', { params })
    return response.data.data.poys || []
  },

  // Cancel poy
  cancelPoy: async (poyId: string): Promise<{ message: string }> => {
    const response = await memberAPIClient.post(`/lottery/poy/${poyId}/cancel`)
    return response.data.data
  },

  // Get poy detail
  getPoyDetail: async (poyId: string): Promise<any> => {
    const response = await memberAPIClient.get(`/lottery/poy/${poyId}`)
    return response.data.data
  },

  // ============================================
  // Saved Poy Templates
  // ============================================

  // Get all saved templates
  getSavedTemplates: async (): Promise<SavedPoyTemplate[]> => {
    const response = await memberAPIClient.get('/lottery/templates')
    return response.data.data || []
  },

  // Get single template with items
  getSavedTemplate: async (id: string): Promise<SavedPoyTemplate> => {
    const response = await memberAPIClient.get(`/lottery/templates/${id}`)
    return response.data.data
  },

  // Create new template
  createSavedTemplate: async (data: CreateTemplateRequest): Promise<SavedPoyTemplate> => {
    const response = await memberAPIClient.post('/lottery/templates', data)
    return response.data.data
  },

  // Update template
  updateSavedTemplate: async (id: string, data: UpdateTemplateRequest): Promise<SavedPoyTemplate> => {
    const response = await memberAPIClient.put(`/lottery/templates/${id}`, data)
    return response.data.data
  },

  // Delete template
  deleteSavedTemplate: async (id: string): Promise<{ message: string }> => {
    const response = await memberAPIClient.delete(`/lottery/templates/${id}`)
    return response.data
  },
}

export default memberLotteryAPI
