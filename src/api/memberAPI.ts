import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const memberAPI = axios.create({
  baseURL: `${API_URL}/api/v1/member`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor to add JWT
memberAPI.interceptors.request.use(config => {
  const token = localStorage.getItem('memberToken')

  console.log('[Member API] Request:', config.method?.toUpperCase(), config.url)
  console.log('[Member API] Token:', token ? token.substring(0, 50) + '...' : 'NOT FOUND')
  console.log('[Member API] Authorization header will be:', token ? `Bearer ${token.substring(0, 50)}...` : 'NOT SET')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, error => {
  return Promise.reject(error)
})

// Interceptor for 401 redirect - DISABLED FOR DEBUGGING
memberAPI.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      console.error('[Member API] 401 Unauthorized - Token:', localStorage.getItem('memberToken') ? 'EXISTS' : 'NOT FOUND')
      // COMMENTED OUT FOR DEBUGGING
      // localStorage.removeItem('memberToken')
      // localStorage.removeItem('memberId')
      // localStorage.removeItem('memberProfile')
      // localStorage.removeItem('member-storage')
      // window.location.href = '/member/login'
    }
    return Promise.reject(err)
  }
)

// Authentication APIs
export const authAPI = {
  login: (phone: string, password: string) =>
    memberAPI.post('/auth/login', { phone, password }),
  register: (data: RegisterData) =>
    memberAPI.post('/auth/register', data),
  logout: () =>
    memberAPI.post('/auth/logout'),
  forgotPassword: (phone: string) =>
    memberAPI.post('/auth/forgot-password', { phone }),
  verifyOTP: (phone: string, otp: string) =>
    memberAPI.post('/auth/verify-otp', { phone, otp }),
  resetPassword: (phone: string, otp: string, newPassword: string) =>
    memberAPI.post('/auth/reset-password', { phone, otp, newPassword }),
}

// Profile APIs
export const profileAPI = {
  getProfile: () =>
    memberAPI.get('/profile'),
  updateProfile: (data: UpdateProfileData) =>
    memberAPI.put('/profile', data),
  changePassword: (data: ChangePasswordData) =>
    memberAPI.post('/change-password', data),
  getBankAccounts: () =>
    memberAPI.get('/bank-accounts'),
  addBankAccount: (data: BankAccountData) =>
    memberAPI.post('/bank-accounts', data),
  updateBankAccount: (id: number, data: BankAccountData) =>
    memberAPI.put(`/bank-accounts/${id}`, data),
  deleteBankAccount: (id: number) =>
    memberAPI.delete(`/bank-accounts/${id}`),
  setPrimaryBankAccount: (id: number) =>
    memberAPI.put(`/bank-accounts/${id}/set-primary`),
}

// Transaction APIs
export const transactionAPI = {
  getDashboardSummary: () =>
    memberAPI.get('/dashboard/summary'),
  getRecentTransactions: (limit: number = 5) =>
    memberAPI.get(`/transactions/recent?limit=${limit}`),
  getAllTransactions: (params: TransactionParams) =>
    memberAPI.get('/transactions', { params }),
  getTransactionById: (id: number) =>
    memberAPI.get(`/transactions/${id}`),
}

// Deposit APIs
export const depositAPI = {
  requestDeposit: (formData: FormData) =>
    memberAPI.post('/deposits', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  createDepositQR: (data: { amount: number, bankCode: string, serviceId: string, redirectUrl?: string }) =>
    memberAPI.post('/deposits/create-qr', data),
  getCompanyBanks: () =>
    memberAPI.get('/bank-accounts'),
  getDeposits: (params: DepositParams) =>
    memberAPI.get('/deposits', { params }),
  getDepositById: (id: number) =>
    memberAPI.get(`/deposits/${id}`),
  cancelDeposit: (id: number) =>
    memberAPI.post(`/deposits/${id}/cancel`),
}

// Withdrawal APIs
export const withdrawalAPI = {
  requestWithdrawal: (data: WithdrawalRequestData) =>
    memberAPI.post('/withdrawal/request', data),
  getWithdrawals: (params: WithdrawalParams) =>
    memberAPI.get('/withdrawals', { params }),
  getWithdrawalById: (id: number) =>
    memberAPI.get(`/withdrawals/${id}`),
  cancelWithdrawal: (id: number) =>
    memberAPI.post(`/withdrawals/${id}/cancel`),
}

// Game APIs
export const gameAPI = {
  getGames: (params: GameParams) =>
    memberAPI.get('/games', { params }),
  getGameCategories: () =>
    memberAPI.get('/games/categories'),
  playGame: (gameCode: string, platform: string = 'desktop') =>
    memberAPI.post('/games/launch', {
      gameCode,
      platform,
      language: 'th'
    }),
  playAmbGame: (gameCode: string, provider: string, platform: string = 'desktop') =>
    memberAPI.post('/games/amb/launch', {
      gameCode,
      provider,
      platform,
      language: 'th'
    }),
  getDemoGame: (gameCode: string) =>
    memberAPI.post(`/games/demo/${gameCode}`),
  transfer: (data: TransferData) =>
    memberAPI.post('/games/transfer', data),
  getBalance: () =>
    memberAPI.get('/games/balance'),
}

// Promotion APIs
export const promotionAPI = {
  getPromotions: (category?: string) =>
    memberAPI.get('/promotions', { params: { category } }),
  getPromotionById: (id: number) =>
    memberAPI.get(`/promotions/${id}`),
  claimPromotion: (id: number, code?: string) =>
    memberAPI.post(`/promotions/${id}/claim`, { code }),
  getBonuses: (params: BonusParams) =>
    memberAPI.get('/bonuses', { params }),
}

// Lottery APIs
export const lotteryAPI = {
  getLotteries: (params?: any) =>
    memberAPI.get('/lottery/active', { params }),
  getLotteryById: (id: number) =>
    memberAPI.get(`/lotteries/${id}`),
  placeBet: (data: LotteryBetData) =>
    memberAPI.post('/lottery/bet', data),
  getBets: (params: LotteryBetParams) =>
    memberAPI.get('/lottery/bets', { params }),
  getBetById: (id: number) =>
    memberAPI.get(`/lottery/bets/${id}`),
  getResults: (params?: any) =>
    memberAPI.get('/lottery/results', { params }),
  cancelBet: (id: number) =>
    memberAPI.post(`/lottery/bets/${id}/cancel`),
}

// Notification APIs
export const notificationAPI = {
  getNotifications: (params?: { limit?: number; offset?: number }) =>
    memberAPI.get('/notifications', { params }),
  markAsRead: (id: number) =>
    memberAPI.put(`/notifications/${id}/read`),
  markAllAsRead: () =>
    memberAPI.put('/notifications/read-all'),
  getUnreadCount: () =>
    memberAPI.get('/notifications/unread-count'),
}

// Affiliate APIs
export const affiliateAPI = {
  getStats: () =>
    memberAPI.get('/affiliate/stats'),
  getMembers: (params?: { limit?: number; offset?: number }) =>
    memberAPI.get('/affiliate/members', { params }),
  getCommissions: (params?: { limit?: number; offset?: number }) =>
    memberAPI.get('/affiliate/commissions', { params }),
  withdrawCommission: (amount: number) =>
    memberAPI.post('/affiliate/withdraw', { amount }),
}

// Types
export interface RegisterData {
  phone: string
  password: string
  confirmPassword: string
  fullName: string
  bankName: string
  bankAccountNumber: string
  lineId?: string
  agreeToTerms: boolean
}

export interface UpdateProfileData {
  fullName?: string
  lineId?: string
  email?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface BankAccountData {
  bankName: string
  accountNumber: string
  accountName: string
  isPrimary?: boolean
}

export interface TransactionParams {
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'BONUS' | 'TRANSFER' | 'REFUND'
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface DepositParams {
  status?: 'PENDING' | 'SUCCESS' | 'REJECTED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface WithdrawalParams {
  status?: 'PENDING' | 'SUCCESS' | 'REJECTED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface WithdrawalRequestData {
  bankAccountId: number
  amount: number
  otp?: string
}

export interface GameParams {
  type?: 'SLOT' | 'CASINO' | 'SPORT' | 'FISHING' | 'ARCADE'
  search?: string
  limit?: number
  offset?: number
  sort?: 'popular' | 'new' | 'name'
}

export interface TransferData {
  amount: number
  direction: 'IN' | 'OUT'
  provider?: string
}

export interface BonusParams {
  status?: 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface LotteryBetData {
  lotteryId: number
  bets: Array<{
    type: string
    number: string
    amount: number
    position?: string
  }>
  totalAmount: number
}

export interface LotteryBetParams {
  lotteryId?: number
  status?: 'PENDING' | 'WIN' | 'LOSE' | 'CANCELLED'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export default memberAPI
