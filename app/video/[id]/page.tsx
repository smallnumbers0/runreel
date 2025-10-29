import { getSession } from '@/lib/simple-auth'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import VideoPlayer from '@/components/VideoPlayer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  if (!session?.user) {
    redirect('/')
  }

  const supabase = await createServerSupabaseClient()

  // Fetch video details
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      *,
      runs (
        id,
        name,
        distance,
        duration
      )
    `)
    .eq('id', id)
    .eq('user_id', session.user.id!)
    .single()

  if (error || !video) {
    redirect('/dashboard')
  }

  if (video.status === 'processing') {
    // Auto-refresh the page every 3 seconds to check if video is ready
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generating Your Video
          </h2>
          <p className="text-gray-600 mb-6">
            Your video will be ready in just a moment...
          </p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Dashboard
          </Link>
          <script dangerouslySetInnerHTML={{
            __html: `setTimeout(() => window.location.reload(), 3000)`
          }} />
        </div>
      </div>
    )
  }

  if (video.status === 'failed' || !video.video_url) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Video Generation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            Something went wrong while generating your video. Please try again.
          </p>
          <Link
            href={`/run/${video.run_id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
          >
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href={`/run/${video.run_id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Run Details
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {video.runs?.name || 'Your Run Video'}
          </h1>
          <p className="text-gray-600">
            Your video is ready! Download it or share directly to Instagram Stories.
          </p>
        </div>

        <VideoPlayer
          videoUrl={video.video_url}
          runName={video.runs?.name || 'RunReel'}
        />
      </main>
    </div>
  )
}