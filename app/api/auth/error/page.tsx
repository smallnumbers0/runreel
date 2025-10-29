import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error || 'Unknown error'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>

        <p className="text-gray-600 mb-2">
          Error: {error}
        </p>

        {error === 'Configuration' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <p className="text-sm text-yellow-800">
              This error typically means:
            </p>
            <ul className="text-sm text-yellow-800 list-disc list-inside mt-2">
              <li>Missing environment variables</li>
              <li>Invalid OAuth credentials</li>
              <li>CSRF token mismatch</li>
            </ul>
          </div>
        )}

        <Link
          href="/"
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}