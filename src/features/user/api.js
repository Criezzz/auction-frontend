import { apiBase, httpGet, httpPost } from '../../services/httpClient'

const useMock = !apiBase()

export async function viewPostAuctionStatus(auctionId) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 200))
    return {
      auction_id: auctionId,
      payment: { status: 'REQUESTED', method: 'BANK', requested_at: new Date().toISOString() },
      product: { shipping_status: 'PREPARING', receiving_method: 'Pick-up' },
    }
  }
  return httpGet(`/auctions/${auctionId}/status`)
}

export async function registerForAuction(auctionId) {
  if (useMock) { await new Promise((r)=>setTimeout(r,200)); return { ok: true, auction_id: auctionId } }
  return httpPost(`/auctions/${auctionId}/register`)
}

export async function cancelRegistration(auctionId) {
  if (useMock) { await new Promise((r)=>setTimeout(r,200)); return { ok: true, auction_id: auctionId } }
  return httpPost(`/auctions/${auctionId}/register/cancel`)
}

export async function listMyBids() {
  if (useMock) {
    await new Promise((r)=>setTimeout(r,150))
    return [ { id: 'b1', auction_id: 1, amount: 120, status: 'VALID' } ]
  }
  return httpGet('/me/bids')
}

export async function cancelBid(bidId) {
  if (useMock) { await new Promise((r)=>setTimeout(r,150)); return { ok: true, id: bidId } }
  return httpPost(`/bids/${bidId}/cancel`)
}

export async function submitProduct(payload) {
  if (useMock) { await new Promise((r)=>setTimeout(r,200)); return { ok: true, id: Math.random().toString(36).slice(2), ...payload } }
  return httpPost('/products/submit', payload)
}

export async function paymentStatus(auctionId) {
  if (useMock) { await new Promise((r)=>setTimeout(r,200)); return { status: 'PROCESSING', sent_email_at: new Date().toISOString() } }
  return httpGet(`/payments/${auctionId}/status`)
}

export async function startPayment(auctionId, payload) {
  if (useMock) { await new Promise((r)=>setTimeout(r,400)); return { ok: true, transaction_id: 'MOCKTX' } }
  return httpPost(`/payments/${auctionId}/pay`, payload)
}

