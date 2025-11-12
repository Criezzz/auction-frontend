import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { updateProductStatus } from '../features/admin/api'

export default function AdminProductStatusPage() {
  const { id } = useParams()
  const [form, setForm] = useState({ shipping_status: 'PREPARING', receiving_method: 'Pick-up' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setMsg(''); setError('')
    try {
      await updateProductStatus(id, form)
      setMsg('Cập nhật thành công')
    } catch (e) {
      setError(e.message || 'Lỗi cập nhật')
    }
  }

  return (
    <div className="max-w-lg mx-auto bento-card p-6">
      <h1 className="font-display text-2xl">Cập nhật trạng thái sản phẩm</h1>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <label className="block">
          <span className="text-sm">Trạng thái vận chuyển</span>
          <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.shipping_status} onChange={(e)=>setForm({...form,shipping_status:e.target.value})}>
            <option>NONE</option><option>PREPARING</option><option>SHIPPED</option><option>DELIVERED</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Phương thức nhận hàng</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.receiving_method} onChange={(e)=>setForm({...form,receiving_method:e.target.value})}/>
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        <button className="btn-primary">Lưu</button>
      </form>
    </div>
  )
}

