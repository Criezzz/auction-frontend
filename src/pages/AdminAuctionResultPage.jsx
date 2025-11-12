import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { updateAuctionResult } from '../features/admin/api'

export default function AdminAuctionResultPage() {
  const { id } = useParams()
  const [form, setForm] = useState({ winner_user_id: '', sold_flag: true, note: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault(); setMsg(''); setError('')
    try {
      await updateAuctionResult(id, form)
      setMsg('Đã cập nhật kết quả & gửi email (mock)')
    } catch (e) { setError(e.message || 'Lỗi cập nhật') }
  }

  return (
    <div className="max-w-lg mx-auto bento-card p-6">
      <h1 className="font-display text-2xl">Cập nhật kết quả phiên</h1>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <label className="block">
          <span className="text-sm">Người trúng (user id/username)</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.winner_user_id} onChange={(e)=>setForm({...form,winner_user_id:e.target.value})}/>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.sold_flag} onChange={(e)=>setForm({...form,sold_flag:e.target.checked})}/>
          <span>Đánh dấu sản phẩm đã bán</span>
        </label>
        <label className="block">
          <span className="text-sm">Ghi chú</span>
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})}/>
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        <button className="btn-primary">Cập nhật</button>
      </form>
    </div>
  )
}

