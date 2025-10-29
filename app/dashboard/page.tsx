import { getSession, signOutUser } from '@/lib/simple-auth'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import RunCard from '@/components/RunCard'
import { Activity, LogOut } from 'lucide-react'
import SyncButton from './sync-button'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/')
  }

  const supabase = await createServerSupabaseClient()

  // Fetch user's runs
  let runs = null
  let error = null

  try {
    const result = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('start_date', { ascending: false })
      .limit(10)

    runs = result.data
    error = result.error
  } catch (e: any) {
    error = e
    console.error('Database error:', e)
  }

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
                  await signOutUser()
                  redirect('/')
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

            <SyncButton />
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Database tables may not be set up yet.</p>
              <p className="mt-2">
                Please <a href="/setup" className="underline font-medium">follow the setup instructions</a> to create the necessary tables in Supabase.
              </p>
              <p className="mt-2 text-sm">
                Error details: {error.message || 'Table not found'}
              </p>
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