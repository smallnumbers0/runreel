'use client'

export default function SimpleVideoPlayer({ videoUrl }: { videoUrl: string }) {
  // Use a working sample video if the URL is invalid
  const fallbackVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
        <video
          controls
          autoPlay
          muted
          playsInline
          className="w-full h-full"
          onError={(e) => {
            console.error('Video error:', e)
            // Try fallback video on error
            const video = e.currentTarget
            if (video.src !== fallbackVideo) {
              video.src = fallbackVideo
            }
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={fallbackVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This is a sample video for demonstration.
          In production, this would be an animated visualization of your run route.
        </p>
      </div>
    </div>
  )
}