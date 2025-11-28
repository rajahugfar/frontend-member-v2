import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Public API client (no auth required)
const publicClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface GameProvider {
  id: number
  product_name: string
  description: string
  category: string
  game_type: string
  image_path: string
  status: number
  is_featured: boolean
  order_no: number
}

export interface GameProviderResponse {
  success: boolean
  data: GameProvider[]
}

export const gameProviderAPI = {
  /**
   * Get game providers from database (using member endpoint like frontend-member)
   * @param featured - If true, only return featured providers
   */
  getProviders: async (featured?: boolean): Promise<GameProviderResponse> => {
    const url = featured
      ? '/member/providers?featured=true'
      : '/member/providers'
    const response = await publicClient.get<GameProviderResponse>(url)
    return response.data
  },

  /**
   * Get providers by category (using member endpoint like frontend-member)
   */
  getProvidersByCategory: async (category: string): Promise<GameProviderResponse> => {
    const url = category
      ? `/member/providers?category=${category}`
      : '/member/providers'

    const response = await publicClient.get<GameProviderResponse>(url)
    return response.data
  },
}

export default gameProviderAPI
