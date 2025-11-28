import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Authenticated API client
const authClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('memberToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle 401 errors
authClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // If 401 Unauthorized, redirect to landing page
    if (error.response && error.response.status === 401) {
      // Prevent multiple redirects
      if (!sessionStorage.getItem('redirecting')) {
        sessionStorage.setItem('redirecting', 'true')

        // Clear auth data
        localStorage.removeItem('memberToken')
        localStorage.removeItem('memberId')
        localStorage.removeItem('memberProfile')
        localStorage.removeItem('member-storage')

        // Redirect to login page
        setTimeout(() => {
          sessionStorage.removeItem('redirecting')
          window.location.href = '/member/login'
        }, 100)
      }
    }

    return Promise.reject(error)
  }
)

export interface AMBGame {
  name: string      // Game name
  category: string  // Category (e.g., "EGAMES")
  type: string      // Game type (e.g., "SLOT")
  code: string      // Game code (e.g., "KYS-H5-99999")
  img: string       // Image URL
  rank: number      // Display rank/order
}

export interface AMBGameListResponse {
  success: boolean
  data: {
    productId?: string
    games: AMBGame[]
    total?: number
  }
}

export interface AMBLaunchGameResponse {
  success: boolean
  data: {
    gameUrl: string
    token: string
  }
  message?: string
}

export interface AMBProvider {
  productCode: string
  productName: string
  category: string
}

export interface AMBCategory {
  code: string
  name: string
}

export const ambGameAPI = {
  /**
   * Get games by provider (productId)
   */
  getGamesByProvider: async (provider: string): Promise<AMBGameListResponse> => {
    const response = await authClient.get<AMBGameListResponse>(
      `/member/games/amb/${provider}`
    )
    return response.data
  },

  /**
   * Get games by category
   */
  getGamesByCategory: async (category: string): Promise<AMBGameListResponse> => {
    const response = await authClient.get<AMBGameListResponse>(
      `/member/games/amb/category/${category}`
    )
    return response.data
  },

  /**
   * Launch game
   */
  launchGame: async (gameCode: string, provider: string): Promise<AMBLaunchGameResponse> => {
    const response = await authClient.post<AMBLaunchGameResponse>(
      '/member/games/amb/launch',
      {
        gameCode,
        provider,
        platform: 'desktop',
        language: 'th',
      }
    )
    return response.data
  },

  /**
   * Get all providers
   */
  getProviders: async (): Promise<{ success: boolean; data: AMBProvider[] }> => {
    const response = await authClient.get('/member/games/amb/providers')
    return response.data
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<{ success: boolean; data: AMBCategory[] }> => {
    const response = await authClient.get('/member/games/amb/categories')
    return response.data
  },
}

export default ambGameAPI
