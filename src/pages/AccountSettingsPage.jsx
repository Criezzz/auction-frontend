import { useState } from 'react'
import { useAuth } from '../features/auth/AuthProvider'

export default function AccountSettingsPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ first_name: user?.first_name||'', last_name: user?.last_name||'', phone: '', address: '' })
  const [msg, setMsg] = useState('')

  function save(e) {
    e.preventDefault()
    // stub: just show success
    setMsg('Đã lưu (mock)')
  }

  return (
    <div className="max-w-xl mx-auto bento-card p-6">
      <h1 className="font-display text-2xl">Cài đặt tài khoản</h1>
      <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={save}>
        <label className="block"><span className="text-sm">Họ</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.first_name} onChange={(e)=>setForm({...form,first_name:e.target.value})}/>
        </label>
        <label className="block"><span className="text-sm">Tên</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.last_name} onChange={(e)=>setForm({...form,last_name:e.target.value})}/>
        </label>
        <label className="block md:col-span-2"><span className="text-sm">SĐT</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/>
        </label>
        <label className="block md:col-span-2"><span className="text-sm">Địa chỉ</span>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})}/>
        </label>
        <div className="md:col-span-2">
          <button className="btn-primary">Lưu</button>
          {msg && <span className="ml-3 text-green-700 text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  )
}

