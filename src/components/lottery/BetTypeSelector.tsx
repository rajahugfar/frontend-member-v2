import React from 'react'
import { FaDice } from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import { BET_TYPES } from '@/utils/lotteryHelpers'
import { LotteryRate } from '@api/memberLotteryAPI'

interface BetTypeSelectorProps {
  selectedBetTypes: string[]
  onToggle: (betType: string) => void
  rates: LotteryRate[]
  disabled?: boolean
}

// Define paired bet types for grouping
const BET_TYPE_GROUPS = [
  { main: 'teng_bon_4', tode: 'tode_4' },
  { main: 'teng_bon_3', tode: 'tode_3' },
  { main: 'teng_lang_3', tode: null },
  { main: 'teng_bon_2', tode: null },
  { main: 'teng_lang_2', tode: null },
  { main: 'teng_bon_1', tode: null },
  { main: 'teng_lang_1', tode: null },
]

const BetTypeSelector: React.FC<BetTypeSelectorProps> = ({
  selectedBetTypes,
  onToggle,
  rates,
  disabled = false
}) => {
  // Update bet type configs with actual rates from API
  const betTypeConfigs = Object.values(BET_TYPES).map(config => {
    const rate = rates.find(r => r.bet_type === config.id)
    if (rate) {
      return {
        ...config,
        multiply: rate.multiply,
        min: rate.min_bet,
        max: rate.max_bet
      }
    }
    return config
  })

  // Filter out bet types that don't have rates (disabled lottery types)
  const availableBetTypes = betTypeConfigs.filter(config =>
    rates.some(r => r.bet_type === config.id)
  )

  // Get all available bet type IDs
  const availableIds = availableBetTypes.map(c => c.id)

  // Build display list - show all available types in order
  const displayTypes: string[] = []
  BET_TYPE_GROUPS.forEach(group => {
    if (availableIds.includes(group.main)) {
      displayTypes.push(group.main)
    }
    if (group.tode && availableIds.includes(group.tode)) {
      displayTypes.push(group.tode)
    }
  })

  const selectedConfigs = availableBetTypes.filter(c => selectedBetTypes.includes(c.id))

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 border-2 border-white/20 shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <FaDice className="text-yellow-400 text-sm" />
        <h2 className="text-sm font-bold text-white">ประเภทการแทง</h2>
        {selectedConfigs.length > 1 && (
          <span className="text-yellow-300 text-xs ml-auto">
            เลือก {selectedConfigs.length} ประเภท
          </span>
        )}
      </div>

      {/* Bet Type Pills - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {displayTypes.map(typeId => {
          const config = availableBetTypes.find(c => c.id === typeId)
          if (!config) return null

          const isActive = selectedBetTypes.includes(config.id)
          const isDisabled = disabled

          return (
            <button
              key={config.id}
              onClick={() => !isDisabled && onToggle(config.id)}
              disabled={isDisabled}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-sm transition-all border-2
                ${isActive
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 text-white shadow-lg'
                  : 'bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50 hover:border-yellow-400/50'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-1">
                <span>{config.label}</span>
                {isActive && <FiCheck className="text-xs" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Compact Info - Show config from huay_config for selected types */}
      {selectedConfigs.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
          {selectedConfigs.map(config => (
            <div key={config.id} className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-left">
                <div className="text-yellow-400 font-bold">{config.label}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 mb-0.5">ต่ำสุด</div>
                <div className="text-yellow-400 font-bold">{config.min}฿</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 mb-0.5">สูงสุด</div>
                <div className="text-yellow-400 font-bold">{config.max.toLocaleString()}฿</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 mb-0.5">จ่าย</div>
                <div className="text-green-400 font-bold">{config.multiply.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BetTypeSelector
