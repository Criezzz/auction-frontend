import { useEffect, useState } from 'react'
import { deleteAuction, listRegisteredAuctions } from '../features/admin/api'
import Modal from '../components/Modal'

export default function AdminRegisteredAuctionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try { setItems(await listRegisteredAuctions()) }
      finally { setLoading(false) }
    })()
  }, [])

  async function onDelete() {
    try {
      await deleteAuction(confirmId)
      setItems((xs) => xs.filter((x) => `${x.id}` !== `${confirmId}`))
      setConfirmId(null)
    } catch (e) { setError(e.message || 'Không thể xóa') }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Phiên đã đăng ký</h1>
      {loading ? (
        <div className="bento-card p-6">Đang tải…</div>
      ) : items.length === 0 ? (
        <div className="bento-card p-6">Không có phiên phù hợp.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-black/60">#{a.id} · {a.status}</div>
              </div>
              <button className="rounded-xl border px-3 py-1" onClick={() => setConfirmId(a.id)}>Xóa</button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)}>
        <h2 className="font-display text-xl">Xác nhận xóa</h2>
        <p className="text-black/60 mt-2">Bạn có chắc muốn xóa phiên #{confirmId}? Hành động này chỉ cho phép khi phiên chưa mở và chưa có người đăng ký.</p>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        <div className="mt-4 flex gap-2 justify-end">
          <button className="rounded-xl border px-3 py-2" onClick={() => setConfirmId(null)}>Hủy</button>
          <button className="btn-primary" onClick={onDelete}>Xóa</button>
        </div>
      </Modal>
    </div>
  )
}

