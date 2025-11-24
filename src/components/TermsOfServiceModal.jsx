import { useState, useEffect } from 'react'
import { FileText } from './icons'
import { httpGet } from '../services/httpClient'
import { getAccessToken } from '../features/auth/authStore'

export default function TermsOfServiceModal({ isOpen, onClose, onAccept }) {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [termsContent, setTermsContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && !termsContent) {
      fetchTerms()
    }
  }, [isOpen])

  const fetchTerms = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = getAccessToken()
      const response = await fetch('http://localhost:8000/bank/terms', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        } else if (response.status >= 500) {
          throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.')
        } else {
          throw new Error('Không thể tải điều khoản dịch vụ.')
        }
      }

      const data = await response.json()
      setTermsContent(data.data.content || 'Terms content not available')
    } catch (err) {
      console.error('Error fetching terms:', err)
      if (err.message.includes('fetch')) {
        setError('Mất kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
      } else {
        setError(err.message || 'Lỗi khi tải điều khoản dịch vụ.')
      }
      // Fallback to hardcoded terms
      setTermsContent(getDefaultTerms())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultTerms = () => {
    return `
Auction Participation Terms

1. Deposit Requirements
All participants must place a deposit equal to 10% of the auction's starting price to be eligible for bidding. This deposit ensures serious participation and prevents frivolous bidding.

2. Deposit Handling
- Deposits will be held securely during the auction period
- Winning bidder: Deposit applied toward final payment
- Non-winning participants: Deposit refunded within 24 hours
- Deposits are non-refundable if participant withdraws after auction starts

3. Bidding Rules
- All bids must be higher than the current highest bid plus minimum increment
- Bidding is final once submitted and cannot be cancelled
- Participants must maintain active status throughout the auction
- Anti-sniping: Last-minute bids extend auction by 5 minutes

4. Payment Terms
- Winning bidder has 24 hours to complete full payment
- Acceptable payment methods: Bank transfer, Credit card, Cash
- Late payment (after 24h) results in deposit forfeiture
- Auction may be re-run at organizer's discretion

5. Product Delivery
- Shipping costs are responsibility of winning bidder
- Delivery time: 7-14 business days after payment confirmation
- Insurance provided for items over 500,000 VND
- Pickup option available at designated locations

6. Dispute Resolution
- All disputes will be handled through our customer service
- Evidence of product authenticity required for authenticity disputes
- Refunds processed within 5-7 business days if approved

7. Liability
Our platform facilitates auctions but is not responsible for product condition or authenticity beyond what is stated in product descriptions. All participants bid at their own risk.
    `
  }

  const handleAccept = () => {
    if (agreed) {
      onAccept()
      onClose()
      setAgreed(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-12 h-12 lg:w-16 lg:h-16" />
              <h2 className="text-xl font-semibold">Terms of Service</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-4">Auction Participation Terms</h3>
            
            <h4 className="font-semibold mt-4 mb-2">1. Deposit Requirements</h4>
            <p className="mb-4">
              All participants must place a deposit equal to 10% of the auction's starting price 
              to be eligible for bidding. This deposit ensures serious participation and 
              prevents frivolous bidding.
            </p>

            <h4 className="font-semibold mt-4 mb-2">2. Deposit Handling</h4>
            <ul className="mb-4 list-disc pl-5">
              <li>Deposits will be held securely during the auction period</li>
              <li>Winning bidder: Deposit applied toward final payment</li>
              <li>Non-winning participants: Deposit refunded within 24 hours</li>
              <li>Deposits are non-refundable if participant withdraws after auction starts</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">3. Bidding Rules</h4>
            <ul className="mb-4 list-disc pl-5">
              <li>All bids must be higher than the current highest bid plus minimum increment</li>
              <li>Bidding is final once submitted and cannot be cancelled</li>
              <li>Participants must maintain active status throughout the auction</li>
              <li>Anti-sniping: Last-minute bids extend auction by 5 minutes</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">4. Payment Terms</h4>
            <ul className="mb-4 list-disc pl-5">
              <li>Winning bidder has 24 hours to complete full payment</li>
              <li>Acceptable payment methods: Bank transfer, Credit card, Cash</li>
              <li>Late payment (after 24h) results in deposit forfeiture</li>
              <li>Auction may be re-run at organizer's discretion</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">5. Product Delivery</h4>
            <ul className="mb-4 list-disc pl-5">
              <li>Shipping costs are responsibility of winning bidder</li>
              <li>Delivery time: 7-14 business days after payment confirmation</li>
              <li>Insurance provided for items over 500,000 VND</li>
              <li>Pickup option available at designated locations</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">6. Dispute Resolution</h4>
            <ul className="mb-4 list-disc pl-5">
              <li>All disputes will be handled through our customer service</li>
              <li>Evidence of product authenticity required for authenticity disputes</li>
              <li>Refunds processed within 5-7 business days if approved</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">7. Liability</h4>
            <p className="mb-4">
              Our platform facilitates auctions but is not responsible for product condition 
              or authenticity beyond what is stated in product descriptions. All participants 
              bid at their own risk.
            </p>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agree" className="text-sm text-gray-700">
              I have read and agree to the Terms of Service and understand the deposit and payment requirements.
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!agreed}
              className={`flex-1 px-4 py-2 rounded-lg ${
                agreed 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              I Agree & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}