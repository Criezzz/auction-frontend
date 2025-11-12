import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { viewPostAuctionStatus } from '../features/user/api'

export default function PostAuctionStatusPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const x = await viewPostAuctionStatus(id)
        setData(x)
      } catch (e) { setError('Không tải được trạng thái') }
      finally { setLoading(false) }
    })()
  }, [id])

  if (loading) return <div className="bento-card p-6">Đang tải…</div>
  if (error) return <div className="bento-card p-6">{error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bento-card p-6">
        <h2 className="font-display text-xl">Thanh toán</h2>
        <div className="mt-2 text-sm text-black/70">Trạng thái: {data?.payment?.status}</div>
        <div className="text-sm text-black/70">Phương thức: {data?.payment?.method}</div>
        <div className="text-sm text-black/70">Yêu cầu lúc: {data?.payment?.requested_at}</div>
      </div>
      <div className="bento-card p-6">
        <h2 className="font-display text-xl">Sản phẩm</h2>
        <div className="mt-2 text-sm text-black/70">Trạng thái vận chuyển: {data?.product?.shipping_status}</div>
        <div className="text-sm text-black/70">Nhận hàng: {data?.product?.receiving_method}</div>
      </div>
    </div>
  )
}

