import { apiBase, httpGet, httpPost } from '../../services/httpClient'

const useMock = !apiBase()

export async function updatePaymentStatus(paymentId, payload) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 300))
    return { ok: true, id: paymentId, ...payload }
  }
  return httpPost(`/admin/payments/${paymentId}/status`, payload)
}

export async function updateProductStatus(productId, payload) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 300))
    return { ok: true, id: productId, ...payload }
  }
  return httpPost(`/admin/products/${productId}/status`, payload)
}

export async function updateAuctionResult(auctionId, payload) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 400))
    return { ok: true, auction_id: auctionId, ...payload }
  }
  return httpPost(`/admin/auctions/${auctionId}/result`, payload)
}

export async function createAuction(payload) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 400))
    return { ok: true, id: Math.floor(Math.random() * 10000), ...payload }
  }
  return httpPost(`/admin/auctions`, payload)
}

export async function listRegisteredAuctions() {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 200))
    return [
      { id: 101, title: 'Registered Auction A', status: 'OPEN' },
      { id: 102, title: 'Registered Auction B', status: 'DRAFT' },
    ]
  }
  return httpGet('/admin/auctions?status=REGISTERED')
}

export async function deleteAuction(auctionId) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 250))
    return { ok: true, id: auctionId }
  }
  return httpPost(`/admin/auctions/${auctionId}/delete`)
}

export async function listPendingProducts() {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 200))
    return [
      { id: 1, name: 'User submitted model', price: 100 },
    ]
  }
  return httpGet('/admin/products/pending')
}

export async function approveProduct(productId, payload = {}) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 200))
    return { ok: true, id: productId, ...payload }
  }
  return httpPost(`/admin/products/${productId}/approve`, payload)
}

export async function rejectProduct(productId, reason) {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 200))
    return { ok: true, id: productId, reason }
  }
  return httpPost(`/admin/products/${productId}/reject`, { reason })
}

