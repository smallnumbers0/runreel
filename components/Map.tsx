'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import polyline from 'polyline-encoded'
import { motion } from 'framer-motion'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapProps {
  polylineString: string
  isAnimating?: boolean
  onAnimationComplete?: () => void
}

export default function Map({ polylineString, isAnimating = false, onAnimationComplete }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const animationMarker = useRef<maplibregl.Marker | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!mapContainer.current || !polylineString) return

    // Decode polyline
    const coordinates = polyline.decode(polylineString).map(([lat, lng]) => [lng, lat] as [number, number])

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: coordinates[0],
      zoom: 13
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Add the route line
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      })

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FF4500',
          'line-width': 4,
          'line-opacity': 0.8
        }
      })

      // Fit map to route bounds
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord as [number, number])
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))

      map.current.fitBounds(bounds, { padding: 50 })

      // Add start and end markers
      new maplibregl.Marker({ color: '#22C55E' })
        .setLngLat(coordinates[0])
        .addTo(map.current)

      new maplibregl.Marker({ color: '#EF4444' })
        .setLngLat(coordinates[coordinates.length - 1])
        .addTo(map.current)

      // Create animation marker
      const el = document.createElement('div')
      el.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg'
      animationMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat(coordinates[0])
        .addTo(map.current)
    })

    return () => {
      map.current?.remove()
    }
  }, [polylineString])

  // Handle animation
  useEffect(() => {
    if (!isAnimating || !map.current || !animationMarker.current) return

    const coordinates = polyline.decode(polylineString).map(([lat, lng]) => [lng, lat] as [number, number])
    let animationFrame: number
    const duration = 10000 // 10 seconds
    const start = Date.now()

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setProgress(progress * 100)

      // Calculate position along route
      const totalPoints = coordinates.length
      const currentIndex = Math.floor(progress * (totalPoints - 1))
      const nextIndex = Math.min(currentIndex + 1, totalPoints - 1)
      const localProgress = (progress * (totalPoints - 1)) % 1

      // Interpolate between points
      const lng = coordinates[currentIndex][0] + (coordinates[nextIndex][0] - coordinates[currentIndex][0]) * localProgress
      const lat = coordinates[currentIndex][1] + (coordinates[nextIndex][1] - coordinates[currentIndex][1]) * localProgress

      animationMarker.current?.setLngLat([lng, lat])

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        onAnimationComplete?.()
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isAnimating, polylineString, onAnimationComplete])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      {isAnimating && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Progress</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-full rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}