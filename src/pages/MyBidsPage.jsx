import { useEffect, useState } from 'react'
import { listMyBids, cancelBid } from '../features/user/api'

export default function MyBidsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setItems(await listMyBids())
      setLoading(false)
    })()
  }, [])

  async function onCancel(id) {
    await cancelBid(id)
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return (
    <div className="bento-card p-6">
      <h1 className="font-display text-2xl">Giá thầu của tôi</h1>
      {loading ? (
        <div className="mt-4">Đang tải…</div>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <div>
                <div className="text-sm">Auction #{b.auction_id}</div>
                <div className="text-xs text-black/60">{b.amount} — {b.status}</div>
              </div>
              <button className="rounded-xl border px-3 py-1" onClick={() => onCancel(b.id)}>Hủy</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

