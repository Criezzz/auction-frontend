import { useState } from 'react'
import { submitProduct } from '../features/user/api'

export default function SubmitProductPage() {
  const [form, setForm] = useState({ name: '', description: '', image_url: '', starting_price: '', price_step: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault(); setMsg(''); setError('')
    if (!form.name || !form.starting_price) { setError('Thiếu thông tin bắt buộc'); return }
    try {
      await submitProduct(form)
      setMsg('Đã gửi yêu cầu đăng ký sản phẩm (mock)')
    } catch (e) { setError(e.message || 'Lỗi gửi yêu cầu') }
  }

  return (
    <div className="max-w-xl mx-auto bento-card p-6">
      <h1 className="font-display text-2xl">Đăng ký sản phẩm</h1>
      <form className="space-y-3 mt-4" onSubmit={submit}>
        <label className="block"><span className="text-sm">Tên</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
        </label>
        <label className="block"><span className="text-sm">Mô tả</span>
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
        </label>
        <label className="block"><span className="text-sm">Ảnh (URL)</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.image_url} onChange={(e)=>setForm({...form,image_url:e.target.value})}/>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-sm">Giá khởi điểm</span>
            <input inputMode="numeric" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.starting_price} onChange={(e)=>setForm({...form,starting_price:e.target.value})}/>
          </label>
          <label className="block"><span className="text-sm">Bước giá</span>
            <input inputMode="numeric" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.price_step} onChange={(e)=>setForm({...form,price_step:e.target.value})}/>
          </label>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        <button className="btn-primary">Gửi yêu cầu</button>
      </form>
    </div>
  )
}

