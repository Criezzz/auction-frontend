import { useState } from 'react'
import { createAuction } from '../features/admin/api'

export default function AdminCreateAuctionPage() {
  const [form, setForm] = useState({
    title: '', product_name: '', product_type: '', description: '', image_url: '',
    start_at: '', end_at: '', starting_price: '', price_step: '',
  })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setMsg(''); setError(''); setLoading(true)
    // basic validation
    if (!form.title || !form.product_name || !form.start_at || !form.end_at || !form.starting_price) {
      setError('Thiếu thông tin bắt buộc'); setLoading(false); return
    }
    if (new Date(form.end_at) <= new Date(form.start_at)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu'); setLoading(false); return
    }
    try {
      await createAuction(form)
      setMsg('Đăng ký phiên đấu giá mới thành công (mock)')
    } catch (e) { setError(e.message || 'Lỗi tạo phiên') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto bento-card p-6">
      <h1 className="font-display text-2xl">Đăng ký phiên đấu giá mới</h1>
      <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
        <label className="block col-span-2">
          <span className="text-sm">Tên phiên</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
        </label>
        <label className="block">
          <span className="text-sm">Tên sản phẩm</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.product_name} onChange={(e)=>setForm({...form,product_name:e.target.value})}/>
        </label>
        <label className="block">
          <span className="text-sm">Loại sản phẩm</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.product_type} onChange={(e)=>setForm({...form,product_type:e.target.value})}/>
        </label>
        <label className="block col-span-2">
          <span className="text-sm">Mô tả</span>
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
        </label>
        <label className="block col-span-2">
          <span className="text-sm">Ảnh sản phẩm (URL)</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.image_url} onChange={(e)=>setForm({...form,image_url:e.target.value})}/>
        </label>
        <label className="block">
          <span className="text-sm">Ngày bắt đầu</span>
          <input type="datetime-local" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.start_at} onChange={(e)=>setForm({...form,start_at:e.target.value})}/>
        </label>
        <label className="block">
          <span className="text-sm">Ngày kết thúc</span>
          <input type="datetime-local" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.end_at} onChange={(e)=>setForm({...form,end_at:e.target.value})}/>
        </label>
        <label className="block">
          <span className="text-sm">Giá khởi điểm</span>
          <input inputMode="numeric" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.starting_price} onChange={(e)=>setForm({...form,starting_price:e.target.value})}/>
        </label>
        <label className="block">
          <span className="text-sm">Bước giá</span>
          <input inputMode="numeric" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.price_step} onChange={(e)=>setForm({...form,price_step:e.target.value})}/>
        </label>
        {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}
        {msg && <div className="col-span-2 text-green-700 text-sm">{msg}</div>}
        <div className="col-span-2">
          <button className="btn-primary" disabled={loading}>{loading?'Đang tạo…':'Tạo phiên đấu giá'}</button>
        </div>
      </form>
    </div>
  )
}

