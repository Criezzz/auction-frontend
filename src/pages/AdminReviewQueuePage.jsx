import { useEffect, useState } from 'react'
import { listPendingProducts, approveProduct, rejectProduct } from '../features/admin/api'
import Modal from '../components/Modal'

function ProductCard({ item, onOpen }) {
  return (
    <article className="bento-card overflow-hidden cursor-pointer" onClick={() => onOpen(item)}>
      {item.image_url && (
        <div className="aspect-[4/3] overflow-hidden">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-display text-lg">{item.name}</h3>
        {item.price && <div className="price-chip mt-2 w-fit">{item.price}</div>}
      </div>
    </article>
  )}

export default function AdminReviewQueuePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try { setItems(await listPendingProducts()) }
      finally { setLoading(false) }
    })()
  }, [])

  async function onApprove() {
    try {
      await approveProduct(selected.id)
      setItems((xs) => xs.filter((x) => x.id !== selected.id))
      setSelected(null)
    } catch (e) { setError(e.message || 'Approve failed') }
  }

  async function onReject() {
    try {
      await rejectProduct(selected.id, reason)
      setItems((xs) => xs.filter((x) => x.id !== selected.id))
      setSelected(null)
      setReason('')
    } catch (e) { setError(e.message || 'Reject failed') }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Hàng chờ duyệt</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bento-card h-56 animate-pulse bg-white/60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bento-card p-6">Không có đề nghị nào.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <ProductCard key={it.id} item={it} onOpen={setSelected} />
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-3">
            <h2 className="font-display text-xl">Xem đề nghị sản phẩm</h2>
            {selected.image_url && (
              <img src={selected.image_url} alt={selected.name} className="rounded-xl w-full" />
            )}
            <div>
              <div className="text-sm font-semibold">{selected.name}</div>
              <div className="text-sm text-black/60">{selected.description || '—'}</div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center gap-2">
              <button className="rounded-xl border px-3 py-2" onClick={() => setSelected(null)}>Đóng</button>
              <button className="btn-primary" onClick={onApprove}>Duyệt</button>
              <div className="ml-auto" />
            </div>
            <div className="pt-2 border-t border-black/10">
              <div className="text-sm mb-1">Từ chối (lý do)</div>
              <div className="flex items-center gap-2">
                <input className="flex-1 rounded-xl border px-3 py-2" value={reason} onChange={(e)=>setReason(e.target.value)} />
                <button className="rounded-xl border px-3 py-2" onClick={onReject}>Từ chối</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

