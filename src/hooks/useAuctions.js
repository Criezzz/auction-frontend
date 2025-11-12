import { useEffect, useState } from 'react'
import { fetchAuctions } from '../features/auctions/api'

const mockAuctions = [
  {
    id: 1,
    title: 'Retro Cassette Player',
    subtitle: 'Pristine walkman, 1987 edition',
    image_url:
      'https://images.unsplash.com/photo-1512427691650-1b53f1babe5b?q=80&w=1200&auto=format&fit=crop',
    current_price: 120,
    end_time: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    title: 'Polaroid SX-70 Camera',
    subtitle: 'Fully functional, leather trim',
    image_url:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
    current_price: 240,
    end_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    title: 'Vintage Typewriter',
    subtitle: 'Olive finish with new ribbon',
    image_url:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    current_price: 310,
    end_time: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 4,
    title: 'Arcade Joystick',
    subtitle: 'Sanwa parts, USB-C',
    image_url:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    current_price: 95,
    end_time: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 5,
    title: 'Floppy Disk Bundle',
    subtitle: 'Sealed 3.5" assortment',
    image_url:
      'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?q=80&w=1200&auto=format&fit=crop',
    current_price: 45,
    end_time: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 6,
    title: 'CRT Monitor 14"',
    subtitle: 'Warm glow, immaculate shell',
    image_url:
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
    current_price: 410,
    end_time: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
  },
]

export default function useAuctions() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const items = await fetchAuctions({ signal: controller.signal })
        setData(items)
      } catch (e) {
        setError(e)
        setData(mockAuctions)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  return { data, loading, error }
}
