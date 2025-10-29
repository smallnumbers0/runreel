import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "strava",
      name: "Strava",
      type: "oauth",
      clientId: "104687",
      clientSecret: "93ff8d5c0c02049c5667432fec55a47927e06fda",
      authorization: {
        url: "https://www.strava.com/oauth/authorize",
        params: {
          scope: "read,activity:read_all",
          approval_prompt: "auto",
          response_type: "code",
        }
      },
      token: "https://www.strava.com/oauth/token",
      userinfo: "https://www.strava.com/api/v3/athlete",
      profile(profile: any) {
        return {
          id: profile.id?.toString() || "",
          name: `${profile.firstname || ""} ${profile.lastname || ""}`.trim() || "User",
          email: `${profile.id || "user"}@strava.local`,
          image: profile.profile || profile.profile_medium || null,
        }
      },
    },
  ],
  pages: {
    signIn: "/api/auth/signin",
    error: "/api/auth/error",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: "eZE1+oIEIrWMi0dmGCkMEBHT7ZyKB5wUe1wdy5IQB1s=",
  trustHost: true,
  useSecureCookies: false, // Disable secure cookies for testing
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // Disable secure for testing
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)