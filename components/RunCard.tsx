'use client'

import Link from 'next/link'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface RunCardProps {
  run: {
    id: string
    name: string
    distance: number
    duration: number
    start_date: string
  }
}

export default function RunCard({ run }: RunCardProps) {
  const formattedDistance = (run.distance / 1000).toFixed(2) + ' km'
  const formattedDuration = new Date(run.duration * 1000).toISOString().substr(11, 8)
  const formattedDate = new Date(run.start_date).toLocaleDateString()

  return (
    <Link href={`/run/${run.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-100">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">{run.name}</h3>

        <div className="space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{formattedDistance}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formattedDuration}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}