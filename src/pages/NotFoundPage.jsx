import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto bento-card p-6 text-center">
      <h1 className="font-display text-3xl">404</h1>
      <p className="text-black/60 mt-2">Page not found.</p>
      <Link className="btn-primary mt-4 inline-block" to="/">Go home</Link>
    </div>
  )
}

