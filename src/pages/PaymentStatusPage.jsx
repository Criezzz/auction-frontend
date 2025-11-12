import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { paymentStatus } from '../features/user/api'

export default function PaymentStatusPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    ;(async () => setData(await paymentStatus(id)))()
  }, [id])

  if (!data) return <div className="bento-card p-6">Đang tải…</div>
  return (
    <div className="bento-card p-6">
      <h1 className="font-display text-2xl">Trạng thái thanh toán</h1>
      <div className="mt-2 text-sm">Trạng thái: {data.status}</div>
      {data.sent_email_at && <div className="text-sm">Email gửi lúc: {data.sent_email_at}</div>}
    </div>
  )
}

