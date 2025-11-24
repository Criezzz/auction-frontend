import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import AuctionDetailPage from './pages/AuctionDetailPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import RequestResetPage from './pages/RequestResetPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import OTPVerificationPage from './pages/OTPVerificationPage.jsx'
import OTPVerificationSuccessPage from './pages/OTPVerificationSuccessPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { AuthProvider } from './features/auth/AuthProvider.jsx'
import RequireAuth from './features/auth/RequireAuth.jsx'
import AdminUpdatePaymentPage from './pages/AdminUpdatePaymentPage.jsx'
import AdminProductStatusPage from './pages/AdminProductStatusPage.jsx'
import AdminAuctionResultPage from './pages/AdminAuctionResultPage.jsx'
import AdminCreateAuctionPage from './pages/AdminCreateAuctionPage.jsx'
import AdminReviewQueuePage from './pages/AdminReviewQueuePage.jsx'
import AdminRegisteredAuctionsPage from './pages/AdminRegisteredAuctionsPage.jsx'
import PostAuctionStatusPage from './pages/PostAuctionStatusPage.jsx'
import SubmitProductPage from './pages/SubmitProductPage.jsx'
import MyBidsPage from './pages/MyBidsPage.jsx'
import PaymentStatusPage from './pages/PaymentStatusPage.jsx'
import PaymentCheckoutPage from './pages/PaymentCheckoutPage.jsx'
import AccountSettingsPage from './pages/AccountSettingsPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import WonAuctionsPage from './pages/WonAuctionsPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<App />}> 
            <Route index element={<HomePage />} />
            <Route path="auction/:id" element={<AuctionDetailPage />} />
            <Route path="signin" element={<SignInPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="otp-verification" element={<OTPVerificationPage />} />
            <Route path="otp-verification-success" element={<OTPVerificationSuccessPage />} />
            <Route path="reset" element={<RequestResetPage />} />
            <Route path="reset/confirm" element={<ResetPasswordPage />} />
            <Route path="account/settings" element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
            <Route path="account/profile" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
            <Route path="products/submit" element={<RequireAuth><SubmitProductPage /></RequireAuth>} />
            <Route path="my/bids" element={<RequireAuth><MyBidsPage /></RequireAuth>} />
            <Route path="won-auctions" element={<RequireAuth><WonAuctionsPage /></RequireAuth>} />
            <Route path="auctions/:id/status" element={<RequireAuth><PostAuctionStatusPage /></RequireAuth>} />
            <Route path="payment/:id" element={<RequireAuth><PaymentStatusPage /></RequireAuth>} />
            <Route path="pay/:id" element={<RequireAuth><PaymentCheckoutPage /></RequireAuth>} />
            <Route path="admin" element={
              <RequireAuth role="ADMIN">
                <AdminDashboardPage />
              </RequireAuth>
            } />
            <Route path="admin/review" element={<RequireAuth role="ADMIN"><AdminReviewQueuePage /></RequireAuth>} />
            <Route path="admin/auctions/registered" element={<RequireAuth role="ADMIN"><AdminRegisteredAuctionsPage /></RequireAuth>} />
            <Route path="admin/payments/:id/update" element={<RequireAuth role="ADMIN"><AdminUpdatePaymentPage /></RequireAuth>} />
            <Route path="admin/products/:id/status" element={<RequireAuth role="ADMIN"><AdminProductStatusPage /></RequireAuth>} />
            <Route path="admin/auctions/:id/result" element={<RequireAuth role="ADMIN"><AdminAuctionResultPage /></RequireAuth>} />
            <Route path="admin/auctions/new" element={<RequireAuth role="ADMIN"><AdminCreateAuctionPage /></RequireAuth>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
