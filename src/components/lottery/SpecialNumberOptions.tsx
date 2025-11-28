import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { FaMagic } from 'react-icons/fa'
import {
  gen_19,
  gen_2_ble,
  rood_nha,
  rood_lung,
  gen_2_low,
  gen_2_high,
  gen_2_even,
  gen_2_odd,
} from '@/utils/lotteryHelpers'

interface SpecialNumberOptionsProps {
  selectedBetTypes: string[]
  onAddNumbers: (numbers: string[]) => void
  shuffleEnabled: boolean
  setShuffleEnabled: (enabled: boolean) => void
}

const SpecialNumberOptions: React.FC<SpecialNumberOptionsProps> = ({
  selectedBetTypes,
  onAddNumbers,
  shuffleEnabled,
  setShuffleEnabled
}) => {
  const [showInputModal, setShowInputModal] = useState(false)
  const [inputModalType, setInputModalType] = useState<'19' | 'rood_nha' | 'rood_lung'>('19')
  const [inputValue, setInputValue] = useState('')

  // Show only for 2-digit bet types (check if any selected type matches)
  const is2Digit = selectedBetTypes.some(t => t === 'teng_bon_2' || t === 'teng_lang_2')
  const is3Digit = selectedBetTypes.some(t => t === 'teng_bon_3' || t === 'tode_3' || t === 'teng_lang_3')
  const is4Tode = selectedBetTypes.some(t => t === 'tode_4')

  const handleQuickGenerate = (type: string) => {
    let numbers: string[] = []

    switch (type) {
      case 'ble':
        numbers = gen_2_ble()
        break
      case 'low':
        numbers = gen_2_low()
        break
      case 'high':
        numbers = gen_2_high()
        break
      case 'even':
        numbers = gen_2_even()
        break
      case 'odd':
        numbers = gen_2_odd()
        break
    }

    if (numbers.length > 0) {
      onAddNumbers(numbers)
    }
  }

  const handleInputModal = (type: '19' | 'rood_nha' | 'rood_lung') => {
    setInputModalType(type)
    setShowInputModal(true)
    setInputValue('')
  }

  const handleSubmitInput = () => {
    if (inputValue.length !== 1) return

    let numbers: string[] = []

    switch (inputModalType) {
      case '19':
        numbers = gen_19(inputValue)
        break
      case 'rood_nha':
        numbers = rood_nha(inputValue)
        break
      case 'rood_lung':
        numbers = rood_lung(inputValue)
        break
    }

    if (numbers.length > 0) {
      onAddNumbers(numbers)
      setShowInputModal(false)
      setInputValue('')
    }
  }

  if (!is2Digit && !is3Digit && !is4Tode) {
    return null
  }

  return (
    <>
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-2 border-2 border-white/20 shadow-2xl">
        <div className="flex items-center gap-2 mb-2 px-1">
          <FaMagic className="text-yellow-400 text-xs" />
          <h3 className="text-xs font-bold text-white">ตัวเลือกพิเศษ</h3>
        </div>

        <div className="space-y-2">
          {/* Shuffle Options */}
          {(is3Digit || is4Tode) && (
            <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1.5 border border-white/10">
              <div className="text-xs">
                <div className="text-white font-semibold">
                  {is4Tode ? '4ตัวโต๊ด' : '3ตัวกลับ'}
                </div>
                <div className="text-white/60 text-[10px]">
                  {is4Tode ? '24 แบบ' : '6 แบบ'}
                </div>
              </div>
              <button
                onClick={() => setShuffleEnabled(!shuffleEnabled)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${shuffleEnabled ? 'bg-green-500' : 'bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${shuffleEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          )}

          {/* 2-Digit Special Options */}
          {is2Digit && (
            <>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => handleInputModal('19')}
                  className="py-1.5 px-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition-all"
                >
                  19ประตู
                </button>
                <button
                  onClick={() => handleQuickGenerate('ble')}
                  className="py-1.5 px-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs font-semibold transition-all"
                >
                  เบิ้ล
                </button>
                <button
                  onClick={() => handleInputModal('rood_nha')}
                  className="py-1.5 px-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition-all"
                >
                  รูดหน้า
                </button>
                <button
                  onClick={() => handleInputModal('rood_lung')}
                  className="py-1.5 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-all"
                >
                  รูดหลัง
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => handleQuickGenerate('low')}
                  className="py-1.5 px-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold transition-all"
                >
                  ต่ำ
                </button>
                <button
                  onClick={() => handleQuickGenerate('high')}
                  className="py-1.5 px-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs font-semibold transition-all"
                >
                  สูง
                </button>
                <button
                  onClick={() => handleQuickGenerate('even')}
                  className="py-1.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-all"
                >
                  คู่
                </button>
                <button
                  onClick={() => handleQuickGenerate('odd')}
                  className="py-1.5 px-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-all"
                >
                  คี่
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Input Modal */}
      {showInputModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                {inputModalType === '19' && '19 ประตู'}
                {inputModalType === 'rood_nha' && 'รูดหน้า'}
                {inputModalType === 'rood_lung' && 'รูดหลัง'}
              </h3>
              <button
                onClick={() => setShowInputModal(false)}
                className="text-white/70 hover:text-white"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white mb-2 block">ใส่ตัวเลข (0-9)</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value
                    if (/^[0-9]?$/.test(val)) {
                      setInputValue(val)
                    }
                  }}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white text-2xl text-center font-mono focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="0-9"
                  maxLength={1}
                  autoFocus
                />
              </div>

              <div className="text-white/70 text-sm">
                {inputModalType === '19' && 'จะได้เลข 19 ตัว (เช่น ใส่ 5 → 05,15,25,...,95,50,51,...,59)'}
                {inputModalType === 'rood_nha' && 'จะได้เลข 10 ตัว (เช่น ใส่ 5 → 50,51,52,...,59)'}
                {inputModalType === 'rood_lung' && 'จะได้เลข 10 ตัว (เช่น ใส่ 5 → 05,15,25,...,95)'}
              </div>

              <div className="grid grid-cols-10 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => setInputValue(num.toString())}
                    className="aspect-square bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInputModal(false)}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmitInput}
                  disabled={inputValue.length !== 1}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  เพิ่มเลข
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default SpecialNumberOptions
