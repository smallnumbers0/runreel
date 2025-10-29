export default function SetupPage() {
  const sql = `
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  strava_id BIGINT UNIQUE,
  name TEXT,
  email TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create runs table
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  strava_id BIGINT UNIQUE,
  name TEXT,
  distance REAL,
  duration INTEGER,
  start_date TIMESTAMPTZ,
  polyline TEXT,
  average_speed REAL,
  max_speed REAL,
  total_elevation_gain REAL,
  sport_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_start_date ON runs(start_date);
CREATE INDEX IF NOT EXISTS idx_videos_run_id ON videos(run_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
  `

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Setup</h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Run this SQL in your Supabase Dashboard
          </h2>

          <ol className="list-decimal list-inside mb-6 space-y-2">
            <li>Go to your Supabase Dashboard</li>
            <li>Navigate to SQL Editor</li>
            <li>Paste the SQL below</li>
            <li>Click "Run"</li>
          </ol>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-gray-100 text-sm">
              <code>{sql}</code>
            </pre>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              After running the SQL, go back to the{' '}
              <a href="/dashboard" className="underline font-medium">
                dashboard
              </a>{' '}
              and click "Sync with Strava" to import your runs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}