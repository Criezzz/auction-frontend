import { httpGet, httpPost } from '../../services/httpClient'

export async function fetchAuctions() {
  const data = await httpGet('/auctions')
  return Array.isArray(data) ? data : data?.items || []
}

export async function fetchAuction(id) {
  return await httpGet(`/auctions/${id}`)
}

// Updated for API v2.1 - Now requires deposit validation
export async function createBid(auctionId, { bid_price }) {
  return await httpPost('/bids/place', { auction_id: parseInt(auctionId), bid_price: parseFloat(bid_price) })
}

// NEW v2.1: Check user's bidding status for an auction
export async function getBiddingStatus(auctionId) {
  return await httpPost(`/bids/auction/${auctionId}/my-status`)
}

// NEW v2.1: Get highest bid for auction
export async function getHighestBid(auctionId) {
  return await httpGet(`/bids/auction/${auctionId}/highest`)
}

// NEW v2.1: Get all bids for auction
export async function getAuctionBids(auctionId) {
  return await httpGet(`/bids/auction/${auctionId}`)
}
