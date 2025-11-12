import { useMemo } from 'react'
import { Link } from 'react-router-dom'

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `$${value}`
  }
}

function useTimeLeft(iso) {
  return useMemo(() => {
    const end = new Date(iso)
    const now = new Date()
    const diff = Math.max(0, end - now)
    const sec = Math.floor(diff / 1000)
    const d = Math.floor(sec / 86400)
    const h = Math.floor((sec % 86400) / 3600)
    const m = Math.floor((sec % 3600) / 60)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }, [iso])
}

export default function AuctionCard({ auction, featured = false, onBid }) {
  const timeLeft = useTimeLeft(auction.end_time)
  const price = formatCurrency(auction.current_price)

  return (
    <article
      className={
        'bento-card overflow-hidden flex flex-col ' +
        (featured ? 'md:col-span-2 lg:col-span-2 lg:row-span-2' : '')
      }
    >
      <Link to={`/auction/${auction.id}`} className="relative aspect-[4/3] overflow-hidden block">
        <img
          src={auction.image_url}
          alt={auction.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-snappy hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0" />
        <div className="absolute left-3 top-3 price-chip bg-white/80 backdrop-blur-md">
          {price}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-xl md:text-2xl tracking-tight">{auction.title}</h3>
        {auction.subtitle && (
          <p className="text-sm text-black/60 line-clamp-2">{auction.subtitle}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <div className="text-sm text-black/70">
            Ends in <span className="font-semibold">{timeLeft}</span>
          </div>
          <button className="btn-primary" onClick={() => onBid?.(auction)}>
            Place bid
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path d="M13.5 4.5a.75.75 0 0 0 0 1.5h4.69L6.97 17.22a.75.75 0 1 0 1.06 1.06L19.25 7.06v4.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5Z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
