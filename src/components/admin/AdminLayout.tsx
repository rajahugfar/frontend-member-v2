import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/store/adminStore'
import AdminChatNotification from '@/components/chat/AdminChatNotification'
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiFilter,
  FiBarChart2,
  FiShield,
  FiAward,
  FiImage,
  FiMessageSquare,
} from 'react-icons/fi'

interface MenuItem {
  name: string
  path: string
  icon: React.ReactNode
  badge?: number
  children?: MenuItem[]
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAdminStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      name: 'รายการฝาก/ถอน',
      path: '/admin/transactions',
      icon: <FiDollarSign className="w-5 h-5" />,
      children: [
        { name: 'รายการฝากรอดำเนินการ', path: '/admin/deposits/pending', icon: null },
        { name: 'รายการฝากทั้งหมด', path: '/admin/deposits/all', icon: null },
        { name: 'รายการถอนรอดำเนินการ', path: '/admin/withdrawals/pending', icon: null },
        { name: 'รายการถอนทั้งหมด', path: '/admin/withdrawals/all', icon: null },
        { name: 'รายการคืนยอดเสีย', path: '/admin/cashback', icon: null },
      ],
    },
    {
      name: 'รายการค้าง',
      path: '/admin/pending',
      icon: <FiFilter className="w-5 h-5" />,
      children: [
        { name: 'จับคู่รายการฝาก SCB', path: '/admin/pending/scb', icon: null, badge: 0 },
        { name: 'จับคู่รายการฝาก TrueWallet', path: '/admin/pending/truewallet', icon: null, badge: 0 },
        { name: 'จับคู่รายการฝาก KBANK', path: '/admin/pending/kbank', icon: null, badge: 0 },
        { name: 'รออนุมัติฝากเงิน', path: '/admin/pending/deposits', icon: null, badge: 0 },
        { name: 'รออนุมัติถอนเงิน', path: '/admin/pending/withdrawals', icon: null, badge: 0 },
        { name: 'เครดิตหาย โยกเกมส์', path: '/admin/pending/transfers', icon: null, badge: 0 },
      ],
    },
    {
      name: 'บริการลูกค้า',
      path: '/admin/customers',
      icon: <FiUsers className="w-5 h-5" />,
      children: [
        { name: 'ข้อมูลลูกค้าที่สมัครวันนี้', path: '/admin/customers/today', icon: null },
        { name: 'ข้อมูลลูกค้า', path: '/admin/members', icon: null },
        { name: 'แชท', path: '/admin/chat', icon: <FiMessageSquare className="w-4 h-4" /> },
      ],
    },
    {
      name: 'ระบบหวยออนไลน์',
      path: '/admin/lottery',
      icon: <FiAward className="w-5 h-5" />,
      children: [
        { name: 'หวยมาสเตอร์', path: '/admin/lottery', icon: null },
        { name: 'รายการหวยรายวัน', path: '/admin/lottery/daily', icon: null },
        { name: 'งวดหวย', path: '/admin/lottery/periods', icon: null },
        { name: 'รายการแทง', path: '/admin/lottery/bets', icon: null },
      ],
    },
    {
      name: 'สรุปยอด/รายงาน',
      path: '/admin/reports',
      icon: <FiBarChart2 className="w-5 h-5" />,
      children: [
        { name: 'สรุปรายได้ทั้งหมด', path: '/admin/reports/profit', icon: null },
        { name: 'รายงานธนาคาร SCB', path: '/admin/reports/bank-scb', icon: null },
        { name: 'รายงาน Pincode', path: '/admin/reports/pincode', icon: null },
        { name: 'จัดการรีวิว', path: '/admin/reports/reviews', icon: null },
      ],
    },
    {
      name: 'จัดการเนื้อหาเว็บไซต์',
      path: '/admin/site',
      icon: <FiImage className="w-5 h-5" />,
      children: [
        { name: 'รูปภาพ', path: '/admin/site-images', icon: null },
        { name: 'โปรโมชั่น', path: '/admin/promotions', icon: null },
        { name: 'ค่ายเกม', path: '/admin/game-providers', icon: null },
        { name: 'ตั้งค่าเว็บไซต์', path: '/admin/settings', icon: null },
      ],
    },
    ...(admin?.role === 'superadmin'
      ? [
          {
            name: 'ผู้ดูแลระบบ',
            path: '/admin/system',
            icon: <FiShield className="w-5 h-5" />,
            children: [
              { name: 'พนักงาน', path: '/admin/system/staff', icon: null },
              { name: 'จัดการเกมส์', path: '/admin/system/games', icon: null },
              { name: 'ประวัติการทำรายการ', path: '/admin/system/logs', icon: null },
            ],
          },
        ]
      : []),
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName)
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="flex h-screen bg-admin-bg overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-admin-card border-r border-admin-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-admin-border">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div>
                  <h1 className="text-gold-500 font-display font-bold text-lg">Permchok</h1>
                  <p className="text-brown-400 text-xs">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-brown-400 hover:text-gold-500 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-brown-400 hover:text-gold-500 transition-colors mx-auto"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all mb-1 ${
                      isActive(item.path)
                        ? 'bg-gold-500/10 text-gold-500'
                        : 'text-brown-300 hover:bg-admin-hover hover:text-gold-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {sidebarOpen && <span className="font-medium">{item.name}</span>}
                    </div>
                    {sidebarOpen && (
                      <FiChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedMenu === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {sidebarOpen && expandedMenu === item.name && (
                    <div className="ml-8 mb-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-all ${
                            isActive(child.path)
                              ? 'bg-gold-500/10 text-gold-500'
                              : 'text-brown-400 hover:bg-admin-hover hover:text-gold-500'
                          }`}
                        >
                          <span>{child.name}</span>
                          {child.badge !== undefined && child.badge > 0 && (
                            <span className="bg-error text-white text-xs px-2 py-0.5 rounded-full">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mb-1 ${
                    isActive(item.path)
                      ? 'bg-gold-500/10 text-gold-500'
                      : 'text-brown-300 hover:bg-admin-hover hover:text-gold-500'
                  }`}
                  title={!sidebarOpen ? item.name : ''}
                >
                  {item.icon}
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                  {sidebarOpen && item.badge && (
                    <span className="ml-auto bg-error text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-admin-border p-4">
          {sidebarOpen ? (
            <div className="mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-brown-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {admin?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-brown-200 font-medium truncate">{admin?.name}</p>
                  <p className="text-brown-400 text-xs truncate">{admin?.role}</p>
                </div>
                {/* Chat Notification Icon */}
                <AdminChatNotification />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all"
              >
                <FiLogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all"
              title="ออกจากระบบ"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
