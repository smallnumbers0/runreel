export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      runs: {
        Row: {
          id: string
          user_id: string
          strava_id: number
          name: string
          distance: number
          duration: number
          polyline: string | null
          start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strava_id: number
          name: string
          distance: number
          duration: number
          polyline?: string | null
          start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          strava_id?: number
          name?: string
          distance?: number
          duration?: number
          polyline?: string | null
          start_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          run_id: string
          user_id: string
          video_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          run_id: string
          user_id: string
          video_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          run_id?: string
          user_id?: string
          video_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          strava_athlete_id: number | null
          strava_access_token: string | null
          strava_refresh_token: string | null
          strava_token_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strava_athlete_id?: number | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          strava_token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          strava_athlete_id?: number | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          strava_token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}