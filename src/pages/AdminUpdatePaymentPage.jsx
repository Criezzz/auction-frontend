import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { updatePaymentStatus } from '../features/admin/api'

export default function AdminUpdatePaymentPage() {
  const { id } = useParams()
  const [form, setForm] = useState({ status: 'PAID', method: 'BANK', paid_at: '', notes: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    setError('')
    try {
      await updatePaymentStatus(id, form)
      setMsg('Cập nhật thành công')
    } catch (e) {
      setError(e.message || 'Lỗi cập nhật')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto bento-card p-6">
      <h1 className="font-display text-2xl">Cập nhật trạng thái thanh toán</h1>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <label className="block">
          <span className="text-sm">Trạng thái</span>
          <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
            <option>REQUESTED</option>
            <option>PROCESSING</option>
            <option>PAID</option>
            <option>FAILED</option>
            <option>REFUNDED</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Phương thức</span>
          <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.method} onChange={(e)=>setForm({...form,method:e.target.value})}>
            <option>BANK</option>
            <option>COD</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Thời gian thanh toán</span>
          <input type="datetime-local" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.paid_at} onChange={(e)=>setForm({...form,paid_at:e.target.value})}/>
        </label>
        <label className="block">
          <span className="text-sm">Ghi chú</span>
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/>
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        <button className="btn-primary" disabled={loading}>{loading? 'Đang lưu…':'Lưu cập nhật'}</button>
      </form>
    </div>
  )
}

