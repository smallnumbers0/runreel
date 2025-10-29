export default function SetupFixPage() {
  const dropSql = `
-- Drop existing tables (if you have any data, export it first!)
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS runs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
  `

  const createSql = `
-- Create user_profiles table
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  strava_id BIGINT UNIQUE,
  name TEXT,
  email TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create runs table
CREATE TABLE runs (
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
CREATE TABLE videos (
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
CREATE INDEX idx_runs_user_id ON runs(user_id);
CREATE INDEX idx_runs_start_date ON runs(start_date);
CREATE INDEX idx_videos_run_id ON videos(run_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);

-- Add foreign key constraints
ALTER TABLE runs
  ADD CONSTRAINT fk_runs_user
  FOREIGN KEY (user_id)
  REFERENCES user_profiles(id)
  ON DELETE CASCADE;

ALTER TABLE videos
  ADD CONSTRAINT fk_videos_run
  FOREIGN KEY (run_id)
  REFERENCES runs(id)
  ON DELETE CASCADE;

ALTER TABLE videos
  ADD CONSTRAINT fk_videos_user
  FOREIGN KEY (user_id)
  REFERENCES user_profiles(id)
  ON DELETE CASCADE;
  `

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fix Database Tables</h1>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold">
            ⚠️ Warning: This will drop and recreate all tables!
          </p>
          <p className="text-red-700 text-sm mt-1">
            If you have any data in your tables, export it first.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 1: Drop Existing Tables
          </h2>

          <p className="mb-4 text-gray-600">
            Run this SQL first to remove any existing tables with incorrect schemas:
          </p>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-gray-100 text-sm">
              <code>{dropSql}</code>
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 2: Create New Tables
          </h2>

          <p className="mb-4 text-gray-600">
            Then run this SQL to create the tables with the correct schema:
          </p>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-gray-100 text-sm">
              <code>{createSql}</code>
            </pre>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              After running both SQL scripts, go back to the{' '}
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