export const dynamic = 'force-dynamic'

export default function DebugPage() {
  const env = {
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasStravaId: !!process.env.STRAVA_CLIENT_ID,
    stravaId: process.env.STRAVA_CLIENT_ID,
    hasStravaSecret: !!process.env.STRAVA_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(env, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold mb-3">NextAuth Endpoints</h2>
          <div className="space-y-2">
            <a href="/api/auth/signin" className="block text-blue-600 hover:underline">
              /api/auth/signin - Sign In Page
            </a>
            <a href="/api/auth/providers" className="block text-blue-600 hover:underline">
              /api/auth/providers - List Providers
            </a>
            <a href="/api/auth/csrf" className="block text-blue-600 hover:underline">
              /api/auth/csrf - CSRF Token
            </a>
            <a href="/api/auth-test" className="block text-blue-600 hover:underline">
              /api/auth-test - Auth Test
            </a>
            <a href="/api/test" className="block text-blue-600 hover:underline">
              /api/test - Environment Test
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold mb-3">Manual Strava Connect</h2>
          <form action="/api/auth/signin/strava" method="POST">
            <input type="hidden" name="csrfToken" value="" />
            <input type="hidden" name="callbackUrl" value="https://runreel.vercel.app/dashboard" />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              Connect with Strava (Form POST)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}