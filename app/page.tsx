import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Activity } from 'lucide-react'

export default async function Home() {
  let session = null

  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
  }

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <Activity className="w-16 h-16 text-blue-600" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            RunReel
          </h1>

          <p className="text-xl text-gray-600 mb-2">
            Transform Your Strava Runs into Stunning Instagram Stories
          </p>

          <p className="text-gray-500 max-w-2xl mx-auto">
            Create beautiful, animated videos from your running routes.
            Connect your Strava account, select a run, and generate a professional
            video ready for Instagram Stories in seconds.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
            Get Started in 3 Easy Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold mb-2">Connect Strava</h3>
              <p className="text-gray-600 text-sm">
                Securely link your Strava account to access your running activities
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold mb-2">Choose a Run</h3>
              <p className="text-gray-600 text-sm">
                Select any of your recent runs to visualize on an interactive map
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold mb-2">Generate Video</h3>
              <p className="text-gray-600 text-sm">
                Create a professional 1080x1920 video perfect for Instagram Stories
              </p>
            </div>
          </div>

          <form
            action={async () => {
              'use server'
              await signIn('strava')
            }}
          >
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Connect with Strava
            </button>
          </form>
        </div>

        <div className="text-center text-gray-600 text-sm">
          <p>
            Free to use • No credit card required • Your data stays secure
          </p>
        </div>
      </div>
    </div>
  )
}