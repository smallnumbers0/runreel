'use client'

import { useState, useEffect } from 'react'

export default function DebugDataPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/debug-sync')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading debug data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Strava Sync Debug</h1>

        {data?.error ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold text-lg mb-2">
                Error: {data.error}
              </p>
              {data.status && (
                <p className="text-red-700">
                  Status Code: {data.status} - {data.statusText}
                </p>
              )}
              {data.details && (
                <p className="text-red-600 text-sm mt-2">
                  Details: {data.details}
                </p>
              )}
            </div>

            {data.possibleCauses && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-800 mb-2">Possible Causes:</p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {data.possibleCauses.map((cause: string, i: number) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.solution && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-800 mb-2">Solution:</p>
                <p className="text-blue-700">{data.solution}</p>

                <div className="mt-4 flex gap-3">
                  {data.status === 401 && (
                    <>
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/auth/refresh')
                          const result = await res.json()
                          if (result.success) {
                            window.location.reload()
                          } else {
                            alert('Please sign in again')
                            window.location.href = '/'
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        Try Refresh Token
                      </button>

                      <a
                        href="/"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg inline-block"
                      >
                        Sign In Again
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Latest Activity from Strava API</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Summary (List API):</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(data?.summary, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Detailed (Individual API):</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(data?.detailed, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Database:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(data?.database, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Debug Info:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(data?.debug, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>What to check:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>• Does the detailed API have polyline data?</li>
                <li>• Is the polyline being saved to the database?</li>
                <li>• Are the dates formatted correctly?</li>
                <li>• Is the access token valid?</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <a
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Back to Dashboard
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh Debug Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}