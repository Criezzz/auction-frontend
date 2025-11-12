import { Link, NavLink, Outlet } from 'react-router-dom'

export default function SiteLayout({ children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-8 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-tight">
          <span className="text-retro-olive">Auctio</span>
          <span className="text-retro-coral">NOVA</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/" className={({isActive})=>isActive? 'underline' : ''}>Auctions</NavLink>
          <NavLink to="/admin" className={({isActive})=>isActive? 'underline' : ''}>Admin</NavLink>
          <NavLink to="/my/bids" className={({isActive})=>isActive? 'underline' : ''}>My bids</NavLink>
          <NavLink to="/products/submit" className={({isActive})=>isActive? 'underline' : ''}>Submit product</NavLink>
          <NavLink to="/signin" className={({isActive})=>isActive? 'underline' : ''}>Sign in</NavLink>
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
