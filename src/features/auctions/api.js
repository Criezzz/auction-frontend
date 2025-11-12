import { httpGet, httpPost, apiBase } from '../../services/httpClient'

export async function fetchAuctions() {
  const base = apiBase()
  if (!base) throw new Error('No API base configured')
  const data = await httpGet('/auctions')
  return Array.isArray(data) ? data : data?.items || []
}

export async function fetchAuction(id) {
  const base = apiBase()
  if (!base) throw new Error('No API base configured')
  return await httpGet(`/auctions/${id}`)
}

export async function createBid(auctionId, { amount }) {
  const base = apiBase()
  if (!base) {
    // mock success
    await new Promise((r) => setTimeout(r, 300))
    return { id: Math.random().toString(36).slice(2), auction_id: auctionId, amount, status: 'VALID' }
  }
  return await httpPost(`/auctions/${auctionId}/bids`, { amount })
}
