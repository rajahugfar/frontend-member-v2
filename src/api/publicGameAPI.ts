import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Public API client (no auth required)
const publicClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Game {
  id: string
  gameCode: string
  gameName: string
  gameNameTh?: string
  gameType: string
  provider: string
  imageUrl?: string
  thumbnailUrl?: string
  isActive: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface GameListResponse {
  games: Game[]
  total: number
  limit: number
  offset: number
}

export interface GameStats {
  total_games: number
  total_providers: number
  total_categories: number
  providers: string[]
  categories: string[]
  provider_counts: Record<string, number>
}

export const publicGameAPI = {
  // Get all games with pagination
  getGames: async (params?: {
    limit?: number
    offset?: number
    provider?: string
    type?: string
  }): Promise<GameListResponse> => {
    const response = await publicClient.get('/member/games/all', { params })
    return response.data.data
  },

  // Get game statistics
  getStats: async (): Promise<GameStats> => {
    const response = await publicClient.get('/member/games/stats')
    return response.data.data
  },

  // Get all unique providers
  getProviders: async (): Promise<string[]> => {
    const response = await publicClient.get('/member/games/providers')
    return response.data.data
  },

  // Get all unique categories
  getCategories: async (): Promise<string[]> => {
    const response = await publicClient.get('/member/games/categories')
    return response.data.data
  },

  // Get games by provider
  getGamesByProvider: async (
    provider: string,
    params?: { limit?: number; offset?: number }
  ): Promise<GameListResponse> => {
    const response = await publicClient.get('/member/games/all', {
      params: { ...params, provider },
    })
    return response.data.data
  },

  // Get games by type/category
  getGamesByType: async (
    type: string,
    params?: { limit?: number; offset?: number }
  ): Promise<GameListResponse> => {
    const response = await publicClient.get('/member/games/all', {
      params: { ...params, type },
    })
    return response.data.data
  },

  // Get AMB games by provider
  getAmbGamesByProvider: async (provider: string): Promise<GameListResponse> => {
    // Convert provider name to uppercase for AMB productId
    const productId = provider.toUpperCase()
    const response = await publicClient.get(`/member/games/amb/${productId}`)
    // AMB API returns { data: { games: [...], productId: "..." } }
    // Transform AMB game format to match our Game interface
    const ambData = response.data.data

    console.log('Raw AMB API response:', ambData)
    console.log('First raw game:', ambData.games?.[0])

    const transformedGames = (ambData.games || []).map((game: any) => ({
      id: game.code,
      gameCode: game.code,
      gameName: game.name,
      gameType: game.type,
      provider: provider,
      imageUrl: game.img,
      thumbnailUrl: game.img,
      isActive: true,
      isFeatured: false,
      displayOrder: game.rank,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))

    console.log('First transformed game:', transformedGames[0])

    return {
      games: transformedGames,
      total: transformedGames.length,
      limit: transformedGames.length,
      offset: 0
    }
  },
}
