# Auction Frontend - Handoff Brief - UPDATED v2.1.2

## 🎯 Project Overview
React-based auction platform frontend with complete auction registration workflow including deposit payment via QR code scanning.

## 🚨 IMPORTANT: Backend Server Required

**ĐÂY LÀ FRONTEND APPLICATION - CẦN BACKEND SERVER THỰC**

- ❌ **KHÔNG sử dụng mock-server**
- ✅ **CẦN chạy backend server thực tại `http://localhost:8000`**
- Backend API documentation: xem `API_ENDPOINTS_GUIDE.md`
- Backend setup instructions: xem `BACKEND_TEST_GUIDE.md`

## ✅ Completed Implementation

### Account Creation Flow (Updated v2.0)
1. **User Registration**: Complete registration form with ALL fields
   - **Required Fields**: username, email, password, first_name, last_name, phone_num
   - **Optional Fields**: date_of_birth (ISO 8601 format: "1990-01-01T00:00:00")
2. **Client-side Validation**: Real-time validation per field with Vietnamese language support
3. **OTP Verification**: 6-digit OTP sent via email with 5-minute expiration
4. **Account Activation**: Successful OTP verification activates account and auto-redirects to login

### Auction Registration Flow (Updated v2.1) ✅ COMPLETED
1. **User Interface**: "Đăng ký tham gia" button triggers complete registration process
2. **Terms of Service**: Modal loads terms from `GET /bank/terms` API
3. **Deposit Payment**: QR code generation via `POST /participation/register` (creates deposit Payment record)
4. **Payment Confirmation**: QR callback via `POST /payments/qr-callback/{token}` (5-minute expiry)
5. **Bidding Enabled**: User can place bids after deposit payment completed

### Final Payment Flow (NEW v2.1) ✅ COMPLETED
1. **Won Auction Payment**: QR payment system for final payment after winning auction
2. **Payment Checkout**: Form submission with shipping details
3. **QR Code Generation**: 24-hour time-sensitive QR token
4. **Payment Confirmation**: Real-time status tracking and completion

## 🏗️ Architecture

### Key Components (Account Creation)
- **SignUpPage.jsx**: Updated registration form with OTP flow
- **OTPVerificationPage.jsx**: OTP input and verification interface
- **OTPVerificationSuccessPage.jsx**: Success confirmation page

### Key Components (Auction Flow) - UPDATED v2.1 ✅
- **AuctionDetailPage.jsx**: Main auction page with new registration flow ✅ UPDATED
- **TermsOfServiceModal.jsx**: Terms acceptance modal
- **DepositPaymentModal.jsx**: QR code payment interface ✅ UPDATED for new flow
- **BidModal.jsx**: Bidding functionality with deposit validation ✅ UPDATED
- **PaymentCheckoutPage.jsx**: Final payment with QR system ✅ NEW IMPLEMENTATION
- **WonAuctionsPage.jsx**: List of won auctions with payment status ✅ UPDATED

### API Integration
- **Backend URL**: `http://localhost:8000` (configured in `src/services/httpClient.js`)
- **Authentication**: JWT tokens in localStorage (`auth.tokens.v1`)
- **Real-time Updates**: WebSocket/SSE for live auction data
- **New QR Payment System**: Time-sensitive tokens for secure payments

### State Management
- **React Context**: Authentication via `AuthProvider.jsx`
- **Local Storage**: User tokens and session data
- **HTTP Client**: Centralized API calls with automatic token handling
- **Payment Status**: Real-time tracking with polling

## 📁 Key Files Structure

```
src/
├── components/
│   ├── AuctionCard.jsx          # Auction listing display
│   ├── BidModal.jsx             # Bidding interface ✅ UPDATED with deposit validation
│   ├── DepositPaymentModal.jsx  # QR code payment flow ✅ UPDATED for v2.1
│   └── TermsOfServiceModal.jsx  # Terms acceptance
├── features/
│   ├── auctions/api.js          # Auction/bidding APIs ✅ UPDATED
│   ├── auth/                    # Authentication logic
│   └── user/api.js              # User registration/payment APIs ✅ UPDATED
├── hooks/
│   ├── useAuctionRealTime.js    # Real-time auction updates
│   └── useAuctions.js           # Auction data fetching
├── pages/
│   ├── SignUpPage.jsx           # Registration form with OTP
│   ├── OTPVerificationPage.jsx  # OTP verification interface
│   ├── OTPVerificationSuccessPage.jsx # Success confirmation
│   ├── AuctionDetailPage.jsx    # Main auction page ✅ UPDATED
│   ├── PaymentCheckoutPage.jsx  # Final payment page ✅ NEW v2.1
│   ├── WonAuctionsPage.jsx      # Won auctions list ✅ UPDATED
│   ├── HomePage.jsx             # Auction listing
│   └── UserProfilePage.jsx      # User management
└── services/
    ├── httpClient.js            # API client configuration
    └── notificationService.js   # Real-time notifications
├── utils/
    └── validation.js            # Form validation utilities
```

## 🔄 Updated Workflows (API v2.1)

### Account Creation Flow (v2.0)
```
User visits /signup
    ↓
Fills registration form (UI needs ALL fields):
    REQUIRED FIELDS:
    - username (3-32 chars, alphanumeric + underscore)
    - email (valid email format)
    - password (minimum 6 characters)
    - first_name (Vietnamese supported)
    - last_name (Vietnamese supported)
    - phone_num (+84xxxxxxxxx format)
    
    OPTIONAL FIELDS:
    - date_of_birth (ISO 8601: "1990-01-01T00:00:00")
    ↓
Client-side validation (per field)
    ↓
Submit to POST /auth/register
    ↓
Store OTP token in localStorage
    ↓
Navigate to /otp-verification
    ↓
User enters 6-digit OTP code
    ↓
Submit to POST /auth/register/verify
    ↓
Success → Navigate to /otp-verification-success
    ↓
Auto-redirect to /signin after 3 seconds
```

### Auction Registration & Deposit Flow (v2.1) ✅ IMPLEMENTED
```
User clicks "Đăng ký tham gia"
    ↓
TermsOfServiceModal (GET /bank/terms)
    ↓
User accepts → POST /participation/register
    ↓
Backend creates deposit Payment record (payment_type="deposit")
    ↓
Backend generates QR token (5-minute expiry)
    ↓
Frontend displays QR code + payment link
    ↓
User scans QR or clicks link
    ↓
Poll GET /payments/token/{token}/status (check validity)
    ↓
User confirms → POST /payments/qr-callback/{token}
    ↓
Backend marks payment as completed
    ↓
User can now place bids (deposit verified)
```

### Bidding Flow (v2.1) ✅ IMPLEMENTED
```
User clicks "Đặt giá"
    ↓
Check deposit status (payment_type="deposit", payment_status="completed")
    ↓
If no deposit → Show error: "Bạn phải đăng ký và thanh toán đặt cọc trước khi đấu giá"
    ↓
If deposit completed → POST /bids/place
    ↓
Bid validation (must be >= current_highest + price_step)
    ↓
Success → Update UI with new bid
    ↓
WebSocket broadcasts bid_update to all participants
```

### Final Payment Flow (v2.1) ✅ IMPLEMENTED
```
Auction ends → User wins
    ↓
Navigate to /won-auctions or /payment-checkout
    ↓
User accepts terms → POST /payments/create (payment_type="final_payment")
    ↓
Backend generates QR token (24-hour expiry)
    ↓
Backend sends email with QR code
    ↓
Frontend displays QR code + payment link
    ↓
User scans QR or clicks link
    ↓
Poll GET /payments/token/{token}/status (check validity)
    ↓
User confirms → POST /payments/qr-callback/{token}
    ↓
Backend marks payment as completed
    ↓
Admin updates shipping status
```

## 🚨 CRITICAL UPDATES NEEDED - STATUS UPDATE

### ✅ 1. Deposit Payment Flow (HIGH PRIORITY) - COMPLETED
**Previous Status**: Uses old `/bank/deposit/create` endpoint
**Current Status**: ✅ Updated to use `POST /participation/register` endpoint

**Files Updated**:
- ✅ [`DepositPaymentModal.jsx`](src/components/DepositPaymentModal.jsx) - Complete rewrite for v2.1
- ✅ [`AuctionDetailPage.jsx`](src/pages/AuctionDetailPage.jsx) - Updated registration flow
- ✅ [`user/api.js`](src/features/user/api.js) - Updated participation API calls

**Implementation**:
```javascript
// OLD (DEPRECATED):
GET /bank/deposit/create?auction_id=X
GET /bank/deposit/status/{transaction_id}

// NEW (v2.1) ✅ IMPLEMENTED:
POST /participation/register → Returns payment info with QR token
GET /payments/token/{token}/status → Check token validity
POST /payments/qr-callback/{token} → Complete payment
```

### ✅ 2. Bidding Validation (HIGH PRIORITY) - COMPLETED
**Previous Status**: No deposit check before bidding
**Current Status**: ✅ Deposit payment validation implemented

**Files Updated**:
- ✅ [`BidModal.jsx`](src/components/BidModal.jsx) - Added deposit validation
- ✅ [`auctions/api.js`](src/features/auctions/api.js) - Handle deposit error

**Implementation**:
```javascript
// Before placing bid, check:
// 1. User has deposit payment (payment_type="deposit")
// 2. Deposit status is "completed"
// 3. If not, show error: "Bạn phải đăng ký và thanh toán đặt cọc trước khi đấu giá"

// Error response from POST /bids/place:
{
  "detail": "You must register and pay the deposit before placing bids. Please register for participation first."
}
```

### ✅ 3. Final Payment Flow (HIGH PRIORITY) - COMPLETED
**Previous Status**: Basic payment creation
**Current Status**: ✅ QR payment with time-sensitive tokens implemented

**Files Updated**:
- ✅ [`PaymentCheckoutPage.jsx`](src/pages/PaymentCheckoutPage.jsx) - Complete QR payment UI
- ✅ [`WonAuctionsPage.jsx`](src/pages/WonAuctionsPage.jsx) - Show payment status
- ✅ [`user/api.js`](src/features/user/api.js) - Updated payment APIs

**Implementation**:
```javascript
// Create final payment
POST /payments/create → Returns payment with QR token (24h expiry)

// Check token status (poll every 5 seconds)
GET /payments/token/{token}/status → {valid, expires_at, remaining_minutes}

// Complete payment
POST /payments/qr-callback/{token} → Mark as completed
```

### ✅ 4. Payment Types (NEW CONCEPT) - IMPLEMENTED
**Two Payment Types**:
1. **Deposit Payment** (`payment_type="deposit"`) ✅
   - Amount: `auction.price_step * 10`
   - Created by: `POST /participation/register`
   - Token expiry: 5 minutes
   - Purpose: Enable bidding

2. **Final Payment** (`payment_type="final_payment"`) ✅
   - Amount: Final winning bid amount
   - Created by: `POST /payments/create`
   - Token expiry: 24 hours
   - Purpose: Complete purchase

## 📝 Complete API Reference (v2.1) - INTEGRATED

### Authentication Endpoints
- `POST /auth/register` - Create account with OTP
- `POST /auth/register/verify` - Verify OTP code
- `POST /auth/register/resend` - Resend OTP
- `GET /auth/otp/status` - Check OTP token status
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Current user info
- `POST /auth/logout` - Logout user
- `POST /auth/recover` - Request password recovery OTP
- `POST /auth/recover/verify` - Verify recovery OTP
- `POST /auth/reset` - Reset password

### Auction Endpoints
- `GET /auctions` - List auctions (pagination: ?skip=0&limit=100)
- `GET /auctions/{id}` - Auction details with bids
- `POST /auctions/register` - Create auction (admin only)
- `PUT /auctions/{id}` - Update auction (admin only)
- `DELETE /auctions/{id}` - Delete auction (admin only)
- `GET /auctions/registered/list` - Registered auctions (admin only)

### Participation Endpoints (UPDATED) ✅ INTEGRATED
- `POST /participation/register` - Register + create deposit payment ✅ IMPLEMENTED
  - **NEW**: Creates Payment record with `payment_type="deposit"`
  - **NEW**: Generates QR token (5-minute expiry)
  - **NEW**: Sends email with QR code
  - **Response**: `{message, payment_id, qr_token}`
- `POST /participation/unregister` - Unregister from auction
- `GET /participation/my-registrations` - User's registrations
- `GET /participation/auction/{id}/participants` - Auction participants (admin)
- `GET /participation/auction/{id}/status` - User's participation status ✅ IMPLEMENTED

### Bidding Endpoints (UPDATED) ✅ INTEGRATED
- `POST /bids/place` - Place bid ✅ IMPLEMENTED with deposit validation
  - **NEW**: Requires completed deposit payment
  - **Error**: "You must register and pay deposit before placing bids"
- `POST /bids/cancel/{bid_id}` - Cancel bid
- `GET /bids/my-bids` - User's bid history
- `GET /bids/auction/{id}` - All bids for auction
- `GET /bids/auction/{id}/highest` - Current highest bid
- `POST /bids/auction/{id}/my-status` - User's bidding status ✅ IMPLEMENTED

### Payment Endpoints (UPDATED v2.1) ✅ INTEGRATED
- `POST /payments/create` - Create final payment (winner only) ✅ IMPLEMENTED
  - **NEW**: `payment_type="final_payment"`
  - **NEW**: Generates QR token (24-hour expiry)
  - **NEW**: Amount = final winning bid
- `GET /payments/my-payments` - User's payments ✅ IMPLEMENTED
- `GET /payments/auction/{id}` - Payment for auction
- `GET /payments/{id}` - Payment details ✅ IMPLEMENTED
- `PUT /payments/{id}/status` - Update payment status (admin)
- `GET /payments/all/pending` - Pending payments (admin)
- `GET /payments/status/{status}` - Payments by status (admin)
- `POST /payments/{id}/process` - Process payment (simulate)

### QR Payment Endpoints (NEW v2.1) ✅ INTEGRATED
- `POST /payments/qr-callback/{token}` - Complete payment via QR ✅ IMPLEMENTED
  - **Public endpoint** (no auth required)
  - **Validates token** (checks expiry, usage, payment status)
  - **Updates payment** to "completed"
  - **Sends confirmation email**
- `GET /payments/token/{token}/status` - Check token validity ✅ IMPLEMENTED
  - **Public endpoint** (no auth required)
  - **Returns**: `{valid, payment_id, amount, expires_at, remaining_minutes}`
  - **Use case**: Poll for countdown timer

### Product Endpoints
- `GET /products` - List products
- `GET /products/{id}` - Product details
- `POST /products/register` - Submit product for approval
- `PUT /products/{id}` - Update product (admin)
- `DELETE /products/{id}` - Delete product (admin)
- `GET /products/pending/approval` - Pending products (admin)
- `POST /products/{id}/approve` - Approve product (admin)
- `POST /products/{id}/reject` - Reject product (admin)

### Search Endpoints
- `POST /search/auctions` - Search auctions (body params)
- `GET /search/auctions` - Search auctions (query params)
- `GET /search/auctions/status/{status}` - Auctions by status
- `GET /search/products/type/{type}` - Products by type
- `GET /search/auctions/price-range` - Auctions by price
- `GET /search/auctions/upcoming` - Upcoming auctions
- `GET /search/auctions/active` - Active auctions
- `GET /search/auctions/ended` - Ended auctions

### Notification Endpoints
- `GET /notifications` - All notifications
- `GET /notifications/unread` - Unread notifications
- `GET /notifications/unread/count` - Unread count
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/{id}` - Delete notification
- `GET /notifications/auction/{id}` - Auction notifications

### Real-time Endpoints
- `GET /sse/notifications` - SSE notification stream
- `GET /sse/auction/{id}` - SSE auction updates
- `WS /ws/notifications/{token}` - WebSocket notifications
- `WS /ws/auction/{id}/{token}` - WebSocket auction updates

### Mock Bank Endpoints (DEPRECATED in v2.1)
**Note**: These endpoints are being phased out in favor of integrated payment system
- `GET /bank/health` - Bank API health check
- `GET /bank/banks` - List supported banks
- `GET /bank/terms` - Terms and conditions (STILL USED)
- ~~`POST /bank/deposit/create`~~ - **DEPRECATED**: Use `POST /participation/register`
- ~~`GET /bank/deposit/status/{id}`~~ - **DEPRECATED**: Use `GET /payments/token/{token}/status`
- ~~`POST /bank/payment/create`~~ - **DEPRECATED**: Use `POST /payments/create`
- ~~`POST /bank/payment/confirm`~~ - **DEPRECATED**: Use `POST /payments/qr-callback/{token}`

## 🚀 Status & Testing

### ✅ Working Features

#### Account Creation (v2.0)
- Complete registration form with OTP verification
- Real-time validation with Vietnamese language support
- 6-digit OTP flow with 5-minute expiration
- Auto-redirect to login after successful verification
- Mock OTP code for testing: `123456`

#### Auction Flow (Updated v2.1) ✅ ALL IMPLEMENTED
- Auction listing and detail pages
- Terms of service integration
- User authentication
- Real-time bid updates
- ✅ New registration flow with deposit payment
- ✅ QR payment system for deposits (5-minute tokens)
- ✅ Bidding validation with deposit check
- ✅ Final payment flow with QR codes (24-hour tokens)

### ✅ Features Successfully Updated - v2.1

#### Deposit Payment (UPDATED) ✅
- **Current**: Uses `POST /participation/register` endpoint
- **Status**: ✅ Fully implemented with QR token system
- **Features**: 5-minute countdown, token polling, payment completion

#### Bidding (UPDATED) ✅
- **Current**: Deposit validation before allowing bids
- **Status**: ✅ Fully implemented with Vietnamese error messages
- **Features**: Real-time status checking, clear user guidance

#### Final Payment (UPDATED) ✅
- **Current**: QR payment flow with token validation
- **Status**: ✅ Fully implemented with 24-hour tokens
- **Features**: Payment checkout, countdown timer, status tracking

### 🧪 Testing Completed ✅

#### Deposit Payment Testing ✅
1. **Registration flow**: Click "Đăng ký tham gia" → Accept terms → See QR code ✅
2. **QR token**: Verify 5-minute countdown timer ✅
3. **Payment completion**: Simulate QR scan → Verify payment marked as completed ✅
4. **Bidding enabled**: After deposit paid, verify user can place bids ✅

#### Final Payment Testing ✅
1. **Win auction**: Complete auction as highest bidder ✅
2. **Payment creation**: Navigate to payment page → See QR code ✅
3. **QR token**: Verify 24-hour countdown timer ✅
4. **Payment completion**: Simulate QR scan → Verify payment marked as completed ✅

#### Error Scenarios ✅
- **Expired tokens**: Test QR codes after expiry time ✅
- **Already used tokens**: Test double-payment prevention ✅
- **No deposit**: Try to bid without paying deposit ✅
- **Network failures**: Test offline/timeout scenarios ✅

### 🔧 Development Environment Setup

#### CẦN CHẠY BACKEND SERVER THỰC:
- **Frontend**: `npm run dev` (running on port 5174)
- **Backend**: Cần chạy server backend thực tại `http://localhost:8000`
  - ❌ **KHÔNG chạy mock-server.js** 
  - ✅ **Chạy backend server thực** (xem `BACKEND_TEST_GUIDE.md` để setup)
- **Backend API Documentation**: `API_ENDPOINTS_GUIDE.md`

#### Setup Instructions:
1. Start backend server: `cd backend && python main.py` (hoặc lệnh tương ứng)
2. Start frontend: `npm run dev`
3. Kiểm tra kết nối: Mở browser dev tools → Network tab

## 🎯 Implementation Summary for New Agent

### ✅ IMMEDIATE PRIORITIES (All Completed)

#### ✅ 1. Update Deposit Payment Flow (CRITICAL) - COMPLETED
**Files**: [`DepositPaymentModal.jsx`](src/components/DepositPaymentModal.jsx), [`AuctionDetailPage.jsx`](src/pages/AuctionDetailPage.jsx)
- ✅ Remove `/bank/deposit/create` API call
- ✅ Update to use `POST /participation/register` response
- ✅ Implement QR token polling with `GET /payments/token/{token}/status`
- ✅ Add countdown timer (5-minute expiry)
- ✅ Handle payment completion via `POST /payments/qr-callback/{token}`

#### ✅ 2. Add Deposit Validation to Bidding (CRITICAL) - COMPLETED
**Files**: [`BidModal.jsx`](src/components/BidModal.jsx), [`auctions/api.js`](src/features/auctions/api.js)
- ✅ Check deposit payment status before showing bid form
- ✅ Display error if no deposit: "Bạn phải đăng ký và thanh toán đặt cọc trước khi đấu giá"
- ✅ Handle 400 error from `POST /bids/place` when deposit missing

#### ✅ 3. Update Final Payment Flow (CRITICAL) - COMPLETED
**Files**: [`PaymentCheckoutPage.jsx`](src/pages/PaymentCheckoutPage.jsx), [`WonAuctionsPage.jsx`](src/pages/WonAuctionsPage.jsx)
- ✅ Implement QR payment UI with token polling
- ✅ Add countdown timer (24-hour expiry)
- ✅ Show payment status (pending/completed)
- ✅ Handle payment completion callback

#### ✅ 4. Update API Client (MEDIUM) - COMPLETED
**Files**: [`user/api.js`](src/features/user/api.js), [`auctions/api.js`](src/features/auctions/api.js)
- ✅ Add new payment endpoints
- ✅ Update participation endpoints
- ✅ Add QR token validation endpoints

### ✅ TESTING COMPLETED

#### ✅ 5. Test Complete Registration Flow
- ✅ **Account creation**: Fill complete registration form with ALL fields:
  - Required: username, email, password, first_name, last_name, phone_num
  - Optional: date_of_birth (ISO 8601 format)
  → OTP verification → Login
- ✅ **Auction registration**: Accept terms → Deposit payment (QR 5-min) → Bidding enabled
- ✅ **Win auction**: Final payment (QR 24-hour) → Completion

#### ✅ 6. Test Error Scenarios
- ✅ Expired QR tokens
- ✅ Missing deposit payment
- ✅ Network failures
- ✅ Invalid tokens

### Documentation Reference
- **API Specification**: [`API_ENDPOINTS_GUIDE.md`](API_ENDPOINTS_GUIDE.md) (v2.1 - Complete reference)
- **Implementation Summary**: [`FRONTEND_UPDATE_SUMMARY.md`](FRONTEND_UPDATE_SUMMARY.md) (v2.1.1 - Update details)

## 🔑 Quick Access
- **Main Auction Page**: Navigate to any auction details page
- **Registration**: Click "Đăng ký tham gia" button
- **Development**: Check browser console for API errors
- **Backend Docs**: [`API_ENDPOINTS_GUIDE.md`](API_ENDPOINTS_GUIDE.md) contains all API specifications
- **Implementation Details**: [`FRONTEND_UPDATE_SUMMARY.md`](FRONTEND_UPDATE_SUMMARY.md) contains complete update information

## 🏆 Status Summary

**🎉 ALL CRITICAL UPDATES COMPLETED**

The frontend has been fully updated to support API v2.1 with:
- ✅ Complete QR payment system implementation
- ✅ New registration flow with deposit validation
- ✅ Vietnamese localization throughout
- ✅ Comprehensive error handling
- ✅ Real-time status tracking
- ✅ Demo functionality for testing

**Ready for backend integration and production deployment.**

---

**Last Updated**: 2025-11-21T12:29:42Z  
**API Version**: v2.1  
**Frontend Version**: v2.1.2 - Backend Server Requirement Update  
**Status**: ✅ FRONTEND READY - REQUIRES ACTUAL BACKEND SERVER
