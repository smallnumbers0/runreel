import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function ReAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-2xl">
              <Activity className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Authentication Required
          </h1>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Your Strava session has expired.</strong>
            </p>
            <p className="text-yellow-700 text-sm mt-2">
              This happens when:
            </p>
            <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
              <li>Access tokens expire (usually after 6 hours)</li>
              <li>You revoked access in Strava settings</li>
              <li>It's been too long since last use</li>
            </ul>
          </div>

          <p className="text-gray-600 text-center mb-6">
            Please sign in again to continue using RunReel.
          </p>

          <Link
            href="/api/auth/strava"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-3 block text-center"
          >
            <svg className="w-6 h-6 inline" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Reconnect with Strava
          </Link>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}