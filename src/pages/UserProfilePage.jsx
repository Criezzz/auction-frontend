import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthProvider'
import { UserCircle } from '../components/icons'

export default function UserProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_num: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_num: user.phone_num || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // TODO: Connect to API endpoint
      // const response = await fetch('/accounts/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAccessToken()}`
      //   },
      //   body: JSON.stringify(formData)
      // })

      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('Profile updated successfully!')
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!user) {
    return <div className="bento-card p-6">Please sign in to view your profile.</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bento-card p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <UserCircle className="w-12 h-12 lg:w-16 lg:h-16" />
          <h1 className="font-display text-2xl">User Profile</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/15 px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/15 px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-black/15 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_num"
              value={formData.phone_num}
              onChange={handleChange}
              className="w-full rounded-xl border border-black/15 px-3 py-2"
              placeholder="+1234567890"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}