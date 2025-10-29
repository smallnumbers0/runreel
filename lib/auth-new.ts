import { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"

// Log environment variables (safely)
console.log('AUTH INIT - Environment check:', {
  STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID ? 'SET' : 'MISSING',
  STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET ? 'SET' : 'MISSING',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
  NODE_ENV: process.env.NODE_ENV,
})

const config: NextAuthConfig = {
  providers: [
    {
      id: "strava",
      name: "Strava",
      type: "oauth",
      clientId: process.env.STRAVA_CLIENT_ID || "",
      clientSecret: process.env.STRAVA_CLIENT_SECRET || "",
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
      profile(profile: any) {
        console.log('AUTH - Strava profile received:', profile)
        return {
          id: String(profile.id),
          name: `${profile.firstname} ${profile.lastname}`,
          email: `${profile.id}@strava.local`,
          image: profile.profile || profile.profile_medium,
        }
      },
      checks: ["state"], // Only check state, not PKCE
    },
  ],
  debug: true, // Enable debug logging
  logger: {
    error: (error: any) => {
      console.error('NextAuth Error:', error)
    },
    warn: (warning: any) => {
      console.warn('NextAuth Warning:', warning)
    },
    debug: (message: any) => {
      console.log('NextAuth Debug:', message)
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('AUTH - SignIn callback:', { user, account, profile })
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('AUTH - Redirect callback:', { url, baseUrl })
      // Always allow redirects to our own domain
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/")) return baseUrl + url
      return baseUrl + "/dashboard"
    },
    async jwt({ token, account, profile }) {
      console.log('AUTH - JWT callback:', { token, account, profile })
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      console.log('AUTH - Session callback:', { session, token })
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}

// Wrap NextAuth to catch any initialization errors
let authInstance: any
try {
  authInstance = NextAuth(config)
  console.log('AUTH - NextAuth initialized successfully')
} catch (error) {
  console.error('AUTH - Failed to initialize NextAuth:', error)
  throw error
}

export const { handlers, signIn, signOut, auth } = authInstance
export { config as authConfig }