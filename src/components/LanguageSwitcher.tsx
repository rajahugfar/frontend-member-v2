import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiGlobe } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'default' | 'compact' | 'dropdown'
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'default'
}) => {
  const { i18n } = useTranslation()

  // Use i18n.language directly, not state
  // Normalize language to 'th' or 'en' only
  const rawLang = i18n.language || localStorage.getItem('i18nextLng') || 'th'
  const currentLang = rawLang.startsWith('en') ? 'en' : 'th'

  // Debug logging on component mount
  console.log('=== LanguageSwitcher Mount ===')
  console.log('i18n.language:', i18n.language)
  console.log('localStorage.getItem(i18nextLng):', localStorage.getItem('i18nextLng'))
  console.log('rawLang:', rawLang)
  console.log('currentLang:', currentLang)

  const changeLanguage = async (lang: string) => {
    console.log('=== LANGUAGE CHANGE DEBUG ===')
    console.log('Current lang:', currentLang)
    console.log('Target lang:', lang)
    console.log('localStorage BEFORE:', localStorage.getItem('i18nextLng'))

    if (lang === currentLang) {
      console.log('Same language, skipping')
      return
    }

    try {
      // Change i18n language
      await i18n.changeLanguage(lang)
      console.log('i18n.changeLanguage called')

      // Explicitly save to localStorage
      localStorage.setItem('i18nextLng', lang)
      console.log('localStorage.setItem called with:', lang)
      console.log('localStorage AFTER:', localStorage.getItem('i18nextLng'))

      // Show success message
      toast.success(lang === 'th' ? 'เปลี่ยนเป็นภาษาไทยแล้ว ✓' : 'Changed to English ✓', {
        duration: 1500,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold',
        },
      })

      console.log('Toast shown, will reload in 300ms')

      // Reload page to apply changes completely
      setTimeout(() => {
        console.log('Reloading page now...')
        window.location.reload()
      }, 300)
    } catch (error) {
      console.error('Failed to change language:', error)
      toast.error('Failed to change language')
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 ${className}`}>
        <button
          onClick={() => changeLanguage('th')}
          className={`px-3 py-1.5 text-sm font-bold rounded transition-all ${
            currentLang === 'th'
              ? 'bg-yellow-500 text-gray-900 shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          TH
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1.5 text-sm font-bold rounded transition-all ${
            currentLang === 'en'
              ? 'bg-yellow-500 text-gray-900 shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          EN
        </button>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:border-purple-500"
        >
          <option value="th">🇹🇭 ไทย</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 bg-gray-800 rounded-lg p-1 ${className}`}>
      <FiGlobe className="text-gray-400 ml-2" size={16} />
      <button
        onClick={() => changeLanguage('th')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
          currentLang === 'th'
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        ไทย
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
          currentLang === 'en'
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        English
      </button>
    </div>
  )
}

export default LanguageSwitcher
