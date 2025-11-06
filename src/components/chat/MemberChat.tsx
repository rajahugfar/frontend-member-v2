import React, { useState, useEffect, useRef } from 'react'
import { FiSend, FiX, FiMessageCircle, FiImage } from 'react-icons/fi'
import { chatAPI, ChatMessage } from '@/api/chatAPI'
import toast from 'react-hot-toast'
import { useMemberStore } from '@/store/memberStore'
import ImageModal from './ImageModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const MemberChat: React.FC = () => {
  const { member } = useMemberStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const originalTitle = useRef(document.title)
  const titleIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageCount = useRef(0)
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null)
  const [latestMessage, setLatestMessage] = useState<string>('')
  const notificationSound = useRef<HTMLAudioElement | null>(null)

  // Initialize notification sound - using simple beep
  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    const playBeep = async () => {
      try {
        // Resume AudioContext if suspended (required by browser)
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)

        console.log('✅ Member beep sound played successfully!')
      } catch (error) {
        console.error('❌ Failed to play member beep:', error)
      }
    }

    notificationSound.current = { play: () => playBeep() } as any
  }, [])

  // Load initial chat data
  useEffect(() => {
    console.log('✅ MemberChat mounted!')
    // Load chat room immediately
    loadChat()
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadChat()
      // Clear unread when opening chat
      setUnreadCount(0)
    }
  }, [isOpen])

  // Polling for new messages even when closed (for notification)
  useEffect(() => {
    // Always poll for messages if we have a room
    const pollMessages = async () => {
      if (roomId) {
        try {
          const response = await chatAPI.getChat()
          if (response.data.success) {
            const msgs = response.data.data.messages
            setMessages(msgs)

            // Count unread admin messages only when chat is closed
            if (!isOpen) {
              const adminMessages = msgs.filter(m => {
                const senderType = m.sender_type || m.senderType
                return senderType === 'ADMIN' && !m.isRead
              })
              const newUnreadCount = adminMessages.length

              console.log('Member Chat - Total messages:', msgs.length, 'Last count:', lastMessageCount.current, 'Unread:', newUnreadCount)

              // Check if there are new messages
              if (msgs.length > lastMessageCount.current && lastMessageCount.current > 0) {
                console.log('🆕 New messages detected!')
                setUnreadCount(newUnreadCount)

                // Get latest admin message
                const latestAdminMsg = msgs.filter(m => {
                  const senderType = m.sender_type || m.senderType
                  return senderType === 'ADMIN'
                }).pop()

                if (latestAdminMsg) {
                  const msgText = latestAdminMsg.message || 'ส่งรูปภาพ'
                  const shortMsg = msgText.length > 30 ? msgText.substring(0, 30) + '...' : msgText
                  console.log('📬 Latest admin message:', shortMsg)
                  setLatestMessage(shortMsg)

                  // Play notification sound
                  console.log('🔔 Playing member notification sound!')
                  if (notificationSound.current) {
                    notificationSound.current.play().catch(e => console.log('Sound play failed:', e))
                  }
                }
              }
              lastMessageCount.current = msgs.length
            }
          }
        } catch (error) {
          // Ignore
        }
      }
    }

    // Initial load
    pollMessages()

    // Set up polling
    pollingInterval.current = setInterval(pollMessages, 3000)

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [roomId, isOpen])

  // Update browser title when unread messages
  useEffect(() => {
    console.log('Member Title effect - unread:', unreadCount, 'isOpen:', isOpen, 'latestMessage:', latestMessage)

    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current)
      titleIntervalRef.current = null
    }

    if (unreadCount > 0 && !isOpen) {
      console.log('🔄 Starting member title blink animation')
      let showMessage = true
      titleIntervalRef.current = setInterval(() => {
        if (showMessage && latestMessage) {
          document.title = `💬 ${latestMessage}`
          console.log('Member Title:', `💬 ${latestMessage}`)
        } else {
          document.title = `(${unreadCount}) ข้อความใหม่`
          console.log('Member Title:', `(${unreadCount}) ข้อความใหม่`)
        }
        showMessage = !showMessage
      }, 1500)
    } else {
      console.log('Restoring member original title:', originalTitle.current)
      document.title = originalTitle.current
    }

    return () => {
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current)
      }
    }
  }, [unreadCount, isOpen, latestMessage])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.title = originalTitle.current
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current)
      }
    }
  }, [])

  const loadChat = async () => {
    try {
      const response = await chatAPI.getChat()
      if (response.data.success) {
        setRoomId(response.data.data.room.id)
        setMessages(response.data.data.messages)
      }
    } catch (error) {
      console.error('Load chat error:', error)
    }
  }

  const loadMessages = async () => {
    if (!roomId) return

    try {
      const response = await chatAPI.getChat()
      if (response.data.success) {
        setMessages(response.data.data.messages)
      }
    } catch (error) {
      console.error('Load messages error:', error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
        return
      }
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedImage) || !roomId || !member) {
      return
    }

    setLoading(true)
    try {
      let imageUrl: string | undefined

      // Upload image first if selected
      if (selectedImage) {
        const uploadResponse = await chatAPI.uploadImage(selectedImage)
        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.data.imageUrl
        }
      }

      // Send message
      await chatAPI.sendMessage(newMessage, imageUrl)
      setNewMessage('')
      setSelectedImage(null)
      setImagePreview(null)

      // Reload messages immediately
      await loadMessages()
    } catch (error: any) {
      console.error('Send message error:', error)
      toast.error(error.response?.data?.message || 'ส่งข้อความไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <FiMessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f97316] to-[#fb923c] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <FiMessageCircle className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-white font-bold">แชทกับแอดมิน</h3>
            <p className="text-white/80 text-xs">ออนไลน์</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => {
          const senderType = msg.sender_type || msg.senderType
          const createdAt = msg.created_at || msg.createdAt
          const imageUrl = msg.image_url || msg.imageUrl
          const isMember = senderType === 'MEMBER'

          return (
            <div
              key={msg.id}
              className={`mb-4 flex ${isMember ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isMember
                    ? 'bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {imageUrl && (
                  <img
                    src={`${API_URL}${imageUrl}`}
                    alt="attachment"
                    className="rounded-lg mb-2 max-w-full cursor-pointer"
                    onClick={() => setModalImageUrl(imageUrl)}
                  />
                )}
                {msg.message && (
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                )}
                <span
                  className={`text-xs mt-1 block ${
                    isMember ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {createdAt && new Date(createdAt).toString() !== 'Invalid Date'
                    ? new Date(createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 rounded-lg" />
            <button
              onClick={() => {
                setSelectedImage(null)
                setImagePreview(null)
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <FiX size={16} />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#f97316] hover:text-[#fb923c] p-2 transition-colors"
            disabled={loading}
          >
            <FiImage size={24} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent text-gray-900 bg-white"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || (!newMessage.trim() && !selectedImage)}
            className="bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white p-2 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {modalImageUrl && (
        <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
      )}
    </div>
  )
}

export default MemberChat
