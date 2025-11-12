import AuctionCard from './AuctionCard'

export default function AuctionGrid({ items = [], onBid }) {
  if (!items?.length) {
    return (
      <div className="text-center text-black/60">No auctions yet.</div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
      {items.map((a, idx) => (
        <AuctionCard
          key={a.id}
          auction={a}
          featured={idx === 0}
          onBid={onBid}
        />
      ))}
    </div>
  )
}

