import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAuction } from '../features/auctions/api'
import { registerForAuction } from '../features/user/api'
import BidModal from '../components/BidModal'

export default function AuctionDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const item = await fetchAuction(id, { signal: controller.signal })
        setData(item)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [id])

  const [openBid, setOpenBid] = useState(false)
  const [regMsg, setRegMsg] = useState('')

  if (loading) return <div className="bento-card p-6">Loading…</div>
  if (error) return <div className="bento-card p-6">Failed to load.</div>
  if (!data) return <div className="bento-card p-6">Not found.</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bento-card overflow-hidden">
        <img src={data.image_url} alt={data.title} className="w-full object-cover" />
      </div>
      <div className="bento-card p-6 flex flex-col gap-4">
        <h1 className="font-display text-3xl tracking-tight">{data.title}</h1>
        <p className="text-black/70">{data.description || 'No description.'}</p>
        <div className="price-chip w-fit">${data.current_price ?? '—'}</div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => setOpenBid(true)}>Place bid</button>
          <button
            className="rounded-xl border px-3 py-2"
            onClick={async () => {
              await registerForAuction(id)
              setRegMsg('Đã đăng ký tham gia (mock)')
            }}
          >
            Đăng ký tham gia
          </button>
        </div>
        {regMsg && <div className="text-sm text-green-700">{regMsg}</div>}

        {data.status === 'FINISHED' && (
          <div className="mt-2 rounded-xl border border-black/15 bg-white/60 p-3">
            <div className="text-sm">Phiên đã kết thúc. Theo dõi tiến độ thanh toán:</div>
            <Link to={`/payment/${id}`} className="btn-primary mt-2 inline-block">Xem trạng thái thanh toán</Link>
          </div>
        )}
      </div>
      <BidModal open={openBid} onClose={() => setOpenBid(false)} auction={data} />
    </div>
  )
}

