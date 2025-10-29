import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import RunCard from '@/components/RunCard'
import { Activity, LogOut, RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function syncWithStrava(userId: string) {
  'use server'

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/strava`, {
      headers: {
        'Cookie': `user-id=${userId}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to sync with Strava')
    }
  } catch (error) {
    console.error('Error syncing with Strava:', error)
  }
}

export default async function Dashboard() {
  let session = null

  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
  }

  if (!session?.user) {
    redirect('/')
  }

  const supabase = await createServerSupabaseClient()

  // Fetch user's runs
  const { data: runs, error } = await supabase
    .from('runs')
    .select('*')
    .eq('user_id', session.user.id!)
    .order('start_date', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">RunReel</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {session.user.name}
              </span>

              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Runs</h2>

            <form
              action={async () => {
                'use server'
                await syncWithStrava(session.user!.id!)
                redirect('/dashboard')
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Sync with Strava
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              Error loading runs. Please try again.
            </div>
          )}

          {!error && runs && runs.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No runs yet
              </h3>
              <p className="text-gray-600 mb-6">
                Click "Sync with Strava" to import your running activities
              </p>
            </div>
          )}

          {!error && runs && runs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runs.map((run: any) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}