import { getSession } from '@/lib/simple-auth'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Map from '@/components/Map'
import Link from 'next/link'
import { ArrowLeft, Video, Calendar, Clock, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RunDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  if (!session?.user) {
    redirect('/')
  }

  const supabase = await createServerSupabaseClient()

  // Fetch run details
  const { data: run, error } = await supabase
    .from('runs')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id!)
    .single()

  if (error || !run) {
    redirect('/dashboard')
  }

  // Check if video exists
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('run_id', id)
    .eq('status', 'completed')
    .single()

  const typedRun = run as any
  const formattedDistance = (typedRun.distance / 1000).toFixed(2) + ' km'
  const formattedDuration = new Date(typedRun.duration * 1000).toISOString().substr(11, 8)
  const formattedDate = new Date(typedRun.start_date).toLocaleDateString()

  async function generateVideo() {
    'use server'

    const session = await getSession()
    if (!session?.user) return

    const supabase = await createServerSupabaseClient()

    // Create video record
    const { data: newVideo, error } = await supabase
      .from('videos')
      .insert({
        run_id: id,
        user_id: session.user.id,
        status: 'processing',
      } as any)
      .select()
      .single()

    if (!error && newVideo) {
      // Trigger video generation immediately
      // Using a sample video for MVP - replace with actual Remotion rendering
      await supabase
        .from('videos')
        .update({
          status: 'completed',
          video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          thumbnail_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1080&h=1920&fit=crop',
        } as any)
        .eq('id', (newVideo as any).id)

      redirect(`/video/${(newVideo as any).id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>

            {video ? (
              <Link
                href={`/video/${video.id}`}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Video className="w-5 h-5" />
                View Video
              </Link>
            ) : (
              <form action={generateVideo}>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Video className="w-5 h-5" />
                  Generate Video
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Run Details */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{typedRun.name}</h1>

            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-xl font-semibold">{formattedDistance}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-xl font-semibold">{formattedDuration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-xl font-semibold">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-[600px]">
            {typedRun.polyline ? (
              <Map polylineString={typedRun.polyline} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">No route data available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}