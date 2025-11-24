import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'
import NotificationBell from '../components/NotificationBell'
import { Building, Crown, DollarSign, Trophy, Package, UserCircle, LogOut, LogIn } from '../components/icons'

export default function SiteLayout({ children }) {
  const { user, signOut } = useAuth()
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-8 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-tight">
          <span className="text-retro-olive">Auctio</span>
          <span className="text-retro-coral">NOVA</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink 
            to="/" 
            className={({isActive})=>`
              flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
              ${isActive ? 'underline' : ''}
            `}
          >
            <Building className="w-6 h-6" />
            <span className="text-xs">Auctions</span>
          </NavLink>
          
          {user?.role === 'ADMIN' && (
            <NavLink 
              to="/admin" 
              className={({isActive})=>`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                ${isActive ? 'underline' : ''}
              `}
            >
              <Crown className="w-6 h-6" />
              <span className="text-xs">Admin</span>
            </NavLink>
          )}
          
          {user && (
            <>
              <NavLink 
                to="/my/bids" 
                className={({isActive})=>`
                  flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                  ${isActive ? 'underline' : ''}
                `}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-xs">My bids</span>
              </NavLink>
              
              <NavLink 
                to="/won-auctions" 
                className={({isActive})=>`
                  flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                  ${isActive ? 'underline' : ''}
                `}
              >
                <Trophy className="w-6 h-6" />
                <span className="text-xs">Won Auctions</span>
              </NavLink>
              
              <NavLink 
                to="/products/submit" 
                className={({isActive})=>`
                  flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                  ${isActive ? 'underline' : ''}
                `}
              >
                <Package className="w-6 h-6" />
                <span className="text-xs">Submit product</span>
              </NavLink>
              
              <NavLink 
                to="/account/profile" 
                className={({isActive})=>`
                  flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                  ${isActive ? 'underline' : ''}
                `}
              >
                <UserCircle className="w-6 h-6" />
                <span className="text-xs">Profile</span>
              </NavLink>
              
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-6 h-6 flex items-center justify-center" style={{ padding: '0', margin: '0' }}>
                  <NotificationBell />
                </div>
                <span className="text-xs">Notifications</span>
              </div>
              
              <button 
                onClick={signOut} 
                className="flex flex-col items-center gap-1 p-2 text-red-600 hover:text-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                aria-label="Sign out"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-xs">Sign out</span>
              </button>
            </>
          )}
          
          {!user && (
            <NavLink 
              to="/signin" 
              className={({isActive})=>`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                ${isActive ? 'underline' : ''}
              `}
            >
              <LogIn className="w-6 h-6" />
              <span className="text-xs">Sign in</span>
            </NavLink>
          )}
        </nav>
      </header>

      <main>
        {children ?? <Outlet />}
      </main>

      <footer className="mt-10 text-center text-xs text-black/50">
        © {new Date().getFullYear()} AuctioNOVA
      </footer>
    </div>
  )
}
