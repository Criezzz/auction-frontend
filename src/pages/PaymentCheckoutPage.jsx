import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { startPayment } from '../features/user/api'

export default function PaymentCheckoutPage() {
  const { id } = useParams()
  const [form, setForm] = useState({ method: 'BANK', card_number: '', note: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      const res = await startPayment(id, form)
      setMsg(`Thanh toán thành công (mock) — Mã giao dịch ${res.transaction_id}`)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bento-card p-6">
      <h1 className="font-display text-2xl">Thanh toán</h1>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <label className="block">
          <span className="text-sm">Phương thức</span>
          <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.method} onChange={(e)=>setForm({...form,method:e.target.value})}>
            <option>BANK</option>
            <option>COD</option>
          </select>
        </label>
        {form.method === 'BANK' && (
          <label className="block">
            <span className="text-sm">Số thẻ/ Mã tham chiếu</span>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.card_number} onChange={(e)=>setForm({...form,card_number:e.target.value})}/>
          </label>
        )}
        <label className="block">
          <span className="text-sm">Ghi chú</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})}/>
        </label>
        <button className="btn-primary w-full" disabled={loading}>{loading?'Đang xử lý…':'Thanh toán ngay'}</button>
      </form>
      {msg && <div className="mt-3 text-green-700 text-sm">{msg}</div>}
    </div>
  )
}

