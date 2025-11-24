import { httpGet, httpPost } from '../../services/httpClient'

export async function viewPostAuctionStatus(auctionId) {
  return httpGet(`/auctions/${auctionId}/status`)
}

// Updated for API v2.1 - Registration now includes deposit payment creation
export async function registerForAuction(auctionId) {
  return httpPost(`/participation/register`, { auction_id: parseInt(auctionId) })
}

// Check user's participation status for an auction (NEW v2.1)
export async function getParticipationStatus(auctionId) {
  return httpGet(`/participation/auction/${auctionId}/status`)
}

export async function cancelRegistration(auctionId) {
  return httpPost(`/participation/unregister`, { auction_id: parseInt(auctionId) })
}

export async function listMyBids() {
  return httpGet('/bids/my-bids')
}

export async function cancelBid(bidId) {
  return httpPost(`/bids/cancel/${bidId}`)
}

export async function submitProduct(payload) {
  return httpPost('/products/register', payload)
}

export async function paymentStatus(auctionId) {
  return httpGet(`/payments/auction/${auctionId}`)
}

// Updated for API v2.1 - Payment creation with QR token
export async function startPayment(auctionId, payload) {
  return httpPost(`/payments/create`, { auction_id: parseInt(auctionId), ...payload })
}

// NEW v2.1: Check QR token status for payment tracking
export async function checkPaymentTokenStatus(token) {
  return httpGet(`/payments/token/${token}/status`)
}

// NEW v2.1: Complete payment via QR callback
export async function completePaymentWithQR(token) {
  return httpPost(`/payments/qr-callback/${token}`)
}

// NEW v2.1: Get user's payment history
export async function getMyPayments() {
  return httpGet('/payments/my-payments')
}

// NEW v2.1: Get specific payment details
export async function getPaymentDetails(paymentId) {
  return httpGet(`/payments/${paymentId}`)
}

