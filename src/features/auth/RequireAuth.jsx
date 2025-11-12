import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function RequireAuth({ children, role }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/signin" state={{ from: loc }} replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

