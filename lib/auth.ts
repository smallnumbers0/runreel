import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

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
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.id = profile.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)