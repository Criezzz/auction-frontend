import { useState, useEffect, useRef } from 'react'
import { getAccessToken } from '../features/auth/authStore'
import { apiBase } from '../services/httpClient'

class AuctionRealTimeService {
  constructor() {
    this.connections = new Map() // auction_id -> WebSocket
    this.listeners = new Map() // auction_id -> Set of listeners
  }

  connect(auctionId, token) {
    if (!token || this.connections.has(auctionId)) return

    const baseUrl = apiBase() || 'http://localhost:8000'
    const wsUrl = `${baseUrl.replace('http', 'ws')}/ws/auction/${auctionId}/${token}`
    
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log(`WebSocket connected for auction ${auctionId}`)
      this.emit(auctionId, 'connection_established', { auctionId })
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleAuctionMessage(auctionId, message)
      } catch (error) {
        console.error('Failed to parse auction WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      console.log(`WebSocket disconnected for auction ${auctionId}`)
      this.connections.delete(auctionId)
      this.emit(auctionId, 'connection_closed', { auctionId })
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error for auction ${auctionId}:`, error)
    }

    this.connections.set(auctionId, ws)
  }

  disconnect(auctionId) {
    const ws = this.connections.get(auctionId)
    if (ws) {
      ws.close()
      this.connections.delete(auctionId)
      this.listeners.delete(auctionId)
    }
  }

  disconnectAll() {
    this.connections.forEach((ws, auctionId) => {
      ws.close()
    })
    this.connections.clear()
    this.listeners.clear()
  }

  handleAuctionMessage(auctionId, message) {
    switch (message.type) {
      case 'auction_initial_data':
        this.emit(auctionId, 'auction_initial_data', message.data)
        break
      
      case 'bid_update':
        this.emit(auctionId, 'bid_update', message.data)
        break
      
      case 'auction_extended':
        this.emit(auctionId, 'auction_extended', message.data)
        break
      
      case 'auction_ending_soon':
        this.emit(auctionId, 'auction_ending_soon', message.data)
        break
      
      case 'auction_ended':
        this.emit(auctionId, 'auction_ended', message.data)
        break
      
      default:
        console.log('Unknown auction message type:', message.type)
        this.emit(auctionId, 'unknown', message)
    }
  }

  on(auctionId, event, callback) {
    if (!this.listeners.has(auctionId)) {
      this.listeners.set(auctionId, new Map())
    }
    
    if (!this.listeners.get(auctionId).has(event)) {
      this.listeners.get(auctionId).set(event, new Set())
    }
    
    this.listeners.get(auctionId).get(event).add(callback)
    
    // Return unsubscribe function
    return () => {
      const auctionListeners = this.listeners.get(auctionId)
      if (auctionListeners && auctionListeners.has(event)) {
        auctionListeners.get(event).delete(callback)
      }
    }
  }

  emit(auctionId, event, data) {
    const auctionListeners = this.listeners.get(auctionId)
    if (auctionListeners && auctionListeners.has(event)) {
      auctionListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in auction real-time listener:', error)
        }
      })
    }
  }
}

// Create singleton instance
const auctionRealTimeService = new AuctionRealTimeService()

export default auctionRealTimeService

// React hook for using auction real-time updates
export function useAuctionRealTime(auctionId) {
  const [data, setData] = useState(null)
  const [bids, setBids] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const token = getAccessToken()
  const unsubscribers = useRef([])

  useEffect(() => {
    if (!auctionId || !token) return

    // Connect to WebSocket
    auctionRealTimeService.connect(auctionId, token)

    // Set up listeners
    const unsubscribeConnection = auctionRealTimeService.on(auctionId, 'connection_established', () => {
      setIsConnected(true)
      setError(null)
    })

    const unsubscribeClosed = auctionRealTimeService.on(auctionId, 'connection_closed', () => {
      setIsConnected(false)
    })

    const unsubscribeInitial = auctionRealTimeService.on(auctionId, 'auction_initial_data', (auctionData) => {
      setData(auctionData)
      if (auctionData.bids) {
        setBids(auctionData.bids)
      }
    })

    const unsubscribeBidUpdate = auctionRealTimeService.on(auctionId, 'bid_update', (bidData) => {
      // Update current bid information
      setData(prev => prev ? {
        ...prev,
        current_highest_bid: bidData.new_highest_bid,
        highest_bidder_name: bidData.new_highest_bidder?.name || 'Anonymous',
        bid_count: bidData.total_bids,
        end_time: bidData.extended ? bidData.new_end_time : prev.end_time
      } : null)

      // Add new bid to bid list
      setBids(prev => {
        const newBid = {
          id: `temp_${Date.now()}`,
          bid_price: bidData.new_highest_bid,
          bidder_name: bidData.new_highest_bidder?.name || 'Anonymous',
          bid_timestamp: bidData.bid_timestamp,
          is_new: true
        }
        const updated = [...prev, newBid]
        // Remove is_new flag after animation
        setTimeout(() => {
          setBids(current => current.map(b => b.id === newBid.id ? { ...b, is_new: false } : b))
        }, 2000)
        return updated
      })

      // Show bid update animation
      animateBidUpdate()
    })

    const unsubscribeExtended = auctionRealTimeService.on(auctionId, 'auction_extended', (extensionData) => {
      setData(prev => prev ? {
        ...prev,
        end_time: extensionData.new_end_time
      } : null)
      showExtensionNotice()
    })

    const unsubscribeEndingSoon = auctionRealTimeService.on(auctionId, 'auction_ending_soon', (endingData) => {
      showEndingSoonNotice(endingData)
    })

    const unsubscribeEnded = auctionRealTimeService.on(auctionId, 'auction_ended', (endedData) => {
      setData(prev => prev ? {
        ...prev,
        auction_status: 'ended',
        winner: endedData.winner,
        final_price: endedData.final_price
      } : null)
      showAuctionEndedNotice(endedData)
    })

    // Store unsubscribers for cleanup
    unsubscribers.current = [
      unsubscribeConnection,
      unsubscribeClosed,
      unsubscribeInitial,
      unsubscribeBidUpdate,
      unsubscribeExtended,
      unsubscribeEndingSoon,
      unsubscribeEnded
    ]

    return () => {
      // Cleanup listeners
      unsubscribers.current.forEach(unsubscribe => unsubscribe && unsubscribe())
      auctionRealTimeService.disconnect(auctionId)
    }
  }, [auctionId, token])

  // Helper functions for animations and notifications
  const animateBidUpdate = () => {
    const bidElement = document.querySelector('.current-bid')
    if (bidElement) {
      bidElement.classList.add('bid-updated')
      setTimeout(() => {
        bidElement.classList.remove('bid-updated')
      }, 1000)
    }
  }

  const showExtensionNotice = () => {
    showNotice('🕐 Auction extended by 5 minutes!', 'info')
  }

  const showEndingSoonNotice = (data) => {
    showNotice(`${data.auction_name} is ending soon!`, 'warning')
  }

  const showAuctionEndedNotice = (data) => {
    if (data.winner) {
      showNotice(`Auction ended! Winner: ${data.winner.name} (${data.final_price} VND)`, 'success')
    } else {
      showNotice('Auction ended with no bids', 'info')
    }
  }

  const showNotice = (message, type = 'info') => {
    const notice = document.createElement('div')
    notice.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300`
    
    const bgColor = {
      'info': 'bg-blue-500 text-white',
      'success': 'bg-green-500 text-white',
      'warning': 'bg-yellow-500 text-black',
      'error': 'bg-red-500 text-white'
    }[type] || 'bg-gray-500 text-white'
    
    notice.classList.add(...bgColor.split(' '))
    notice.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg">&times;</button>
      </div>
    `
    
    document.body.appendChild(notice)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notice.parentElement) {
        notice.remove()
      }
    }, 5000)
  }

  return {
    data,
    bids,
    isConnected,
    error
  }
}