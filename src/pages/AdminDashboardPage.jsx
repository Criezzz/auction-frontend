import { useAuth } from '../features/auth/AuthProvider'

export default function AdminDashboardPage() {
  const { user, signOut } = useAuth()
  return (
    <div className="bento-card p-6">
      <h1 className="font-display text-2xl">Admin Dashboard</h1>
      <p className="text-black/60 mt-2">Signed in as {user?.username || user?.email}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a className="btn-primary" href="/admin/auctions/new">Đăng ký phiên mới</a>
        <a className="rounded-xl border px-3 py-2" href="/admin/review">Hàng chờ duyệt</a>
        <a className="rounded-xl border px-3 py-2" href="/admin/auctions/registered">Phiên đã đăng ký</a>
        <a className="rounded-xl border px-3 py-2" href="/admin/payments/1/update">Cập nhật thanh toán</a>
        <a className="rounded-xl border px-3 py-2" href="/admin/products/1/status">Cập nhật trạng thái sản phẩm</a>
        <a className="rounded-xl border px-3 py-2" href="/admin/auctions/1/result">Cập nhật kết quả phiên</a>
      </div>
      <button className="btn-primary mt-4" onClick={signOut}>Sign out</button>
    </div>
  )
}
