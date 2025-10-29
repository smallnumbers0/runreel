import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { createServiceSupabaseClient } from "./supabase-server"

interface StravaProfile {
  id: number
  username: string
  resource_state: number
  firstname: string
  lastname: string
  bio: string | null
  city: string
  state: string
  country: string
  sex: string
  premium: boolean
  summit: boolean
  created_at: string
  updated_at: string
  badge_type_id: number
  weight: number | null
  profile_medium: string
  profile: string
  friend: any
  follower: any
}

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "strava",
      name: "Strava",
      type: "oauth",
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        url: "https://www.strava.com/oauth/authorize",
        params: {
          scope: "read,activity:read_all",
          approval_prompt: "auto",
          response_type: "code",
        },
      },
      token: "https://www.strava.com/oauth/token",
      userinfo: "https://www.strava.com/api/v3/athlete",
      profile(profile: StravaProfile) {
        return {
          id: profile.id.toString(),
          name: `${profile.firstname} ${profile.lastname}`,
          email: `${profile.id}@strava.local`, // Strava doesn't provide email
          image: profile.profile,
        }
      },
    },
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "strava") {
        try {
          const supabase = await createServiceSupabaseClient()

          // Store Strava tokens in user_profiles table
          const { error } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.id!,
              strava_athlete_id: parseInt(account.providerAccountId),
              strava_access_token: account.access_token,
              strava_refresh_token: account.refresh_token,
              strava_token_expires_at: account.expires_at
                ? new Date(account.expires_at * 1000).toISOString()
                : null,
            })
            .eq('user_id', user.id!)

          if (error) {
            console.error('Error saving Strava tokens:', error)
            return false
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)