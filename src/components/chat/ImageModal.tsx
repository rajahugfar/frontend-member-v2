import { useEffect } from 'react'
import { FiX, FiDownload } from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface ImageModalProps {
  imageUrl: string
  onClose: () => void
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `${API_URL}${imageUrl}`
    link.download = imageUrl.split('/').pop() || 'image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        aria-label="Close"
      >
        <FiX size={24} />
      </button>

      {/* Download Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDownload()
        }}
        className="absolute top-4 right-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        aria-label="Download"
      >
        <FiDownload size={20} />
      </button>

      {/* Image Container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`${API_URL}${imageUrl}`}
          alt="Full size"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Image Info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
        คลิกภายนอกเพื่อปิด หรือกด ESC
      </div>
    </div>
  )
}
