'use client'

import { useEffect, useState, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import polyline from 'polyline-encoded'
import { Play, Pause, RotateCcw, Download } from 'lucide-react'

interface RunVisualizationProps {
  runData: {
    name: string
    distance: number
    duration: number
    start_date: string
    polyline: string | null
    average_speed?: number
    total_elevation_gain?: number
  }
}

export default function RunVisualization({ runData }: RunVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const animationRef = useRef<number | undefined>(undefined)
  const routeCoordinates = useRef<[number, number][]>([])
  const markerRef = useRef<maplibregl.Marker | null>(null)

  // Format stats
  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const formatPace = (distance: number, duration: number) => {
    const km = distance / 1000
    const minutes = duration / 60
    const paceMinutes = Math.floor(minutes / km)
    const paceSeconds = Math.round((minutes / km - paceMinutes) * 60)
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} /km`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !runData.polyline) return

    // Decode polyline
    try {
      const decoded = polyline.decode(runData.polyline)
      routeCoordinates.current = decoded.map(([lat, lng]) => [lng, lat])
    } catch (e) {
      console.error('Failed to decode polyline:', e)
      return
    }

    if (routeCoordinates.current.length === 0) return

    // Calculate bounds
    const bounds = routeCoordinates.current.reduce(
      (bounds, coord) => {
        return [
          [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
          [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])]
        ]
      },
      [[180, 90], [-180, -90]]
    )

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
            attribution: '© OpenStreetMap Contributors',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      bounds: bounds as [[number, number], [number, number]],
      fitBoundsOptions: { padding: 50 },
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Add route
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates.current,
          },
        },
      })

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF6B6B',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      })

      // Add progress line (for animation)
      map.current.addSource('progress', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      })

      map.current.addLayer({
        id: 'progress',
        type: 'line',
        source: 'progress',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#4ECDC4',
          'line-width': 6,
          'line-opacity': 1,
        },
      })

      // Add start marker
      new maplibregl.Marker({ color: '#4ECDC4' })
        .setLngLat(routeCoordinates.current[0])
        .addTo(map.current)

      // Add end marker
      new maplibregl.Marker({ color: '#FF6B6B' })
        .setLngLat(routeCoordinates.current[routeCoordinates.current.length - 1])
        .addTo(map.current)

      // Add moving marker
      const el = document.createElement('div')
      el.className = 'moving-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.backgroundColor = '#FFD93D'
      el.style.border = '3px solid white'
      el.style.borderRadius = '50%'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      markerRef.current = new maplibregl.Marker(el)
        .setLngLat(routeCoordinates.current[0])
        .addTo(map.current)
    })

    return () => {
      map.current?.remove()
    }
  }, [runData.polyline])

  // Animation logic
  const animate = () => {
    if (!map.current || routeCoordinates.current.length === 0) return

    setProgress((prev) => {
      const newProgress = Math.min(prev + 0.5, 100)
      const index = Math.floor((newProgress / 100) * routeCoordinates.current.length)
      const progressCoords = routeCoordinates.current.slice(0, index)

      // Update progress line
      const source = map.current?.getSource('progress') as maplibregl.GeoJSONSource
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: progressCoords,
          },
        })
      }

      // Update marker position
      if (markerRef.current && progressCoords.length > 0) {
        markerRef.current.setLngLat(progressCoords[progressCoords.length - 1])
      }

      if (newProgress >= 100) {
        setIsPlaying(false)
        return 100
      }

      return newProgress
    })

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setProgress(0)

    // Reset progress line
    const source = map.current?.getSource('progress') as maplibregl.GeoJSONSource
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      })
    }

    // Reset marker
    if (markerRef.current && routeCoordinates.current.length > 0) {
      markerRef.current.setLngLat(routeCoordinates.current[0])
    }
  }

  const handleDownload = async () => {
    // In a real app, this would generate and download a video file
    alert('Video download would be implemented here with Remotion rendering')
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">{runData.name}</h2>
        <p className="text-blue-100 mb-4">{formatDate(runData.start_date)}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Distance</p>
            <p className="text-2xl font-bold">{formatDistance(runData.distance)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Duration</p>
            <p className="text-2xl font-bold">{formatDuration(runData.duration)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Pace</p>
            <p className="text-2xl font-bold">{formatPace(runData.distance, runData.duration)}</p>
          </div>
          {runData.total_elevation_gain && (
            <div>
              <p className="text-blue-100 text-sm">Elevation</p>
              <p className="text-2xl font-bold">{Math.round(runData.total_elevation_gain)}m</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Visualization */}
      {runData.polyline ? (
        <>
          <div
            ref={mapContainer}
            className="w-full h-[500px] bg-gray-200"
            style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}
          />

          {/* Animation Controls */}
          <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={handlePlayPause}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Play Animation'}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Video
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Animation Progress: {progress.toFixed(0)}%
            </p>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-8 text-center">
          <p className="text-gray-600">No route data available for this run.</p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure your Strava activity has GPS data.
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click "Play Animation" to see your route animated on the map.
          This shows how you progressed through your run!
        </p>
      </div>
    </div>
  )
}