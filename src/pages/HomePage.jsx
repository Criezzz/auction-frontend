import { useMemo, useState } from 'react'
import AuctionGrid from '../components/AuctionGrid'
import BidModal from '../components/BidModal'
import useAuctions from '../hooks/useAuctions'

export default function HomePage() {
  const { data, loading } = useAuctions()
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')

  const filtered = useMemo(() => {
    let items = data
    if (query) {
      const q = query.toLowerCase()
      items = items.filter((x) => (x.title || '').toLowerCase().includes(q))
    }
    if (status !== 'ALL') {
      items = items.filter((x) => (x.status || 'OPEN') === status)
    }
    return items
  }, [data, query, status])

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <input
            placeholder="Tìm kiếm…"
            className="w-full rounded-xl border border-black/15 px-3 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border border-black/15 px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">Tất cả</option>
          <option value="OPEN">Đang mở</option>
          <option value="DRAFT">Nháp</option>
          <option value="FINISHED">Đã kết thúc</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bento-card h-56 animate-pulse bg-white/60" />
          ))}
        </div>
      ) : (
        <AuctionGrid items={filtered} onBid={(a) => setSelected(a)} />
      )}
      <BidModal open={!!selected} auction={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

