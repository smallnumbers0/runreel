'use client'

import { Download, Share2 } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  runName: string
}

export default function VideoPlayer({ videoUrl, runName }: VideoPlayerProps) {
  const handleDownload = async () => {
    const response = await fetch(videoUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${runName.replace(/[^a-z0-9]/gi, '_')}_runreel.mp4`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Check out my run: ${runName}`,
        text: 'Created with RunReel',
        url: window.location.href,
      })
    } else {
      // Copy to clipboard as fallback
      navigator.clipboard.writeText(window.location.href)
      alert('Video link copied to clipboard!')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          src={videoUrl}
          controls
          className="w-full"
          style={{ maxHeight: '80vh' }}
          playsInline
        />
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Video
        </button>

        <button
          onClick={handleShare}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  )
}