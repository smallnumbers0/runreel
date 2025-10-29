import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServiceSupabaseClient()

    // Create tables if they don't exist
    const createTables = `
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
        user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
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
        run_id TEXT REFERENCES runs(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
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

      -- Enable RLS
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
        FOR ALL USING (id = current_setting('app.user_id', true)::TEXT);

      CREATE POLICY IF NOT EXISTS "Users can view own runs" ON runs
        FOR ALL USING (user_id = current_setting('app.user_id', true)::TEXT);

      CREATE POLICY IF NOT EXISTS "Users can view own videos" ON videos
        FOR ALL USING (user_id = current_setting('app.user_id', true)::TEXT);
    `

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: createTables
    }).single()

    if (error && error.message.includes('function public.exec_sql does not exist')) {
      // If exec_sql doesn't exist, try direct approach
      // Note: This might not work depending on Supabase permissions
      return NextResponse.json({
        message: 'Please run the following SQL in Supabase dashboard:',
        sql: createTables,
        note: 'Go to Supabase Dashboard > SQL Editor and paste this SQL'
      })
    }

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Database setup complete',
      tables: ['user_profiles', 'runs', 'videos']
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database setup failed',
      details: error.message
    }, { status: 500 })
  }
}