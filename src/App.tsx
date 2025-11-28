import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@store/authStore'
import { useAdminStore } from '@store/adminStore'
import { useMemberStore } from '@store/memberStore'

// Layouts
import MainLayout from '@components/layouts/MainLayout'
import AuthLayout from '@components/layouts/AuthLayout'

// Member Pages
import HomePage from '@pages/HomePage'
import LandingPage from '@pages/LandingPage'
import LoginPage from '@pages/auth/LoginPage'
import RegisterPage from '@pages/auth/RegisterPage'
import LotteryPage from '@pages/lottery/LotteryPage'
import GamesPage from '@pages/games/GamesPage'
import GamePlayPage from '@pages/games/GamePlayPage'
import ProfilePage from '@pages/profile/ProfilePage'
import DepositPage from '@pages/transactions/DepositPage'
import WithdrawalPage from '@pages/transactions/WithdrawalPage'
import TransactionHistoryPage from '@pages/transactions/TransactionHistoryPage'
import PromotionsPage from '@pages/promotions/PromotionsPage'
import NotFoundPage from '@pages/NotFoundPage'

// Admin Pages
import AdminLogin from '@pages/admin/AdminLogin'
import AdminDashboard from '@pages/admin/AdminDashboard'
import DepositsAll from '@pages/admin/DepositsAll'
import DepositsPending from '@pages/admin/DepositsPending'
import WithdrawalsAll from '@pages/admin/WithdrawalsAll'
import WithdrawalsPending from '@pages/admin/WithdrawalsPending'
import CashbackList from '@pages/admin/CashbackList'
import MembersManagement from '@pages/admin/MembersManagement'
import TodayCustomers from '@pages/admin/TodayCustomers'
import PendingTransfer from '@pages/admin/PendingTransfer'
import PendingSCB from '@pages/admin/PendingSCB'
import PendingTrueWallet from '@pages/admin/PendingTrueWallet'
import PendingKBANK from '@pages/admin/PendingKBANK'
import ProfitReport from '@pages/admin/ProfitReport'
import BankSCBReport from '@pages/admin/BankSCBReport'
import PincodeReport from '@pages/admin/PincodeReport'
import ReviewManagement from '@pages/admin/ReviewManagement'
import StaffManagement from '@pages/admin/StaffManagement'
import AdminLogs from '@pages/admin/AdminLogs'
import GameManagement from '@pages/admin/GameManagement'
import LotteryManagement from '@pages/admin/LotteryManagement'
import StockMasterList from '@pages/admin/StockMasterList'
import LotteryDaily from '@pages/admin/LotteryDaily'
import LotteryDailyDetail from '@pages/admin/LotteryDailyDetail'
import AdminPoyDetail from '@pages/admin/AdminPoyDetail'
import AdminMemberDetail from '@pages/admin/AdminMemberDetail'
import AdminMemberPoys from '@pages/admin/AdminMemberPoys'
import LotteryPeriods from '@pages/admin/LotteryPeriods'
import LotteryBets from '@pages/admin/LotteryBets'
import SiteImagesManagement from '@pages/admin/SiteImagesManagement'
import PromotionsManagement from '@pages/admin/PromotionsManagement'
import GameProvidersManagement from '@pages/admin/GameProvidersManagement'
import SiteSettingsManagement from '@pages/admin/SiteSettingsManagement'
import ChatManagement from '@pages/admin/ChatManagement'

// Member Lottery Pages
import MemberLottery from '@pages/lottery/MemberLottery'
import LotteryBetting from '@pages/lottery/LotteryBetting'
import LotteryHistory from '@pages/lottery/LotteryHistory'
import LotteryResults from '@pages/lottery/LotteryResults'
import LotteryPoyDetail from '@pages/lottery/LotteryPoyDetail'

// New Member System Pages
import MemberLogin from '@pages/member/Login'
import MemberForgotPassword from '@pages/member/ForgotPassword'
import MemberIndex from '@pages/member/Index'
import MemberDashboard from '@pages/member/Dashboard'
import MemberProfile from '@pages/member/Profile'
import MemberDeposit from '@pages/member/Deposit'
import MemberDepositHistory from '@pages/member/DepositHistory'
import MemberWithdrawal from '@pages/member/Withdrawal'
import MemberWithdrawalHistory from '@pages/member/WithdrawalHistory'
import MemberGameLobby from '@pages/member/GameLobby'
import AMBGameList from '@pages/member/AMBGameList'
import MemberTransactionHistory from '@pages/member/TransactionHistory'
import MemberPromotions from '@pages/member/Promotions'
import MemberBonusHistory from '@pages/member/BonusHistory'
import MemberAffiliate from '@pages/member/Affiliate'

// Admin Layout
import AdminLayout from '@components/admin/AdminLayout'

// Member Layout
import MemberLayout from '@components/layouts/MemberLayout'

// Protected Route Component (Member)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Guest Route Component (redirect to home if already logged in)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />
}

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />
}

// Admin Guest Route Component (redirect to dashboard if already logged in)
const AdminGuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/admin/dashboard" />
}

// Admin Redirect Component (redirect based on auth status)
const AdminRedirect = () => {
  const { isAuthenticated } = useAdminStore()
  return <Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />
}

// Member Protected Route Component (use memberStore)
const MemberProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token } = useMemberStore()

  // Also check localStorage for backward compatibility during hydration
  const hasToken = token || localStorage.getItem('memberToken')

  return (isAuthenticated || hasToken) ? <>{children}</> : <Navigate to="/member/login" />
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Landing Page (no layout) */}
        <Route index element={<LandingPage />} />

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/lottery" element={<LotteryPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
        </Route>

        {/* Auth Routes (Guest Only) */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
        </Route>

        {/* Protected Routes (Authenticated Only) */}
        <Route element={<MainLayout />}>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <DepositPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawal"
            element={
              <ProtectedRoute>
                <WithdrawalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/play/:gameId"
            element={
              <ProtectedRoute>
                <GamePlayPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* New Member System Routes */}
        {/* Member Auth Routes (Public) */}
        <Route path="/member/login" element={<MemberLogin />} />
        <Route path="/member/register" element={<RegisterPage />} />
        <Route path="/member/forgot-password" element={<MemberForgotPassword />} />

        {/* Member Protected Routes with Layout */}
        <Route
          element={
            <MemberProtectedRoute>
              <MemberLayout />
            </MemberProtectedRoute>
          }
        >
          <Route path="/member" element={<MemberIndex />} />
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/deposit" element={<MemberDeposit />} />
          <Route path="/member/deposit/history" element={<MemberDepositHistory />} />
          <Route path="/member/withdrawal" element={<MemberWithdrawal />} />
          <Route path="/member/withdrawal/history" element={<MemberWithdrawalHistory />} />
          <Route path="/member/games" element={<MemberGameLobby />} />
          <Route path="/member/games/:provider" element={<AMBGameList />} />
          <Route path="/member/transactions" element={<MemberTransactionHistory />} />
          <Route path="/member/promotions" element={<MemberPromotions />} />
          <Route path="/member/bonuses" element={<MemberBonusHistory />} />
          <Route path="/member/affiliate" element={<MemberAffiliate />} />
          {/* Lottery routes with 3 tabs */}
          <Route path="/member/lottery" element={<MemberLottery />} />
          <Route path="/member/lottery/bet/:periodId" element={<LotteryBetting />} />
          <Route path="/member/lottery/history" element={<LotteryHistory />} />
          <Route path="/member/lottery/results" element={<LotteryResults />} />
          <Route path="/member/lottery/poy/:poyId" element={<LotteryPoyDetail />} />
        </Route>

        {/* Admin Routes */}
        {/* Admin Root - Redirect based on auth status */}
        <Route
          path="/admin"
          element={
            <AdminRedirect />
          }
        />

        <Route
          path="/admin/login"
          element={
            <AdminGuestRoute>
              <AdminLogin />
            </AdminGuestRoute>
          }
        />

        {/* Admin Protected Routes with Layout */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/deposits" element={<DepositsAll />} />
          <Route path="/admin/deposits/pending" element={<DepositsPending />} />
          <Route path="/admin/pending/deposits" element={<DepositsPending />} />
          <Route path="/admin/withdrawals" element={<WithdrawalsAll />} />
          <Route path="/admin/withdrawals/pending" element={<WithdrawalsPending />} />
          <Route path="/admin/pending/withdrawals" element={<WithdrawalsPending />} />
          <Route path="/admin/cashback" element={<CashbackList />} />
          <Route path="/admin/members" element={<MembersManagement />} />
          <Route path="/admin/customers/today" element={<TodayCustomers />} />
          <Route path="/admin/pending/transfers" element={<PendingTransfer />} />
          <Route path="/admin/pending/scb" element={<PendingSCB />} />
          <Route path="/admin/pending/truewallet" element={<PendingTrueWallet />} />
          <Route path="/admin/pending/kbank" element={<PendingKBANK />} />
          <Route path="/admin/reports/profit" element={<ProfitReport />} />
          <Route path="/admin/reports/bank-scb" element={<BankSCBReport />} />
          <Route path="/admin/reports/pincode" element={<PincodeReport />} />
          <Route path="/admin/reports/reviews" element={<ReviewManagement />} />
          <Route path="/admin/system/staff" element={<StaffManagement />} />
          <Route path="/admin/system/logs" element={<AdminLogs />} />
          <Route path="/admin/system/games" element={<GameManagement />} />
          <Route path="/admin/lottery" element={<LotteryManagement />} />
          <Route path="/admin/lottery/daily" element={<LotteryDaily />} />
          <Route path="/admin/lottery/daily/:stockId" element={<LotteryDailyDetail />} />
          <Route path="/admin/poy/:poyId" element={<AdminPoyDetail />} />
          <Route path="/admin/members/:memberId" element={<AdminMemberDetail />} />
          <Route path="/admin/members/:memberId/poys" element={<AdminMemberPoys />} />
          <Route path="/admin/lottery/stocks" element={<StockMasterList />} />
          <Route path="/admin/lottery/periods" element={<LotteryPeriods />} />
          <Route path="/admin/lottery/bets" element={<LotteryBets />} />

          {/* Site Content Management */}
          <Route path="/admin/site-images" element={<SiteImagesManagement />} />
          <Route path="/admin/promotions" element={<PromotionsManagement />} />
          <Route path="/admin/game-providers" element={<GameProvidersManagement />} />
          <Route path="/admin/settings" element={<SiteSettingsManagement />} />

          {/* Chat Management */}
          <Route path="/admin/chat" element={<ChatManagement />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
