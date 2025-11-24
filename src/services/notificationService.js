import { getAccessToken } from '../features/auth/authStore'
import { apiBase } from './httpClient'

class NotificationService {
  constructor() {
    this.ws = null
    this.sse = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
    this.isConnected = false
  }

  // WebSocket connection for general notifications
  connectWebSocket() {
    const token = getAccessToken()
    if (!token) return

    try {
      const baseUrl = apiBase() || 'http://localhost:8000'
      const wsUrl = `${baseUrl.replace('http', 'ws')}/ws/notifications/${token}`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected for notifications')
        this.reconnectAttempts = 0
        this.isConnected = true
        this.emit('connection_established', { connected: true })
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        // Don't attempt reconnect automatically to avoid infinite loops
      }

      this.ws.onerror = (error) => {
        console.warn('WebSocket connection failed (this is normal in development):', error.message)
        this.isConnected = false
      }
    } catch (error) {
      console.warn('Failed to create WebSocket connection:', error)
    }
  }

  // SSE connection for notifications
  connectSSE() {
    const token = getAccessToken()
    if (!token) return

    const baseUrl = apiBase() || 'http://localhost:8000'
    const sseUrl = `${baseUrl}/sse/notifications`
    
    this.sse = new EventSource(sseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    this.sse.onopen = () => {
      console.log('SSE connected for notifications')
    }

    this.sse.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data)
      this.emit('sse_connected', data)
    })

    this.sse.addEventListener('unread_count', (event) => {
      const data = JSON.parse(event.data)
      this.emit('unread_count', data)
    })

    this.sse.addEventListener('notification', (event) => {
      const data = JSON.parse(event.data)
      this.emit('notification', data)
    })

    this.sse.addEventListener('heartbeat', (event) => {
      console.log('SSE heartbeat received')
    })

    this.sse.onerror = (error) => {
      console.error('SSE error:', error)
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'connection_established':
        this.emit('connection_established', message.data)
        break
      
      case 'unread_count':
        this.emit('unread_count', message.data)
        break
      
      case 'bid_outbid':
        this.emit('bid_outbid', message.data)
        this.showOutbidNotification(message.data)
        break
      
      case 'bid_update':
        this.emit('bid_update', message.data)
        break
      
      case 'auction_ending_soon':
        this.emit('auction_ending_soon', message.data)
        this.showEndingSoonNotification(message.data)
        break
      
      case 'auction_ended':
        this.emit('auction_ended', message.data)
        break
      
      case 'auction_won':
        this.emit('auction_won', message.data)
        this.showWonNotification(message.data)
        break
      
      case 'payment_required':
        this.emit('payment_required', message.data)
        this.showPaymentNotification(message.data)
        break
      
      case 'heartbeat':
        // Handle keep-alive
        break
      
      default:
        console.log('Unknown message type:', message.type)
        this.emit('unknown', message)
    }
  }

  showOutbidNotification(data) {
    if (Notification.permission === 'granted') {
      new Notification('You have been outbid!', {
        body: `New bid: ${data.new_bid_price} VND in ${data.auction_name}`,
        icon: '/favicon.ico'
      })
    }
    this.showToast(`You have been outbid! New bid: ${data.new_bid_price} VND`, 'warning')
  }

  showEndingSoonNotification(data) {
    this.showToast(`${data.auction_name} is ending soon!`, 'info')
  }

  showWonNotification(data) {
    this.showToast(`Congratulations! You won ${data.auction_name}!`, 'success')
    if (Notification.permission === 'granted') {
      new Notification('Auction Won!', {
        body: `You won ${data.auction_name} for ${data.final_price} VND`,
        icon: '/favicon.ico'
      })
    }
  }

  showPaymentNotification(data) {
    this.showToast(`Payment required for ${data.auction_name}`, 'info')
    if (Notification.permission === 'granted') {
      new Notification('Payment Required', {
        body: `Please complete payment for ${data.auction_name}`,
        icon: '/favicon.ico'
      })
    }
  }

  showToast(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`
    
    const bgColor = {
      'info': 'bg-blue-500 text-white',
      'success': 'bg-green-500 text-white',
      'warning': 'bg-yellow-500 text-black',
      'error': 'bg-red-500 text-white'
    }[type] || 'bg-gray-500 text-white'
    
    toast.classList.add(...bgColor.split(' '))
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg">&times;</button>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove()
        }
      }, 300)
    }, 5000)
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting WebSocket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        this.connectWebSocket()
      }, 3000 * this.reconnectAttempts) // Exponential backoff
    }
  }

  // Event emitter functionality
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  emit(event, data) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in notification listener:', error)
        }
      })
    }
  }

  // Connect to both WebSocket and SSE with error handling
  connect() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    // Connect with timeout and error handling
    setTimeout(() => {
      try {
        this.connectWebSocket()
      } catch (error) {
        console.warn('WebSocket connection failed:', error)
      }
    }, 100)

    setTimeout(() => {
      try {
        this.connectSSE()
      } catch (error) {
        console.warn('SSE connection failed:', error)
      }
    }, 200)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    if (this.sse) {
      this.sse.close()
      this.sse = null
    }
    
    this.isConnected = false
  }

  // Get notification count
  getUnreadCount() {
    return new Promise((resolve, reject) => {
      const token = getAccessToken()
      if (!token) {
        resolve(0)
        return
      }

      const baseUrl = apiBase() || 'http://localhost:8000'
      fetch(`${baseUrl}/notifications/unread/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => resolve(data.count || 0))
      .catch(error => {
        console.error('Failed to get unread count:', error)
        resolve(0)
      })
    })
  }

  // Mark notification as read
  markAsRead(notificationId) {
    return new Promise((resolve, reject) => {
      const token = getAccessToken()
      if (!token) {
        resolve(false)
        return
      }

      const baseUrl = apiBase() || 'http://localhost:8000'
      fetch(`${baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(error => {
        console.error('Failed to mark notification as read:', error)
        resolve(false)
      })
    })
  }

  // Mark all notifications as read
  markAllAsRead() {
    return new Promise((resolve, reject) => {
      const token = getAccessToken()
      if (!token) {
        resolve(false)
        return
      }

      const baseUrl = apiBase() || 'http://localhost:8000'
      fetch(`${baseUrl}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(error => {
        console.error('Failed to mark all notifications as read:', error)
        resolve(false)
      })
    })
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService